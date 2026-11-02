"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ApiError } from "@/lib/Api";
import type { BillingCycle } from "@/lib/pricing";
import { validateSubscriptionCoupon, type AppliedCoupon } from "@/lib/services";

/* The coupon on the subscription checkout. The browser only ever holds a
   code and the label to show for it: the backend maps the code to a
   Razorpay offer, and checks it again when the subscription is created —
   a code it refuses then is a 400, never a subscription at full price.

   Usage, on the page that starts the subscription:

     const coupon = useSubscriptionCoupon(billingCycle);
     <CouponField coupon={coupon} disabled={busy} />
     <Button disabled={busy || coupon.checking} onClick={subscribe}>…</Button>

     // in subscribe():
     try {
       const data = await createSubscription(billingCycle, coupon.applied?.code);
       // open Razorpay Checkout with data.subscription_id, as before
     } catch (err) {
       const refusal = couponRefusal(err);
       if (refusal) return coupon.reject(refusal); // shown at the field
       …
     }
*/

/** The backend's reason a code doesn't apply, or null if `err` is something else. */
export function couponRefusal(err: unknown): string | null {
  if (!(err instanceof ApiError) || err.status !== 400) return null;
  const body = err.body as { code?: string; message?: string } | null;
  if (body?.code !== "COUPON_INVALID") return null;
  return body.message || "That coupon code isn't valid.";
}

function checkFailure(err: unknown): string {
  const refusal = couponRefusal(err);
  if (refusal) return refusal;
  if (err instanceof ApiError) {
    if (err.status === 401) return "Please sign in again to use a coupon.";
    if (err.status === 429) return "Too many tries in a short time. Please wait a few minutes and try again.";
    return "We couldn't check that code right now. Please try again in a moment.";
  }
  return "We couldn't reach Socrate. Check your connection and try again.";
}

/** An applied coupon, and the billing cycle it was checked against. */
type Applied = AppliedCoupon & { billingCycle: BillingCycle };

export function useSubscriptionCoupon(billingCycle: BillingCycle) {
  const [applied, setApplied] = useState<Applied | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const applyingRef = useRef(false);

  // Applied for another billing cycle than the one now chosen: being checked
  // again (the effect below). Until it settles the checkout must wait.
  const rechecking = applied !== null && applied.billingCycle !== billingCycle;

  useEffect(() => {
    if (!applied || applied.billingCycle === billingCycle) return;
    let cancelled = false;
    validateSubscriptionCoupon(applied.code, billingCycle).then(
      (res) => {
        if (!cancelled) setApplied({ code: res.code, label: res.label, billingCycle });
      },
      (err) => {
        if (cancelled) return;
        const refusal = couponRefusal(err);
        if (refusal) {
          setApplied(null);
          setError(refusal);
        } else {
          // Couldn't ask (offline, rate-limited): keep it. The backend checks
          // the code again on subscribe, so nothing can slip through here.
          setApplied({ ...applied, billingCycle });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [applied, billingCycle]);

  const apply = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim();
      if (applyingRef.current) return;
      if (!code) {
        setError("Enter a coupon code.");
        return;
      }
      applyingRef.current = true;
      setApplying(true);
      setError(null);
      try {
        const res = await validateSubscriptionCoupon(code, billingCycle);
        setApplied({ code: res.code, label: res.label, billingCycle });
      } catch (err) {
        setApplied(null);
        setError(checkFailure(err));
      } finally {
        applyingRef.current = false;
        setApplying(false);
      }
    },
    [billingCycle],
  );

  const remove = useCallback(() => {
    setApplied(null);
    setError(null);
  }, []);

  /** The backend refused the code when subscribing: show why, at the field. */
  const reject = useCallback((message: string) => {
    setApplied(null);
    setError(message);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const shown = useMemo<AppliedCoupon | null>(
    () => (applied ? { code: applied.code, label: applied.label } : null),
    [applied],
  );

  return {
    applied: shown,
    error,
    /** Applying, or re-checking after a billing-cycle switch: keep Subscribe disabled. */
    checking: applying || rechecking,
    applying,
    apply,
    remove,
    reject,
    clearError,
  };
}

export type SubscriptionCoupon = ReturnType<typeof useSubscriptionCoupon>;
