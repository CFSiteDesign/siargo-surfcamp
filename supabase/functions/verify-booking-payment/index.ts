import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const QuerySchema = z.object({ session_id: z.string().min(10).max(200) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse({ session_id: url.searchParams.get("session_id") ?? "" });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid session_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2025-08-27.basil",
    });

    // Source of truth is Stripe itself, not anything the browser sends.
    const session = await stripe.checkout.sessions.retrieve(parsed.data.session_id);
    const paid = session.payment_status === "paid";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: booking } = await admin
      .from("bookings")
      .select("id, guest_name, guest_email, package_name, guests, arrival_date, amount_total, currency, status")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (paid && booking && booking.status !== "paid") {
      await admin
        .from("bookings")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", booking.id);
    }

    return new Response(
      JSON.stringify({
        paid,
        booking: paid && booking ? { ...booking, status: "paid" } : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verify-booking-payment error", e);
    return new Response(JSON.stringify({ error: "Could not verify payment" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
