"use client";

import { useId, useState } from "react";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SubscriptionCoupon } from "@/hooks/use-subscription-coupon";

/* "Have a coupon code?" on the subscription checkout. Razorpay Checkout has
   no coupon field of its own, so the code is entered here, before it opens;
   state lives in useSubscriptionCoupon so the page can send the code with
   the subscription and keep its button disabled while one is being checked. */

type CouponFieldProps = {
  coupon: SubscriptionCoupon;
  /** The checkout is starting or open: the coupon can't change under it. */
  disabled?: boolean;
};

export function CouponField({ coupon, disabled = false }: CouponFieldProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputId = useId();
  const errorId = useId();

  if (coupon.applied) {
    return (
      <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-line-control bg-card pl-3.5 text-[14.5px]">
        <p className="flex min-w-0 items-center gap-2 text-ink" role="status">
          {coupon.checking ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-soft" aria-hidden />
          ) : (
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
          )}
          <span className="min-w-0 truncate">{coupon.applied.label} applied</span>
        </p>
        <button
          type="button"
          onClick={() => {
            coupon.remove();
            setOpen(true);
          }}
          disabled={disabled}
          aria-label={`Remove coupon ${coupon.applied.code}`}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-50"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  // A refusal from subscribing reopens the field, so its reason is never hidden.
  if (!open && !coupon.error) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="-ml-1 inline-flex min-h-11 items-center px-1 text-small text-ink-soft underline decoration-[#d4cfc4] underline-offset-[3px] transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-50"
      >
        Have a coupon code?
      </button>
    );
  }

  const busy = disabled || coupon.applying;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void coupon.apply(value);
      }}
    >
      <label htmlFor={inputId} className="text-[13px] text-ink-soft">
        Coupon code
      </label>
      <div className="mt-1.5 flex gap-2">
        <Input
          id={inputId}
          name="coupon"
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (coupon.error) coupon.clearError();
          }}
          // Opened by a tap on "Have a coupon code?": straight to typing.
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={64}
          placeholder="Enter code"
          disabled={busy}
          aria-invalid={coupon.error ? true : undefined}
          aria-describedby={coupon.error ? errorId : undefined}
          // 16px on phones: iOS zooms into any smaller input on focus.
          className="h-11 min-w-0 flex-1 rounded-lg border-line-control bg-card px-3.5 text-base uppercase tracking-[0.02em] text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-faint focus-visible:ring-ink/20 md:text-[15px]"
        />
        <Button
          type="submit"
          variant="outline"
          disabled={busy || !value.trim()}
          aria-busy={coupon.applying || undefined}
          className="h-11 shrink-0 rounded-lg px-4"
        >
          {coupon.applying ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Applying…
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      {coupon.error ? (
        <p id={errorId} role="alert" className="mt-2 text-[13.5px] leading-[1.5] text-destructive">
          {coupon.error}
        </p>
      ) : null}
    </form>
  );
}
