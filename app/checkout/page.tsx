"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/site/primitives";
import { useUser } from "@/components/provider/authoprovider";
import {
  BackLink,
  CheckoutColumn,
  CheckoutFrame,
  PanelAction,
  StatusPanel,
  SupportLine,
} from "@/components/checkout/checkout-ui";
import { CouponField } from "@/components/checkout/coupon-field";
import { couponRefusal, useSubscriptionCoupon } from "@/hooks/use-subscription-coupon";
import { ApiError } from "@/lib/Api";
import { APP_URL, safeInternalPath } from "@/lib/navigation";
import { failureFromCheckout, failureMessage, formatAmount, formatDate, periodLabel, planTagline } from "@/lib/payment";
import type { BillingCycle } from "@/lib/pricing";
import {
  createSubscription,
  getSubscriptionCheckoutStatus,
  getSubscriptionSummary,
  GetMemberPlans,
  MemberPlan,
  SubscriptionStatus,
  SubscriptionSummaryResponse,
  verifySubscription,
} from "@/lib/services";
import type { RazorpayPaymentResponse } from "@/types/razorpay";
import { cn } from "@/lib/utils";

/* ─── /checkout?planId=…&cycle=…&returnTo=…&subscription=… ───
   A subscription with a free trial: the browser picks a billing cycle (and
   maybe a coupon); the backend creates the Razorpay subscription, and alone
   decides when the trial has started. The reader authorises autopay in
   Razorpay Checkout; nothing is charged until the trial ends. Once a
   subscription exists its id joins the URL, so a refresh — or signing in
   again — picks up where it stands instead of starting over.

   Nothing here shows "started" or "failed" on the browser's say-so alone:
   success waits for the backend, and anything uncertain (a closed window, a
   UPI mandate still out, a lost connection) is checked with the backend
   until it settles or we say plainly that it's still being confirmed. */

const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => {
        razorpayScriptPromise = null;
        script.remove();
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

const CYCLES: BillingCycle[] = ["monthly", "yearly"];
const PERIOD: Record<BillingCycle, string> = { monthly: "month", yearly: "year" };
const DAY_MS = 24 * 60 * 60 * 1000;

/** The statuses in which the trial (or the paid plan after it) is running. */
const GRANTED = new Set<SubscriptionStatus>(["trialing", "active"]);

const isCycle = (value: string | null): value is BillingCycle => value === "monthly" || value === "yearly";

type Phase =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "load-error"; network: boolean }
  | { kind: "already-active"; until: string | null }
  /** The plan summary and Start button; `notice` explains a start that didn't work. */
  | { kind: "ready"; notice?: string }
  /** Creating the subscription and loading Razorpay. */
  | { kind: "starting" }
  /** Razorpay's window is open. */
  | { kind: "open" }
  | { kind: "verifying"; after: Origin }
  /** `trial`: a free trial began; otherwise the first charge was taken in Checkout. */
  | { kind: "success"; trial: boolean; trialEnd: string | null; coupon: string | null }
  | { kind: "failed"; reason: string }
  | { kind: "cancelled" }
  /** Still not settled after waiting: never called a failure. */
  | { kind: "pending"; unverified: boolean }
  | { kind: "session-expired" };

/** What sent us to ask the backend: a success callback (verified or not), a closed window, or a reload. */
type Origin = "payment" | "unverified" | "dismiss" | "resume";

/* The phases in which nothing has been authorised: a sign-out elsewhere
   simply shows the sign-in prompt. After that we keep going — the backend's
   401 then says "sign in again", with the subscription kept safe. */
const BEFORE_PAYMENT = new Set<Phase["kind"]>(["loading", "unavailable", "load-error", "already-active", "ready"]);

/* About half a minute of asking, quickly at first. A UPI Autopay mandate
   approved in the app, or a webhook a little late, usually lands inside this. */
const POLL_DELAYS_MS = [0, 1500, 2000, 2500, 3000, 3000, 4000, 4000, 5000, 5000];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const errorCode = (err: unknown) =>
  err instanceof ApiError ? (err.body as { code?: string } | null)?.code : undefined;

function backLabel(path: string) {
  const pathname = path.split(/[?#]/)[0];
  if (pathname === "/pricing") return "Back to pricing";
  if (pathname === "/") return "Back to home";
  return "Go back";
}

/** Where "Back" goes: ?returnTo=, else the page on this site that sent the reader here, else pricing. */
function useReturnPath(param: string | null) {
  const fromParam = useMemo(() => {
    const path = safeInternalPath(param, "");
    return path && !/^\/(checkout|login)(\/|\?|#|$)/.test(path) ? path : "";
  }, [param]);
  const [fromReferrer, setFromReferrer] = useState("");

  useEffect(() => {
    if (fromParam || !document.referrer) return;
    try {
      const ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) return;
      const path = safeInternalPath(`${ref.pathname}${ref.search}`, "");
      if (path && !/^\/(checkout|login)(\/|\?|#|$)/.test(path)) setFromReferrer(path);
    } catch {
      // No usable referrer: pricing it is.
    }
  }, [fromParam]);

  return fromParam || fromReferrer || "/pricing";
}

/** The cycle to open on: ?cycle= if it's sold, else the one /pricing's planId names, else the first. */
function initialCycle(summary: SubscriptionSummaryResponse, cycleParam: string | null, planId: string | null) {
  if (isCycle(cycleParam) && summary.cycles[cycleParam]) return cycleParam;
  const sold = CYCLES.filter((c) => summary.cycles[c]);
  return sold.find((c) => planId && summary.cycles[c]?.planId === planId) ?? sold[0] ?? null;
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");
  const cycleParam = searchParams.get("cycle");
  const returnParam = searchParams.get("returnTo");
  const subscriptionParam = searchParams.get("subscription");
  const backHref = useReturnPath(returnParam);

  const { userInfo, isLoading: sessionLoading, refresh } = useUser();
  const signedIn = !!userInfo;

  const [plans, setPlans] = useState<MemberPlan[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummaryResponse | null>(null);
  const [cycle, setCycle] = useState<BillingCycle | null>(null);
  /** When the summary was loaded: the trial's end is counted from it. */
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  const coupon = useSubscriptionCoupon(cycle ?? "monthly");

  /* Every step carries the run it belongs to. A newer run (Start again, a
     reload, leaving the page) quietly retires the older one, so a late
     answer can never overwrite where the reader is now. */
  const run = useRef(0);
  const starting = useRef(false);
  const subscriptionId = useRef<string | null>(subscriptionParam);
  /** The coupon the running subscription was created with, for the success screen. */
  const startedCoupon = useRef<string | null>(null);
  const loadedFor = useRef<string | null>(null);
  // Read inside the load effect, which runs once per plan: the latest value
  // without making the URL's cycle a reason to load again.
  const cycleParamRef = useRef(cycleParam);
  useEffect(() => {
    cycleParamRef.current = cycleParam;
  }, [cycleParam]);

  useEffect(() => () => void run.current++, []);

  // The full plan list, for the features.
  useEffect(() => {
    let cancelled = false;
    GetMemberPlans()
      .then((res) => {
        if (!cancelled) setPlans(res.data.PlanList);
      })
      .catch(() => {
        // Non-fatal — the features list just won't render.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = cycle ? summary?.cycles[cycle] ?? null : null;
  const currentPlan = useMemo(() => plans.find((p) => p._id === selected?.planId) ?? null, [plans, selected]);
  const soldCycles = summary ? CYCLES.filter((c) => summary.cycles[c]) : [];

  /** This page's URL, with the subscription (or without one). */
  const checkoutUrl = useCallback(
    (subscription: string | null, nextCycle: BillingCycle | null = cycle) => {
      const params = new URLSearchParams();
      if (planId) params.set("planId", planId);
      if (nextCycle) params.set("cycle", nextCycle);
      if (returnParam) params.set("returnTo", returnParam);
      if (subscription) params.set("subscription", subscription);
      return `/checkout?${params.toString()}`;
    },
    [planId, returnParam, cycle],
  );

  const forgetSubscription = useCallback(() => {
    subscriptionId.current = null;
    router.replace(checkoutUrl(null), { scroll: false });
  }, [checkoutUrl, router]);

  /* The backend says the session is gone: tell the rest of the site too, or
     /login would see the stale sign-in and send the reader straight back. */
  const sessionEnded = useCallback(() => {
    void refresh({ quiet: true });
    setPhase({ kind: "session-expired" });
  }, [refresh]);

  const finishStarted = useCallback(
    async (id: number, status: SubscriptionStatus, trialEnd: string | null, couponCode: string | null) => {
      // Pick up the new plan for the nav; the subscription itself has already started.
      await refresh({ quiet: true });
      if (run.current === id) {
        setPhase({ kind: "success", trial: status === "trialing", trialEnd, coupon: startedCoupon.current ?? couponCode });
      }
    },
    [refresh],
  );

  /** Ask the backend until the trial has started, or say it's still being confirmed. */
  const settle = useCallback(
    async (subscription: string, after: Origin) => {
      const id = ++run.current;
      setPhase({ kind: "verifying", after });

      for (const delay of POLL_DELAYS_MS) {
        if (delay) await wait(delay);
        if (run.current !== id) return;

        let status;
        try {
          status = (await getSubscriptionCheckoutStatus(subscription)).subscription;
        } catch (err) {
          if (run.current !== id) return;
          if (err instanceof ApiError && err.status === 401) return sessionEnded();
          if (err instanceof ApiError && err.status === 404) {
            // Not a subscription of this account (an old link, another account's URL).
            forgetSubscription();
            return setPhase({ kind: "ready" });
          }
          continue; // the network or the backend: ask again
        }
        if (run.current !== id) return;

        if (GRANTED.has(status.status)) return finishStarted(id, status.status, status.trialEnd ?? null, status.couponCode);
        if (status.status === "pending") {
          // Nothing authorised: a closed window was a cancellation, a reload
          // is simply the checkout again. After a success callback the
          // webhook may still be on its way — keep asking.
          if (after === "dismiss") return setPhase({ kind: "cancelled" });
          if (after === "resume") return setPhase({ kind: "ready" });
          continue;
        }
        // Cancelled, halted, expired: this one is over. Nothing was charged for it.
        forgetSubscription();
        return setPhase({
          kind: "ready",
          notice: "That checkout can't be used any more. Start again — you haven't been charged.",
        });
      }
      if (run.current === id) setPhase({ kind: "pending", unverified: after === "unverified" });
    },
    [finishStarted, forgetSubscription, sessionEnded],
  );

  /* Load the prices (and, after a reload, where a subscription stands) once
     per plan — not again when the session object changes under us. */
  useEffect(() => {
    if (sessionLoading || !signedIn) return;
    const key = `${planId ?? ""}:${reloadToken}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;

    const id = ++run.current;
    let finished = false;
    setPhase({ kind: "loading" });

    (async () => {
      try {
        const resume = subscriptionId.current;
        const [summaryResult, statusResult] = await Promise.allSettled([
          getSubscriptionSummary(),
          resume ? getSubscriptionCheckoutStatus(resume) : Promise.resolve(null),
        ]);
        if (run.current !== id) return;

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value);
          setLoadedAt(Date.now());
          setCycle(initialCycle(summaryResult.value, cycleParamRef.current, planId));
        }

        // A subscription in the URL: where it stands comes first.
        if (resume) {
          if (statusResult.status === "fulfilled" && statusResult.value) {
            const { status, trialEnd, couponCode, billingCycle } = statusResult.value.subscription;
            if (billingCycle && summaryResult.status === "fulfilled" && summaryResult.value.cycles[billingCycle]) {
              setCycle(billingCycle);
            }
            if (GRANTED.has(status)) return finishStarted(id, status, trialEnd ?? null, couponCode);
            // "pending": nothing authorised yet — show the checkout. Anything
            // else is over: start afresh.
            if (status !== "pending") forgetSubscription();
          } else if (statusResult.status === "rejected") {
            const err = statusResult.reason;
            if (err instanceof ApiError && err.status === 401) return sessionEnded();
            if (err instanceof ApiError && err.status === 404) forgetSubscription();
            else return void settle(resume, "resume");
          }
        }

        if (summaryResult.status === "rejected") {
          const err = summaryResult.reason;
          if (err instanceof ApiError && err.status === 404) return setPhase({ kind: "unavailable" });
          if (err instanceof ApiError && err.status === 401) return sessionEnded();
          return setPhase({ kind: "load-error", network: !(err instanceof ApiError) });
        }

        const loaded = summaryResult.value;
        // /pricing named a plan this checkout doesn't sell.
        if (planId && !CYCLES.some((c) => loaded.cycles[c]?.planId === planId)) return setPhase({ kind: "unavailable" });
        if (loaded.alreadySubscribed) return setPhase({ kind: "already-active", until: loaded.activeUntil ?? null });
        setPhase({ kind: "ready" });
      } finally {
        finished = true;
      }
    })();

    // Interrupted before it finished (Strict Mode's rehearsal unmount, or
    // the inputs changing): let the next run load again.
    return () => {
      if (!finished) loadedFor.current = null;
    };
  }, [sessionLoading, signedIn, planId, reloadToken, settle, finishStarted, forgetSubscription, sessionEnded]);

  /** Razorpay's success callback: the backend checks the signature, or we ask where the subscription stands. */
  const confirmAuthorisation = useCallback(
    async (subscription: string, response: RazorpayPaymentResponse) => {
      const id = ++run.current;
      setPhase({ kind: "verifying", after: "payment" });
      let after: Origin = "payment";
      try {
        const verified = await verifySubscription(response);
        if (run.current !== id) return;
        if (verified?.success && GRANTED.has(verified.status)) {
          return finishStarted(id, verified.status, verified.trial_end ?? null, null);
        }
      } catch (err) {
        if (run.current !== id) return;
        if (err instanceof ApiError && err.status === 401) return sessionEnded();
        if (errorCode(err) === "VERIFICATION_FAILED") after = "unverified";
      }
      return settle(subscription, after);
    },
    [finishStarted, settle, sessionEnded],
  );

  const { applied: appliedCoupon, checking: couponChecking, reject: rejectCoupon } = coupon;

  const startTrial = useCallback(async () => {
    if (!cycle || starting.current || couponChecking) return;
    starting.current = true;
    const id = ++run.current;
    setPhase({ kind: "starting" });

    try {
      const [scriptLoaded, data] = await Promise.all([
        loadRazorpayScript(),
        createSubscription(cycle, appliedCoupon?.code),
      ]);
      if (run.current !== id) return;

      if (!scriptLoaded || !window.Razorpay) {
        return setPhase({
          kind: "ready",
          notice:
            "We couldn't load the secure payment window. Check your connection — or pause any ad or content blocker — and try again.",
        });
      }
      if (!data?.subscription_id || !data.key_id) throw new Error("Incomplete subscription response");

      const subscription = data.subscription_id;
      subscriptionId.current = subscription;
      startedCoupon.current = data.coupon_applied?.label ?? null;
      router.replace(checkoutUrl(subscription), { scroll: false });

      // Exactly one of: authorised, failed, closed — whichever Checkout reports first.
      let settled = false;
      const planName = summary?.cycles[cycle]?.name ?? "Pro";
      const razorpay = new window.Razorpay({
        key: data.key_id,
        subscription_id: subscription,
        name: "Socrate",
        description: data.trial_end
          ? `Socrate ${planName} — ${summary?.trialDays ?? 7}-day free trial`
          : `Socrate ${planName}, ${cycle}`,
        prefill: { name: userInfo?.name, email: userInfo?.email },
        notes: { billingCycle: cycle },
        theme: { color: "#1a1815" },
        // A failure comes back here, to explain it and offer a clean retry.
        retry: { enabled: false },
        handler: (response: RazorpayPaymentResponse) => {
          settled = true;
          void confirmAuthorisation(subscription, response);
        },
        modal: {
          ondismiss: () => {
            if (settled || run.current !== id) return;
            settled = true;
            // Closing the window isn't proof nothing was authorised (a UPI
            // app may still approve the mandate): ask before calling it cancelled.
            void settle(subscription, "dismiss");
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        if (settled || run.current !== id) return;
        settled = true;
        try {
          razorpay.close?.();
        } catch {
          // Already closing.
        }
        const outcome = failureFromCheckout(response?.error);
        if (outcome === "pending" || outcome === "already_paid") return void settle(subscription, "payment");
        setPhase(outcome === "cancelled" ? { kind: "cancelled" } : { kind: "failed", reason: outcome });

        // A second opinion from the backend, in case the mandate went through after all.
        const shown = run.current;
        getSubscriptionCheckoutStatus(subscription)
          .then(({ subscription: status }) => {
            if (run.current !== shown) return;
            if (GRANTED.has(status.status)) void finishStarted(shown, status.status, status.trialEnd ?? null, status.couponCode);
          })
          .catch(() => {
            // The failure screen stands; "Try again" asks afresh.
          });
      });

      razorpay.open();
      setPhase({ kind: "open" });
    } catch (err) {
      if (run.current !== id) return;
      if (err instanceof ApiError && err.status === 401) return sessionEnded();
      // The coupon was refused when subscribing: say why at the field, and
      // let the reader remove it or try another — never full price unasked.
      const refusal = couponRefusal(err);
      if (refusal) {
        rejectCoupon(refusal);
        return setPhase({ kind: "ready" });
      }
      if (errorCode(err) === "ALREADY_SUBSCRIBED") {
        const session = await refresh({ quiet: true });
        if (run.current !== id) return;
        const until =
          ((err as ApiError).body as { activeUntil?: string | null } | null)?.activeUntil ??
          session.membership?.endDate ??
          session.membership?.currentPeriodEnd ??
          session.membership?.trialEnd ??
          null;
        return setPhase({ kind: "already-active", until });
      }
      if (err instanceof ApiError && err.status === 404) return setPhase({ kind: "unavailable" });
      console.error("Couldn't start checkout:", err);
      setPhase({
        kind: "ready",
        notice:
          err instanceof ApiError
            ? err.status === 429
              ? "Too many attempts in a short time. Please wait a few minutes and try again."
              : "We couldn't start your trial right now. Please try again in a moment."
            : "We couldn't reach Socrate. Check your connection and try again.",
      });
    } finally {
      starting.current = false;
    }
  }, [
    cycle,
    couponChecking,
    appliedCoupon,
    rejectCoupon,
    checkoutUrl,
    router,
    summary,
    userInfo,
    confirmAuthorisation,
    settle,
    finishStarted,
    refresh,
    sessionEnded,
  ]);

  const chooseCycle = (next: BillingCycle) => {
    if (next === cycle) return;
    setCycle(next);
    subscriptionId.current = null;
    router.replace(checkoutUrl(null, next), { scroll: false });
  };

  const retryLoad = () => {
    subscriptionId.current = null;
    router.replace(checkoutUrl(null), { scroll: false });
    setReloadToken((n) => n + 1);
  };

  const signInHref = `/login?next=${encodeURIComponent(checkoutUrl(subscriptionParam))}`;
  const back = <PanelAction href={backHref}>{backLabel(backHref)}</PanelAction>;
  const planName = selected?.name ?? currentPlan?.name ?? "Pro";
  const trialDays = summary?.trialDays ?? 7;
  // One free trial per account: a reader who has had theirs pays today.
  const trial = summary?.trialEligible ?? true;
  const price = selected ? formatAmount(selected.amount, selected.currency) : null;
  const period = cycle ? PERIOD[cycle] : "month";

  /* ─── Signed out ─── */
  if (!sessionLoading && !signedIn && BEFORE_PAYMENT.has(phase.kind)) {
    return (
      <CheckoutColumn>
        <BackLink href={backHref}>{backLabel(backHref)}</BackLink>
        <StatusPanel
          tone="neutral"
          label="Sign in to continue"
          title="Sign in to upgrade"
          actions={
            <>
              <PanelAction primary href={signInHref}>
                Sign in
              </PanelAction>
              <PanelAction href={`/login?mode=signup&next=${encodeURIComponent(checkoutUrl(null))}`}>
                Create an account
              </PanelAction>
            </>
          }
        >
          <p>Your plan is tied to your Socrate account, so sign in first. You&apos;ll come straight back here.</p>
        </StatusPanel>
      </CheckoutColumn>
    );
  }

  switch (phase.kind) {
    case "loading":
      return (
        <CheckoutColumn wide>
          <div className="flex min-h-[50vh] items-center justify-center text-small text-ink-soft" role="status">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Loading checkout…
          </div>
        </CheckoutColumn>
      );

    case "unavailable":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="neutral"
            label="Plan unavailable"
            title="This plan isn't available"
            actions={<PanelAction primary href="/pricing">See plans</PanelAction>}
          >
            <p>It may have changed, or the link may be incomplete. Pick a plan from our pricing page to continue.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "load-error":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="neutral"
            label="Checkout unavailable"
            title="We couldn't load checkout"
            actions={
              <>
                <PanelAction primary onClick={retryLoad}>
                  Try again
                </PanelAction>
                {back}
              </>
            }
          >
            <p>
              {phase.network
                ? "We couldn't reach Socrate. Check your connection and try again."
                : "Something went wrong on our side. Please try again in a moment."}
            </p>
            <p>You haven&apos;t been charged.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "already-active": {
      const until = formatDate(phase.until);
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="success"
            label="Already active"
            title={`Your ${planName} plan is already active`}
            actions={
              <>
                <PanelAction primary onClick={() => window.location.assign(APP_URL)}>
                  Go to Socrate
                </PanelAction>
                {back}
              </>
            }
          >
            <p>
              There&apos;s nothing to pay.{" "}
              {until ? `Your current ${planName} period runs to ${until}.` : `Your ${planName} features are ready to use.`}
            </p>
          </StatusPanel>
        </CheckoutColumn>
      );
    }

    case "verifying":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="progress"
            label={phase.after === "dismiss" ? "Checking" : trial ? "Starting your trial" : "Confirming"}
            title={
              phase.after === "dismiss"
                ? trial
                  ? "Checking your autopay…"
                  : "Checking your payment…"
                : trial
                  ? "Starting your free trial…"
                  : "Confirming your payment…"
            }
          >
            <p>This usually takes a few seconds. Please keep this page open.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "success": {
      const firstCharge = formatDate(phase.trialEnd);
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="success"
            label={phase.trial ? "Trial started" : "Subscribed"}
            title={phase.trial ? "Your free trial has started." : `Your ${planName} plan is active.`}
            actions={
              <PanelAction primary onClick={() => window.location.assign(APP_URL)}>
                Go to Socrate
              </PanelAction>
            }
            footnote={
              <dl className="flex flex-col gap-2">
                <div className="flex justify-between gap-4">
                  <dt>Plan</dt>
                  <dd className="text-ink">
                    Socrate {planName}
                    {cycle ? `, ${cycle}` : ""}
                  </dd>
                </div>
                {phase.trial && firstCharge ? (
                  <div className="flex justify-between gap-4">
                    <dt>First charge</dt>
                    <dd className="text-ink">{firstCharge}</dd>
                  </div>
                ) : null}
                {price ? (
                  <div className="flex justify-between gap-4">
                    <dt>{phase.trial ? "Then" : "Billed"}</dt>
                    <dd className="tabular-nums text-ink">
                      {price}/{period}
                    </dd>
                  </div>
                ) : null}
                {phase.coupon ? (
                  <div className="flex justify-between gap-4">
                    <dt>Coupon</dt>
                    <dd className="text-ink">{phase.coupon}</dd>
                  </div>
                ) : null}
              </dl>
            }
          >
            {phase.trial ? (
              <>
                <p>Everything in Socrate {planName} is ready to use, free for {trialDays} days.</p>
                <p>
                  {firstCharge
                    ? `Your first charge${price ? ` of ${price}` : ""} is on ${firstCharge}, then every ${period} until you cancel.`
                    : `Your first charge is when the trial ends, then every ${period} until you cancel.`}{" "}
                  Cancel before then and you won&apos;t be charged.
                </p>
                {phase.coupon ? <p>Your coupon discount is taken off when you&apos;re charged.</p> : null}
              </>
            ) : (
              <>
                <p>Thanks for subscribing. Everything in Socrate {planName} is ready to use.</p>
                <p>
                  It renews every {period} until you cancel. Cancel anytime and you keep {planName} until the end of the
                  period you&apos;ve paid for.
                </p>
              </>
            )}
          </StatusPanel>
        </CheckoutColumn>
      );
    }

    case "failed":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="error"
            label={trial ? "Autopay not set up" : "Payment failed"}
            title={trial ? "We couldn't set up your autopay." : "Your payment couldn't be completed."}
            actions={
              <>
                <PanelAction primary onClick={startTrial}>
                  Try again
                </PanelAction>
                {back}
              </>
            }
            footnote={<SupportLine>If any amount was debited, it will be refunded automatically. Questions? Email</SupportLine>}
          >
            <p className="text-ink">{failureMessage(phase.reason)}</p>
            <p>{trial ? "Your trial hasn't started, and your plan hasn't changed." : "Your plan hasn't changed."}</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "cancelled":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="neutral"
            label={trial ? "Trial not started" : "Payment cancelled"}
            title={trial ? "Your trial hasn't started" : "Payment cancelled"}
            actions={
              <>
                <PanelAction primary onClick={startTrial}>
                  Try again
                </PanelAction>
                {back}
              </>
            }
          >
            <p>
              The payment window was closed before {trial ? "autopay was set up" : "the payment was completed"}. You
              haven&apos;t been charged, and your plan hasn&apos;t changed.
            </p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "pending":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="waiting"
            label="Confirming"
            title={trial ? "We're still confirming your autopay." : "We're still confirming your payment."}
            actions={
              <>
                <PanelAction
                  primary
                  onClick={() =>
                    subscriptionId.current && settle(subscriptionId.current, phase.unverified ? "unverified" : "payment")
                  }
                >
                  Check status
                </PanelAction>
                {back}
              </>
            }
            footnote={<SupportLine>Set up autopay, but still not on {planName} after 30 minutes? Email</SupportLine>}
          >
            <p>
              Some payment methods — especially UPI Autopay — take a few minutes to confirm. Your{" "}
              {trial ? "free trial starts" : "plan starts"} as soon as it&apos;s confirmed, even if you leave this page.
            </p>
            <p>Please don&apos;t {trial ? "start another trial" : "pay again"} in the meantime.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "session-expired":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="neutral"
            label="Signed out"
            title="Please sign in again"
            actions={
              <PanelAction primary href={signInHref}>
                Sign in
              </PanelAction>
            }
          >
            <p>Your session ended, so we couldn&apos;t finish here.</p>
            <p>If you set up autopay, your trial is safe — sign in and we&apos;ll show you where it stands.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    // "ready", "starting", "open": the checkout itself.
    default:
      break;
  }

  if (!summary || !selected || !cycle || loadedAt === null) {
    return (
      <CheckoutColumn wide>
        <div className="flex min-h-[50vh] items-center justify-center text-small text-ink-soft" role="status">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Loading checkout…
        </div>
      </CheckoutColumn>
    );
  }

  const busy = phase.kind === "starting" || phase.kind === "open";
  const recurring = formatAmount(selected.amount, selected.currency);
  const firstChargeOn = formatDate(new Date(loadedAt + trialDays * DAY_MS));
  const tagline = planTagline(selected.name, selected.description);
  // Feature limits run per the plan's own period, whatever the billing cycle.
  const featurePeriod = periodLabel(currentPlan?.durationDays ?? 30);
  const features = (currentPlan?.planFeatures ?? [])
    .filter((f) => f.enabled)
    .map((f) => `${f.limit} ${f.featureKey.replace(/_/g, " ")} / ${featurePeriod}`);

  return (
    <CheckoutColumn wide>
      <BackLink href={backHref}>{backLabel(backHref)}</BackLink>

      <div className="mt-[clamp(1.25rem,3vw,2.5rem)] grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:grid-rows-[auto_1fr]">
        <div className="min-w-0">
          <MonoLabel className="text-ink-soft">Checkout</MonoLabel>
          <h1 className="mt-3 text-[clamp(2rem,5vw,2.875rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink text-balance">
            {trial ? `Try ${selected.name} free for ${trialDays} days` : `Subscribe to ${selected.name}`}
          </h1>
          {tagline ? (
            <p className="mt-4 max-w-[30rem] text-lede text-ink-soft text-pretty">{tagline}</p>
          ) : null}
        </div>

        <section
          aria-labelledby="order-summary-title"
          className="min-w-0 rounded-xl border border-line-strong bg-card p-5 shadow-[0_1px_2px_rgba(26,24,21,0.04)] sm:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="order-summary-title" className="text-title font-medium text-ink">
              {selected.name}
            </h2>
            {soldCycles.length > 1 && (
              <div className="inline-flex rounded-lg border border-line-control p-0.5 text-xs" role="radiogroup" aria-label="Billing period">
                {soldCycles.map((c) => {
                  const active = c === cycle;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => chooseCycle(c)}
                      className={cn(
                        "min-h-9 rounded-md px-3 capitalize transition-colors",
                        active ? "bg-ink text-[#faf9f6]" : "text-ink-soft hover:text-ink",
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[1.875rem] font-medium leading-none tracking-[-0.035em] text-ink tabular-nums">
              {recurring}
            </span>
            <span className="text-small text-ink-soft">/{period}{trial ? " after your trial" : ""}</span>
          </p>

          <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-[14.5px]">
            {trial ? (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Free trial</dt>
                  <dd className="text-ink">{trialDays} days</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Then, from {firstChargeOn ?? "the end of your trial"}</dt>
                  <dd className="shrink-0 tabular-nums text-ink">
                    {recurring}/{period}
                  </dd>
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Billed {cycle}</dt>
                <dd className="shrink-0 tabular-nums text-ink">
                  {recurring}/{period}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-5">
            <span className="font-medium text-ink">Due today</span>
            <span className="text-[1.375rem] font-medium tracking-[-0.02em] text-ink tabular-nums">
              {trial ? formatAmount(0, selected.currency) : recurring}
            </span>
          </div>
          {!trial && appliedCoupon ? (
            <p className="mt-1.5 text-right text-[13px] text-ink-muted">
              Before your {appliedCoupon.label} — Razorpay shows the final amount
            </p>
          ) : null}
          <p className="mt-1.5 text-right text-[13px] text-ink-muted">Renews automatically · Cancel anytime</p>

          <div className="mt-5 border-t border-line pt-4">
            <CouponField coupon={coupon} disabled={busy} />
            {appliedCoupon && trial ? (
              <p className="mt-2 text-[13px] leading-[1.5] text-ink-muted">Your discount is taken off when you&apos;re charged.</p>
            ) : null}
          </div>

          {phase.kind === "ready" && phase.notice ? (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-[14px] leading-[1.6] text-destructive"
            >
              {phase.notice}
            </p>
          ) : null}

          <Button
            onClick={startTrial}
            disabled={busy || couponChecking}
            aria-busy={busy || undefined}
            className="mt-6 h-12 w-full rounded-lg text-[15px] tracking-[-0.008em]"
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {phase.kind === "open" ? (trial ? "Waiting for autopay…" : "Waiting for payment…") : "Starting secure checkout…"}
              </>
            ) : trial ? (
              "Start free trial"
            ) : appliedCoupon ? (
              "Continue to payment"
            ) : (
              `Pay ${recurring}`
            )}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-ink-muted">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Secured by Razorpay
          </p>
        </section>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          {features.length > 0 ? (
            <>
              <MonoLabel className="text-ink-soft">Included in {selected.name}</MonoLabel>
              <ul className="mt-4 flex flex-col gap-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2.5 text-small text-[#3f3b34] before:text-ink before:content-['·']"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className={cn("max-w-[30rem] text-[14px] leading-[1.65] text-ink-muted", features.length > 0 && "mt-8 border-t border-line pt-5")}>
            {trial ? (
              <>
                Free for {trialDays} days, then {recurring} every {period} until you cancel — your plan renews
                automatically. Cancel anytime{firstChargeOn ? ` before ${firstChargeOn}` : " during your trial"} and you
                won&apos;t be charged. To set up autopay your bank may place a small verification charge, which is
                refunded. By starting your trial you agree to our{" "}
              </>
            ) : (
              <>
                {recurring} today, then every {period} until you cancel — your plan renews automatically. Cancel anytime
                and you keep {selected.name} until the end of the period you&apos;ve paid for. You&apos;ve already had
                the free trial on this account. By subscribing you agree to our{" "}
              </>
            )}
            <Link href="/terms" className="underline decoration-[#d4cfc4] underline-offset-[3px] hover:text-ink">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline decoration-[#d4cfc4] underline-offset-[3px] hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </CheckoutColumn>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutFrame>
      <Suspense
        fallback={
          <CheckoutColumn wide>
            <div className="flex min-h-[50vh] items-center justify-center text-small text-ink-soft">Loading checkout…</div>
          </CheckoutColumn>
        }
      >
        <CheckoutPageInner />
      </Suspense>
    </CheckoutFrame>
  );
}
