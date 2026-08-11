import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const BodySchema = z.object({
  guest_name: z.string().min(1).max(200),
  guest_email: z.string().email().max(255),
  package_name: z.string().min(1).max(200),
  guests: z.number().int().min(1).max(20).default(1),
  arrival_date: z.string().max(20).optional().nullable(),
  amount: z.number().int().min(100).max(10_000_00), // unit price in cents
  currency: z.string().length(3).default("usd"),
});

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
        package_name: b.package_name,
        guests: b.guests,
        arrival_date: b.arrival_date || null,
        amount_total: b.amount * b.guests,
        currency: b.currency.toLowerCase(),
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
            currency: b.currency.toLowerCase(),
            unit_amount: b.amount,
            product_data: { name: b.package_name },
          },
        },
      ],
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
