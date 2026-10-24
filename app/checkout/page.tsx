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
import { ApiError } from "@/lib/Api";
import { APP_URL, safeInternalPath } from "@/lib/navigation";
import {
  failureFromCheckout,
  failureMessage,
  formatAmount,
  formatDate,
  periodLabel,
  planTagline,
} from "@/lib/payment";
import {
  createRazorpayOrder,
  GetMemberPlans,
  getOrderSummary,
  getPaymentStatus,
  MemberPlan,
  OrderSummaryResponse,
  verifyRazorpayPayment,
} from "@/lib/services";
import type { RazorpayPaymentResponse } from "@/types/razorpay";
import { cn } from "@/lib/utils";

/* ─── /checkout?planId=…&returnTo=…&order=… ───
   The browser names a plan; the backend prices it, creates (or hands back)
   the Razorpay order, and alone decides whether it was paid. Once an order
   exists its id joins the URL, so a refresh — or signing in again — picks
   up where the payment stands instead of starting over.

   Nothing here shows "paid" or "failed" on the browser's say-so alone:
   success waits for the backend, and anything uncertain (a closed window, a
   UPI request still out, a lost connection) is checked with the backend
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

// "Pro Monthly" -> { base: "Pro", cycle: "monthly" }. Plans that don't follow
// this naming just get no cycle detected — the toggle only shows up when
// there's actually another plan to switch to.
function splitPlanName(name: string): { base: string; cycle: "monthly" | "yearly" | null } {
  const match = name.match(/^(.*?)\s*[-–]?\s*(monthly|yearly|annual(?:ly)?)$/i);
  if (!match) return { base: name.trim(), cycle: null };
  const cycle = /monthly/i.test(match[2]) ? "monthly" : "yearly";
  return { base: match[1].trim() || name.trim(), cycle };
}

type Phase =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "load-error"; network: boolean }
  | { kind: "already-active"; until: string | null }
  /** The order summary and Pay button; `notice` explains a start that didn't work. */
  | { kind: "ready"; notice?: string }
  /** Creating the order and loading Razorpay. */
  | { kind: "starting" }
  /** Razorpay's window is open. */
  | { kind: "open" }
  | { kind: "verifying"; after: Origin }
  | { kind: "success" }
  | { kind: "failed"; reason: string }
  | { kind: "cancelled" }
  /** Still not settled after waiting: never called a failure. */
  | { kind: "pending"; unverified: boolean }
  | { kind: "expired" }
  | { kind: "session-expired" };

/** What sent us to ask the backend: a success callback (verified or not), a closed window, or a reload. */
type Origin = "payment" | "unverified" | "dismiss" | "resume";

/* The phases in which nothing has been paid: a sign-out elsewhere simply
   shows the sign-in prompt. After a payment starts we keep going — the
   backend's 401 then says "sign in again", with the payment kept safe. */
const BEFORE_PAYMENT = new Set<Phase["kind"]>(["loading", "unavailable", "load-error", "already-active", "ready"]);

/* About half a minute of asking, quickly at first. A UPI payment approved
   in the app, or a webhook a little late, usually lands inside this. */
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

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("planId");
  const returnParam = searchParams.get("returnTo");
  const orderParam = searchParams.get("order");
  const backHref = useReturnPath(returnParam);

  const { userInfo, isLoading: sessionLoading, refresh } = useUser();
  const signedIn = !!userInfo;

  const [plans, setPlans] = useState<MemberPlan[]>([]);
  const [summary, setSummary] = useState<OrderSummaryResponse | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  /* Every step of a payment carries the run it belongs to. A newer run (Pay
     again, a reload, leaving the page) quietly retires the older one, so a
     late answer can never overwrite where the reader is now. */
  const run = useRef(0);
  const starting = useRef(false);
  const orderId = useRef<string | null>(orderParam);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => () => void run.current++, []);

  // The full plan list, for the features and a monthly/yearly switch.
  useEffect(() => {
    let cancelled = false;
    GetMemberPlans()
      .then((res) => {
        if (!cancelled) setPlans(res.data.PlanList);
      })
      .catch(() => {
        // Non-fatal — the features list and cycle switcher just won't render.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlan = useMemo(() => plans.find((p) => p._id === planId) ?? null, [plans, planId]);

  // Sibling plans sharing the same base name (e.g. "Pro Monthly" / "Pro
  // Yearly") but a different billing cycle — only rendered when there's
  // actually more than one to choose from.
  const cycleOptions = useMemo(() => {
    if (!currentPlan) return [];
    const { base } = splitPlanName(currentPlan.name);
    const siblings = plans.filter((p) => {
      if (p.price === 0) return false;
      const split = splitPlanName(p.name);
      return split.base.toLowerCase() === base.toLowerCase() && split.cycle !== null;
    });
    return siblings.length > 1 ? siblings : [];
  }, [plans, currentPlan]);

  /** This page's URL, with the order (or without one). */
  const checkoutUrl = useCallback(
    (order: string | null, plan: string | null = planId) => {
      const params = new URLSearchParams();
      if (plan) params.set("planId", plan);
      if (returnParam) params.set("returnTo", returnParam);
      if (order) params.set("order", order);
      return `/checkout?${params.toString()}`;
    },
    [planId, returnParam],
  );

  /* The backend says the session is gone: tell the rest of the site too, or
     /login would see the stale sign-in and send the reader straight back. */
  const sessionEnded = useCallback(() => {
    void refresh({ quiet: true });
    setPhase({ kind: "session-expired" });
  }, [refresh]);

  const finishPaid = useCallback(
    async (id: number) => {
      // Pick up the new plan for the nav; the payment itself is already settled.
      await refresh({ quiet: true });
      if (run.current === id) setPhase({ kind: "success" });
    },
    [refresh],
  );

  /** Ask the backend until the order settles, or say it's still being confirmed. */
  const settle = useCallback(
    async (order: string, after: Origin) => {
      const id = ++run.current;
      setPhase({ kind: "verifying", after });

      for (const delay of POLL_DELAYS_MS) {
        if (delay) await wait(delay);
        if (run.current !== id) return;

        let status;
        try {
          status = (await getPaymentStatus(order)).order;
        } catch (err) {
          if (run.current !== id) return;
          if (err instanceof ApiError && err.status === 401) return sessionEnded();
          if (err instanceof ApiError && err.status === 404) {
            // Not an order of this account (an old link, another account's URL).
            orderId.current = null;
            router.replace(checkoutUrl(null), { scroll: false });
            return setPhase({ kind: "ready" });
          }
          continue; // the network or the backend: ask again
        }
        if (run.current !== id) return;

        switch (status.status) {
          case "paid":
            return finishPaid(id);
          case "failed":
            // A failure inside this window would have come through
            // payment.failed already; after a close, it's an earlier attempt's.
            return setPhase(
              status.failureReason === "cancelled" || after === "dismiss"
                ? { kind: "cancelled" }
                : { kind: "failed", reason: status.failureReason ?? "unknown" },
            );
          case "expired":
            return setPhase({ kind: "expired" });
          case "created":
            // Nothing was paid: a closed window was a cancellation, a reload
            // is simply the checkout again.
            if (after === "dismiss") return setPhase({ kind: "cancelled" });
            if (after === "resume") return setPhase({ kind: "ready" });
            break;
          // "processing" / "unknown": the bank or Razorpay hasn't answered yet.
        }
      }
      if (run.current === id) setPhase({ kind: "pending", unverified: after === "unverified" });
    },
    [checkoutUrl, finishPaid, router, sessionEnded],
  );

  /* Load the price (and, after a reload, where the payment stands) once per
     plan — not again when the session object changes under us. */
  useEffect(() => {
    if (sessionLoading || !signedIn) return;
    if (!planId) {
      setPhase({ kind: "unavailable" });
      return;
    }
    const key = `${planId}:${reloadToken}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;

    const id = ++run.current;
    let finished = false;
    setPhase({ kind: "loading" });

    (async () => {
      try {
        const resumeOrder = orderId.current;
        const [summaryResult, statusResult] = await Promise.allSettled([
          getOrderSummary(planId),
          resumeOrder ? getPaymentStatus(resumeOrder) : Promise.resolve(null),
        ]);
        if (run.current !== id) return;

        if (summaryResult.status === "fulfilled") setSummary(summaryResult.value);

        // An order in the URL: where that payment stands comes first.
        if (resumeOrder) {
          if (statusResult.status === "fulfilled" && statusResult.value) {
            const { status, failureReason } = statusResult.value.order;
            if (status === "paid") return finishPaid(id);
            if (status === "failed") {
              return setPhase(
                failureReason === "cancelled" ? { kind: "cancelled" } : { kind: "failed", reason: failureReason ?? "unknown" },
              );
            }
            if (status === "expired") return setPhase({ kind: "expired" });
            if (status === "processing" || status === "unknown") return void settle(resumeOrder, "resume");
            // "created": nothing paid yet — show the checkout.
          } else if (statusResult.status === "rejected") {
            const err = statusResult.reason;
            if (err instanceof ApiError && err.status === 401) return sessionEnded();
            if (err instanceof ApiError && err.status === 404) {
              orderId.current = null;
              router.replace(checkoutUrl(null), { scroll: false });
            } else {
              return void settle(resumeOrder, "resume");
            }
          }
        }

        if (summaryResult.status === "rejected") {
          const err = summaryResult.reason;
          if (err instanceof ApiError && err.status === 404) return setPhase({ kind: "unavailable" });
          if (err instanceof ApiError && err.status === 401) return sessionEnded();
          return setPhase({ kind: "load-error", network: !(err instanceof ApiError) });
        }

        const loaded = summaryResult.value;
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
  }, [sessionLoading, signedIn, planId, reloadToken, settle, finishPaid, checkoutUrl, router, sessionEnded]);

  /** Razorpay's success callback: the backend checks the signature, or we ask where the order stands. */
  const confirmPayment = useCallback(
    async (order: string, response: RazorpayPaymentResponse) => {
      const id = ++run.current;
      setPhase({ kind: "verifying", after: "payment" });
      let after: Origin = "payment";
      try {
        const verified = await verifyRazorpayPayment(response);
        if (run.current !== id) return;
        if (verified?.success) return finishPaid(id);
      } catch (err) {
        if (run.current !== id) return;
        if (err instanceof ApiError && err.status === 401) return sessionEnded();
        if (errorCode(err) === "VERIFICATION_FAILED") after = "unverified";
      }
      return settle(order, after);
    },
    [finishPaid, settle, sessionEnded],
  );

  const startPayment = useCallback(async () => {
    if (!planId || starting.current) return;
    starting.current = true;
    const id = ++run.current;
    setPhase({ kind: "starting" });

    try {
      const [scriptLoaded, data] = await Promise.all([loadRazorpayScript(), createRazorpayOrder(planId)]);
      if (run.current !== id) return;

      if (!scriptLoaded || !window.Razorpay) {
        return setPhase({
          kind: "ready",
          notice:
            "We couldn't load the secure payment window. Check your connection — or pause any ad or content blocker — and try again.",
        });
      }
      if (!data?.order?.id || !data.key_id) throw new Error("Incomplete order response");

      const order = data.order.id;
      orderId.current = order;
      router.replace(checkoutUrl(order), { scroll: false });

      // Exactly one of: paid, failed, closed — whichever Checkout reports first.
      let settled = false;
      const planName = summary?.plan.name ?? "Pro";
      const razorpay = new window.Razorpay({
        key: data.key_id,
        order_id: order,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Socrate",
        description: `Socrate ${planName}`,
        prefill: { name: userInfo?.name, email: userInfo?.email },
        notes: { planId },
        theme: { color: "#1a1815" },
        // A failure comes back here, to explain it and offer a clean retry.
        retry: { enabled: false },
        handler: (response: RazorpayPaymentResponse) => {
          settled = true;
          void confirmPayment(order, response);
        },
        modal: {
          ondismiss: () => {
            if (settled || run.current !== id) return;
            settled = true;
            // Closing the window isn't proof nothing was paid (a UPI app may
            // still approve it): ask before calling it cancelled.
            void settle(order, "dismiss");
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
        if (outcome === "pending" || outcome === "already_paid") return void settle(order, "payment");
        setPhase(outcome === "cancelled" ? { kind: "cancelled" } : { kind: "failed", reason: outcome });

        // A second opinion from the backend, in case the money moved after all.
        const shown = run.current;
        getPaymentStatus(order)
          .then(({ order: status }) => {
            if (run.current !== shown) return;
            if (status.status === "paid") void finishPaid(shown);
            else if (status.status === "processing") void settle(order, "payment");
            // Checkout doesn't say how the reader paid; the backend does. Only
            // that detail is taken from it — its list may not have this
            // attempt yet, and an older attempt's reason would mislead.
            else if (outcome === "timed_out" && status.status === "failed" && status.failureReason === "upi_timeout") {
              setPhase({ kind: "failed", reason: "upi_timeout" });
            }
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
      if (errorCode(err) === "ALREADY_SUBSCRIBED") {
        const session = await refresh({ quiet: true });
        if (run.current !== id) return;
        return setPhase({ kind: "already-active", until: session.membership?.endDate ?? null });
      }
      if (err instanceof ApiError && err.status === 404) return setPhase({ kind: "unavailable" });
      console.error("Couldn't start checkout:", err);
      setPhase({
        kind: "ready",
        notice:
          err instanceof ApiError
            ? err.status === 429
              ? "Too many attempts in a short time. Please wait a minute and try again."
              : "We couldn't start the payment right now. Please try again in a moment."
            : "We couldn't reach Socrate. Check your connection and try again.",
      });
    } finally {
      starting.current = false;
    }
  }, [planId, checkoutUrl, router, summary, userInfo, confirmPayment, settle, finishPaid, refresh, sessionEnded]);

  const retryLoad = () => {
    orderId.current = null;
    router.replace(checkoutUrl(null), { scroll: false });
    setReloadToken((n) => n + 1);
  };

  const signInHref = `/login?next=${encodeURIComponent(checkoutUrl(orderId.current))}`;
  const back = <PanelAction href={backHref}>{backLabel(backHref)}</PanelAction>;
  const planName = summary?.plan.name ?? currentPlan?.name ?? "Pro";

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
              {until ? `${planName} is active until ${until}.` : `Your ${planName} features are ready to use.`}
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
            label={phase.after === "dismiss" ? "Checking" : "Verifying"}
            title={phase.after === "dismiss" ? "Checking your payment…" : "We're verifying your payment…"}
          >
            <p>This usually takes a few seconds. Please keep this page open.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "success":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="success"
            label="Payment successful"
            title={`You're now on ${planName}`}
            actions={
              <PanelAction primary onClick={() => window.location.assign(APP_URL)}>
                Go to Socrate
              </PanelAction>
            }
            footnote={
              summary ? (
                <dl className="flex flex-col gap-2">
                  <div className="flex justify-between gap-4">
                    <dt>Plan</dt>
                    <dd className="text-ink">Socrate {planName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Amount paid</dt>
                    <dd className="tabular-nums text-ink">
                      {formatAmount(summary.breakdown.totalAmount, summary.breakdown.currency)}
                    </dd>
                  </div>
                </dl>
              ) : undefined
            }
          >
            <p>Your Socrate {planName} plan is active.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "failed":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="error"
            label="Payment failed"
            title="We couldn't complete your payment."
            actions={
              <>
                <PanelAction primary onClick={startPayment}>
                  Try payment again
                </PanelAction>
                {back}
              </>
            }
            footnote={<SupportLine>If any amount was debited, it will be refunded automatically. Questions? Email</SupportLine>}
          >
            <p className="text-ink">{failureMessage(phase.reason)}</p>
            <p>Your plan hasn&apos;t changed.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "cancelled":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="neutral"
            label="Payment cancelled"
            title="Payment cancelled"
            actions={
              <>
                <PanelAction primary onClick={startPayment}>
                  Try payment again
                </PanelAction>
                {back}
              </>
            }
          >
            <p>The payment window was closed before the payment was completed. You haven&apos;t been charged, and your plan hasn&apos;t changed.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "pending":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="waiting"
            label="Confirming"
            title={phase.unverified ? "We couldn't confirm your payment yet" : "Your payment is still being confirmed"}
            actions={
              <>
                <PanelAction
                  primary
                  onClick={() => orderId.current && settle(orderId.current, phase.unverified ? "unverified" : "payment")}
                >
                  Check status
                </PanelAction>
                {back}
              </>
            }
            footnote={<SupportLine>Charged, but still not on {planName} after 30 minutes? Email</SupportLine>}
          >
            <p>
              Some payments — especially UPI and net banking — take a few minutes to confirm. We&apos;ll activate{" "}
              {planName} as soon as your bank confirms it, even if you leave this page.
            </p>
            <p>Please don&apos;t pay again: you won&apos;t be charged twice for this order.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    case "expired":
      return (
        <CheckoutColumn>
          <StatusPanel
            tone="waiting"
            label="Checkout expired"
            title="This checkout has expired"
            actions={
              <>
                <PanelAction primary onClick={startPayment}>
                  Start a new payment
                </PanelAction>
                {back}
              </>
            }
          >
            <p>Checkout sessions expire after a while to keep your payment safe. Start again — nothing was charged for the old one.</p>
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
            <p>If you completed a payment, it&apos;s safe — sign in and we&apos;ll show you where it stands.</p>
          </StatusPanel>
        </CheckoutColumn>
      );

    // "ready", "starting", "open": the checkout itself.
    default:
      break;
  }

  if (!summary) {
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
  const { breakdown } = summary;
  const total = formatAmount(breakdown.totalAmount, breakdown.currency);
  const period = periodLabel(summary.plan.durationDays);
  const tagline = planTagline(summary.plan.name, summary.plan.description);
  const features = (currentPlan?.planFeatures ?? [])
    .filter((f) => f.enabled)
    .map((f) => `${f.limit} ${f.featureKey.replace(/_/g, " ")} / ${period}`);

  return (
    <CheckoutColumn wide>
      <BackLink href={backHref}>{backLabel(backHref)}</BackLink>

      <div className="mt-[clamp(1.25rem,3vw,2.5rem)] grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:grid-rows-[auto_1fr]">
        <div className="min-w-0">
          <MonoLabel className="text-ink-soft">Checkout</MonoLabel>
          <h1 className="mt-3 text-[clamp(2rem,5vw,2.875rem)] font-medium leading-[1.05] tracking-[-0.035em] text-ink text-balance">
            Upgrade to {summary.plan.name}
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
              {summary.plan.name}
            </h2>
            {cycleOptions.length > 0 && (
              <div className="inline-flex rounded-lg border border-line-control p-0.5 text-xs" role="radiogroup" aria-label="Billing period">
                {cycleOptions.map((p) => {
                  const { cycle } = splitPlanName(p.name);
                  const active = p._id === planId;
                  return (
                    <button
                      key={p._id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => {
                        orderId.current = null;
                        router.push(checkoutUrl(null, p._id));
                      }}
                      className={cn(
                        "min-h-9 rounded-md px-3 capitalize transition-colors",
                        active ? "bg-ink text-[#faf9f6]" : "text-ink-soft hover:text-ink",
                      )}
                    >
                      {cycle}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[1.875rem] font-medium leading-none tracking-[-0.035em] text-ink tabular-nums">
              {formatAmount(breakdown.baseAmount, breakdown.currency)}
            </span>
            <span className="text-small text-ink-soft">/{period}</span>
          </p>

          <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-[14.5px]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Plan price</dt>
              <dd className="tabular-nums text-ink">{formatAmount(breakdown.baseAmount, breakdown.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Convenience fee ({breakdown.convenienceFeePercent}%)</dt>
              <dd className="tabular-nums text-ink">{formatAmount(breakdown.convenienceFee, breakdown.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">GST ({breakdown.gstPercent}%)</dt>
              <dd className="tabular-nums text-ink">{formatAmount(breakdown.gstAmount, breakdown.currency)}</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-5">
            <span className="font-medium text-ink">Total due today</span>
            <span className="text-[1.375rem] font-medium tracking-[-0.02em] text-ink tabular-nums">{total}</span>
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
            onClick={startPayment}
            disabled={busy}
            aria-busy={busy || undefined}
            className="mt-6 h-12 w-full rounded-lg text-[15px] tracking-[-0.008em]"
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {phase.kind === "open" ? "Waiting for payment…" : "Starting secure checkout…"}
              </>
            ) : (
              `Pay ${total}`
            )}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-ink-muted">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Secured by Razorpay
          </p>
        </section>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          {features.length > 0 ? (
            <>
              <MonoLabel className="text-ink-soft">Included in {summary.plan.name}</MonoLabel>
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
            One-time payment. {summary.plan.name} stays active for {summary.plan.durationDays} days and doesn&apos;t renew
            automatically. By paying you agree to our{" "}
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
