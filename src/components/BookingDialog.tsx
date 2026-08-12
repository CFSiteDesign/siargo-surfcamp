import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Props = {
  packageName: string;
  /** Unit price per person, in the smallest currency unit (centavos). */
  amount: number;
  currency?: string;
  className?: string;
  children: React.ReactNode;
};

/** Trips start on Saturdays only — every other day is blocked in the picker. */
const isSaturday = (d: Date) => d.getDay() === 6;

/**
 * Collects the minimum guest details and hands off to Stripe Checkout.
 * All pricing and session creation happens server-side in the
 * `create-booking-checkout` edge function — nothing here is trusted.
 */
export default function BookingDialog({
  packageName, amount, currency = 'php', className, children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [form, setForm] = useState({ guest_name: '', guest_email: '', guests: 1 });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !isSaturday(date)) {
      toast.error('Trips start on Saturdays — please pick a Saturday arrival date.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: {
          guest_name: form.guest_name.trim(),
          guest_email: form.guest_email.trim(),
          package_name: packageName,
          guests: Number(form.guests) || 1,
          arrival_date: format(date, 'yyyy-MM-dd'),
          amount,
          currency,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error("We couldn't start checkout. Please try again or email cs@madmonkeyhostels.co");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={className}>{children}</button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-2 border-ink bg-cream">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase">{packageName}</DialogTitle>
          <DialogDescription>
            Enter your details and you'll be taken to our secure Stripe checkout.
          </DialogDescription>
        </DialogHeader>

        {/* Saturday-only rule, stated before anyone touches the calendar. */}
        <p className="rounded-xl border-2 border-ink bg-yellow px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
          Trips start on Saturdays only
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="guest_name">Full name</Label>
            <Input id="guest_name" required maxLength={200} value={form.guest_name}
              onChange={e => set('guest_name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guest_email">Email</Label>
            <Input id="guest_email" type="email" required maxLength={255} value={form.guest_email}
              onChange={e => set('guest_email', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="guests">Guests</Label>
              <Input id="guests" type="number" min={1} max={20} required value={form.guests}
                onChange={e => set('guests', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Arrival (Saturday)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-left text-sm"
                  >
                    {date ? format(date, 'EEE d MMM yyyy') : 'Pick a Saturday'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-2 border-ink bg-cream p-0" align="start">
                  <p className="border-b-2 border-ink px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em]">
                    Saturdays only — all other days are unavailable
                  </p>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || !isSaturday(d)}
                    modifiers={{ saturday: isSaturday }}
                    modifiersClassNames={{ saturday: 'font-bold ring-1 ring-ink/40' }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border-2 border-ink bg-lilac py-4 font-display text-[13px] uppercase tracking-[0.12em] text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? 'Starting checkout…' : 'Continue to payment'}
          </button>
          <p className="text-center text-xs text-ink/60">
            Secure payment by Stripe. Total: {(amount * (Number(form.guests) || 1) / 100).toLocaleString('en-PH', { style: 'currency', currency: currency.toUpperCase() })}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
