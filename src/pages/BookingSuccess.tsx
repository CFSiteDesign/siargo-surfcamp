import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Booking = {
  id: string;
  guest_name: string;
  package_name: string;
  guests: number;
  arrival_date: string | null;
  amount_total: number | null;
  currency: string;
};

const BookingSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"loading" | "paid" | "unpaid">("loading");
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    document.title = "Booking confirmed | Siargao Surf Camp";
    if (!sessionId) {
      setState("unpaid");
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke(
        `verify-booking-payment?session_id=${encodeURIComponent(sessionId)}`,
        { method: "GET" },
      );
      if (cancelled) return;
      if (error || !data?.paid) {
        setState("unpaid");
        return;
      }
      setBooking(data.booking ?? null);
      setState("paid");
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">
        {state === "loading" && (
          <p className="text-muted-foreground">Confirming your payment…</p>
        )}

        {state === "unpaid" && (
          <>
            <h1 className="text-3xl font-semibold mb-3">We couldn't confirm this payment</h1>
            <p className="text-muted-foreground mb-8">
              If you were charged, your confirmation email will arrive shortly. Otherwise your
              booking was not completed.
            </p>
            <Link to="/" className="underline underline-offset-4">
              Back to the surf camp
            </Link>
          </>
        )}

        {state === "paid" && (
          <>
            <h1 className="text-3xl font-semibold mb-3">Payment complete 🏄</h1>
            <p className="text-muted-foreground mb-8">
              Thanks{booking ? `, ${booking.guest_name}` : ""} — your spot is locked in. A
              confirmation email is on its way.
            </p>

            {booking && (
              <dl className="text-left rounded-lg border p-5 space-y-2 mb-8">
                <Row label="Package" value={booking.package_name} />
                <Row label="Guests" value={String(booking.guests)} />
                {booking.arrival_date && <Row label="Arrival" value={booking.arrival_date} />}
                {booking.amount_total != null && (
                  <Row
                    label="Paid"
                    value={`${(booking.amount_total / 100).toFixed(2)} ${booking.currency.toUpperCase()}`}
                  />
                )}
                <Row label="Reference" value={booking.id} />
              </dl>
            )}

            <Link to="/" className="underline underline-offset-4">
              Back to the surf camp
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-6 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-medium break-all">{value}</dd>
  </div>
);

export default BookingSuccess;
