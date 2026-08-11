import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

// Stripe posts here directly (no browser), so no CORS needed.
Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2025-08-27.basil",
  });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (e) {
    console.error("Invalid Stripe signature", e);
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only a genuinely paid session counts.
      if (session.payment_status !== "paid") {
        console.log("Session not paid yet", session.id, session.payment_status);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const { data: booking } = await admin
        .from("bookings")
        .update({
          status: "paid",
          amount_total: session.amount_total,
          currency: session.currency ?? "usd",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id)
        .select("*")
        .maybeSingle();

      if (booking && !booking.confirmation_email_sent) {
        const sent = await sendConfirmationEmail(booking);
        if (sent) {
          await admin.from("bookings").update({ confirmation_email_sent: true }).eq("id", booking.id);
        }
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      await admin
        .from("bookings")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stripe-webhook handler error", e);
    return new Response("Webhook handler error", { status: 500 });
  }
});

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const FROM = "Mad Monkey Siargao <bookings@siargo.surfcamp.madmonkeyhostels.com>";
const REPLY_TO = "cs@madmonkeyhostels.co";

// deno-lint-ignore no-explicit-any
async function sendConfirmationEmail(booking: any): Promise<boolean> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableApiKey || !resendApiKey) {
    console.error("Resend connector env vars missing — skipping email for booking", booking.id);
    return false;
  }

  const amount = booking.amount_total
    ? `${(booking.amount_total / 100).toFixed(2)} ${String(booking.currency).toUpperCase()}`
    : "";


  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h1 style="font-size:22px">Your Siargao Surf Camp booking is confirmed 🏄</h1>
      <p>Hi ${escapeHtml(booking.guest_name)},</p>
      <p>We've received your payment and your spot is locked in.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0"><strong>Package</strong></td><td>${escapeHtml(booking.package_name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Guests</strong></td><td>${booking.guests}</td></tr>
        ${booking.arrival_date ? `<tr><td style="padding:4px 12px 4px 0"><strong>Arrival</strong></td><td>${escapeHtml(booking.arrival_date)}</td></tr>` : ""}
        ${amount ? `<tr><td style="padding:4px 12px 4px 0"><strong>Paid</strong></td><td>${amount}</td></tr>` : ""}
        <tr><td style="padding:4px 12px 4px 0"><strong>Reference</strong></td><td>${booking.id}</td></tr>
      </table>
      <p>See you in Siargao!</p>
    </div>`;

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": resendApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [booking.guest_email],
      reply_to: REPLY_TO,
      subject: "Booking confirmed — Siargao Surf Camp",
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend gateway error", res.status, await res.text());
    return false;
  }
  return true;
}


function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}
