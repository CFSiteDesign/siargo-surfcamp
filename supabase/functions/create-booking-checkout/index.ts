import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const BodySchema = z.object({
  guest_name: z.string().min(1).max(200),
  guest_email: z.string().email().max(255),
  package_name: z.string().min(1).max(200),
  guests: z.number().int().min(1).max(20).default(1),
  // Trips start on Saturdays only — enforced here as well as in the UI.
  arrival_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((s) => new Date(`${s}T00:00:00Z`).getUTCDay() === 6, {
      message: "Arrival date must be a Saturday",
    }),
  // The browser also sends `amount` and `currency`. They are deliberately not in
  // this schema (zod strips them): the price charged comes from PACKAGES below.
});

/**
 * What we actually charge, per person, in centavos, keyed by tour length.
 * Keep in step with PACKAGES in src/pages/Index.tsx, which only displays prices.
 */
const PACKAGES: Record<string, { name: string; amount: number }> = {
  "7": { name: "Siargao Surf Camp — 7 Days / 6 Nights", amount: 3_300_000 },
  "4": { name: "Siargao Surf Camp — 4 Days / 3 Nights", amount: 2_400_000 },
};
const CURRENCY = "php";

/** Tour length read off the package name, e.g. "Siargao Surf Camp — 7 Days / 6 Nights" → "7". */
function packageFor(packageName: string) {
  const m = packageName.match(/(\d+)\s*[-\s]?\s*day/i);
  return m ? PACKAGES[m[1]] : undefined;
}

const SITE_URL = "https://madmonkeyhostels.com/philippines/siargao-surf-camp";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const b = parsed.data;

    const pkg = packageFor(b.package_name);
    if (!pkg) {
      return new Response(JSON.stringify({ error: { package_name: ["Unknown package"] } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: booking, error } = await admin
      .from("bookings")
      .insert({
        guest_name: b.guest_name,
        guest_email: b.guest_email,
        package_name: pkg.name,
        guests: b.guests,
        arrival_date: b.arrival_date || null,
        amount_total: pkg.amount * b.guests,
        currency: CURRENCY,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    const origin = req.headers.get("origin") ?? SITE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: b.guest_email,
      line_items: [
        {
          quantity: b.guests,
          price_data: {
            currency: CURRENCY,
            unit_amount: pkg.amount,
            product_data: { name: pkg.name },
          },
        },
      ],
      // Shows the "Add promotion code" field; codes are created in the Stripe dashboard.
      allow_promotion_codes: true,
      metadata: { booking_id: booking.id },
      payment_intent_data: { metadata: { booking_id: booking.id } },
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/cancelled`,
    });

    await admin.from("bookings").update({ stripe_session_id: session.id }).eq("id", booking.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-booking-checkout error", e);
    return new Response(JSON.stringify({ error: "Could not start checkout" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
