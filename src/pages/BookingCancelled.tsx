import { useEffect } from "react";
import { Link } from "react-router-dom";

const BookingCancelled = () => {
  useEffect(() => {
    document.title = "Booking cancelled | Siargao Surf Camp";
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-semibold mb-3">Booking not completed</h1>
        <p className="text-muted-foreground mb-8">
          No payment was taken. You can pick up where you left off whenever you're ready.
        </p>
        <Link to="/" className="underline underline-offset-4">
          Back to the surf camp
        </Link>
      </div>
    </main>
  );
};

export default BookingCancelled;
