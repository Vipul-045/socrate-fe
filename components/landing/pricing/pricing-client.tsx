"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container, MonoLabel, PageHeader, Section } from "@/components/site/primitives";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CouponField } from "@/components/checkout/coupon-field";
import { ApiError } from "@/lib/Api";
import { GetMemberPlans, type LaunchOffer, type MemberPlan, type PriceDisplay } from "@/lib/services";
import { useUser } from "@/components/provider/authoprovider";
import { useEnterApp } from "@/hooks/use-enter-app";
import { useSubscriptionCoupon } from "@/hooks/use-subscription-coupon";
import { isBillingCycle, type BillingCycle } from "@/lib/pricing";
import { formatAmount, planTagline } from "@/lib/payment";
import { PLANS, featureLabel } from "@/lib/plans";
import { APP_URL, safeAppUrl } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/* ─── /pricing?cycle=…&coupon=…&appReturn=… ───
   Every price here is the backend's (GET /MShip/plan): read on the server
   for the page's HTML, then asked again in the browser for the launch spots
   left. The coupon's price comes from POST /api/subscriptions/coupon/validate.
   Nothing here decides what anyone pays: "Upgrade" goes to /checkout, which
   creates the subscription, and the backend charges its own price.

   The URL keeps the reader's choice — cycle and coupon — so signing in and
   coming back (or a reload) finds it as it was. appReturn: the app page
   that sent the reader here, where "Go to app" takes them back. */

const CURRENCY_SYMBOLS: Record<string, string> = { INR: "₹", USD: "$" };
const symbolFor = (currency?: string) => CURRENCY_SYMBOLS[currency?.toUpperCase() ?? ""] ?? "₹";

const PERIOD: Record<BillingCycle, string> = { monthly: "month", yearly: "year" };
const COUPON_CODE = /^[A-Za-z0-9-]{3,30}$/;

const planButton = "h-[46px] w-full rounded-lg text-sm";

function FeatureList({ items, strong }: { items: string[]; strong?: boolean }) {
  return (
    <ul className="mt-7 flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex gap-2.5 text-small leading-normal",
            strong ? "text-[#3f3b34] before:text-ink" : "text-ink-soft before:text-[#a39d91]",
            "before:content-['·']",
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * One plan. Stacked on phones; on tablets the plan splits into two columns
 * (name and price | button and features) so the button isn't stretched
 * across the whole page; side by side with the other plans from lg.
 * Columns arrive one after another once the plans have loaded.
 */
function Column({
  highlighted,
  badge,
  summary,
  actions,
}: {
  highlighted?: boolean;
  badge?: string;
  summary: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <RevealItem
      className={cn(
        "flex flex-col border-b border-line-strong px-0 py-[clamp(1.875rem,3.5vw,2.625rem)] md:grid md:grid-cols-2 md:gap-x-10 lg:flex lg:border-b-0 lg:px-[clamp(1.5rem,2.6vw,2.25rem)]",
        // The last plan hands its bottom rule to the note underneath, so
        // stacked layouts don't end on a double line.
        highlighted ? "border-x bg-card px-6 sm:px-8" : "last:border-b-0",
      )}
    >
      {/* Side by side, the badge row is always reserved so names, prices
          and buttons share a baseline across the row. Stacked, an empty
          one would only be a gap. */}
      <MonoLabel className={cn("mb-3.5 h-[22px] md:col-span-2", highlighted && "text-ink", !badge && "hidden lg:block")}>
        {badge ?? " "}
      </MonoLabel>
      <div className="min-w-0">{summary}</div>
      <div className="mt-[26px] min-w-0 md:mt-0 lg:mt-[26px]">{actions}</div>
    </RevealItem>
  );
}

/** Monthly / Yearly, as a two-option radio group. */
function CycleToggle({ value, onChange, yearlySaving }: { value: BillingCycle; onChange: (c: BillingCycle) => void; yearlySaving: string | null }) {
  return (
    <div role="radiogroup" aria-label="Billing period" className="mb-[clamp(1.5rem,3vw,2rem)] inline-flex rounded-lg border border-line-control bg-card p-1">
      {(["monthly", "yearly"] as const).map((cycle) => {
        const selected = value === cycle;
        return (
          <button
            key={cycle}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(cycle)}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
              selected ? "bg-ink text-white" : "text-ink-soft hover:text-ink",
            )}
          >
            {cycle === "monthly" ? "Monthly" : "Yearly"}
            {cycle === "yearly" && yearlySaving ? (
              <span className={cn("text-xs", selected ? "text-white/80" : "text-[#7a6a2e]")}>Save {yearlySaving}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** The URL of this page with the reader's choice in it. */
function pricingPath(cycle: BillingCycle, coupon: string | null, appReturn: string | null) {
  const params = new URLSearchParams({ cycle });
  if (coupon) params.set("coupon", coupon);
  if (appReturn) params.set("appReturn", appReturn);
  return `/pricing?${params.toString()}`;
}

export function PricingClient({
  initialPlans,
  initialLaunch,
}: {
  /** The plans as the server read them, so they are in the page's HTML.
      null when it couldn't: the browser asks, as it always used to. */
  initialPlans?: MemberPlan[] | null;
  initialLaunch?: LaunchOffer | null;
}) {
  const fromServer = !!initialPlans?.length;
  const [plans, setPlans] = useState<MemberPlan[]>(initialPlans ?? []);
  const [launch, setLaunch] = useState<LaunchOffer | null>(initialLaunch ?? null);
  const [loading, setLoading] = useState(!fromServer);
  /** Why the plans didn't load: no answer from the backend, or an error from it. */
  const [failure, setFailure] = useState<"network" | "server" | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const { userInfo, membership, tier, pausedSubscription, isLoading: userLoading, isUnreachable, refresh } = useUser();
  const { enterApp, entering } = useEnterApp();
  const router = useRouter();

  /* The reader's choice, from the URL (?cycle=, ?coupon=, ?appReturn=). Read
     once on the client; the page's HTML shows monthly. */
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [urlCoupon, setUrlCoupon] = useState<string | null>(null);
  const [appReturn, setAppReturn] = useState<string | null>(null);
  const [urlRead, setUrlRead] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("cycle");
    if (isBillingCycle(c)) setCycle(c);
    const code = params.get("coupon")?.trim().toUpperCase() ?? "";
    if (COUPON_CODE.test(code)) setUrlCoupon(code);
    setAppReturn(safeAppUrl(params.get("appReturn")));
    setUrlRead(true);
  }, []);

  const coupon = useSubscriptionCoupon(cycle);
  const couponCode = coupon.applied?.code ?? null;

  // A code from the URL (chosen before signing in) is checked once there's a session to check it with.
  const appliedFromUrl = useRef(false);
  const { apply: applyCoupon } = coupon;
  useEffect(() => {
    if (!urlCoupon || !userInfo || appliedFromUrl.current) return;
    appliedFromUrl.current = true;
    void applyCoupon(urlCoupon);
  }, [urlCoupon, userInfo, applyCoupon]);

  // The choice stays in the URL, so a reload or Back finds it.
  useEffect(() => {
    if (!urlRead) return; // not before the URL's own choice has been read
    const next = pricingPath(cycle, couponCode ?? urlCoupon, appReturn);
    if (`${window.location.pathname}${window.location.search}` !== next) window.history.replaceState(null, "", next);
  }, [urlRead, cycle, couponCode, urlCoupon, appReturn]);

  // The backend only returns a membership when it gives a plan now.
  const currentPlan = membership?.plan ?? null;
  const hasPaidPlan = tier === "pro";
  const pastDue = membership?.status === "past_due";

  useEffect(() => {
    let cancelled = false;

    // Always asked again in the browser: the launch spots left change by the minute.
    async function loadPlans() {
      try {
        const res = await GetMemberPlans();
        if (cancelled) return;
        setPlans(res.data.PlanList);
        setLaunch(res.data.launch ?? null);
        setFailure(null);
      } catch (err) {
        if (cancelled) return;
        // Plans already on the page from the server: keep them, quietly.
        if (fromServer && reloadToken === 0) return;
        const network = !(err instanceof ApiError);
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            network
              ? "[pricing] GET /MShip/plan got no response — see the [api] line above for where it was looking."
              : `[pricing] GET /MShip/plan answered ${(err as ApiError).status}.`,
            err,
          );
        }
        setFailure(network ? "network" : "server");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, [reloadToken, fromServer]);

  const retry = () => {
    setLoading(true);
    setFailure(null);
    setReloadToken((n) => n + 1);
    // The session check failed the same way: ask again too.
    if (isUnreachable) void refresh();
  };

  /** The plan the subscription checkout sells (Pro): the one with live billing figures. */
  const sold = useMemo(() => plans.find((p) => p.billing && (p.billing.monthly || p.billing.yearly)) ?? null, [plans]);
  const yearly = sold?.billing?.yearly ?? null;
  const offersYearly = !!yearly;
  // Only cycles the backend sells can be chosen.
  const shownCycle: BillingCycle = cycle === "yearly" && !offersYearly ? "monthly" : cycle;
  const yearlySaving = yearly?.savingAmount ? formatAmount(yearly.savingAmount, yearly.currency) : null;

  const here = pricingPath(shownCycle, couponCode, appReturn);
  const appHref = appReturn ?? APP_URL;

  // Checkout remembers it was opened from here, so "Back" returns here — with the choice.
  const checkoutHref = (plan: MemberPlan) => {
    const params = new URLSearchParams({ planId: plan._id, cycle: shownCycle, returnTo: here });
    if (couponCode) params.set("coupon", couponCode);
    if (appReturn) params.set("appReturn", appReturn);
    return `/checkout?${params.toString()}`;
  };

  // A visitor makes an account (or signs in) first, and comes back here to the same choice.
  const signUpThen = (next: string) => {
    router.push(`/login?mode=signup&next=${encodeURIComponent(next)}`);
  };

  const hasMaxPlan = plans.some((plan) => plan.name === "Max");

  return (
    <Section id="pricing" className="pb-[clamp(4rem,8vw,6.5rem)]">
      <Container>
        <PageHeader eyebrow="Pricing" title="Simple, transparent pricing" lede="Start free. Upgrade when you're ready." />

        {offersYearly && !loading && <CycleToggle value={shownCycle} onChange={setCycle} yearlySaving={yearlySaving} />}

        {loading && <p className="border-t border-line-strong py-16 text-small text-ink-soft">Loading plans…</p>}

        {failure && !loading && (
          <div
            role="alert"
            className="flex flex-col items-start gap-4 border-t border-line-strong py-10 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-ink">We couldn&apos;t load the plans</p>
              <p className="mt-1 text-small text-ink-soft">
                {failure === "network"
                  ? "We couldn't reach Socrate. Check your connection and try again."
                  : "Something went wrong on our side. Please try again in a moment."}
              </p>
            </div>
            <Button variant="outline" className="h-11 rounded-lg px-5" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {!loading && plans.length > 0 && (
          <RevealGroup className="grid border-t border-line-strong lg:grid-cols-3">
            {plans.map((plan) => {
              const highlighted = plan.name === "Pro";
              const isFree = plan.price === 0;
              const isSold = sold?._id === plan._id;
              // Free is "current" for every signed-in reader not on a paid plan.
              const isCurrent = isFree ? !!userInfo && !hasPaidPlan && !pausedSubscription : currentPlan?.planId === plan._id && hasPaidPlan;
              /* The price: the backend's figures for the chosen cycle when it
                 sells this plan by subscription, else the plan's own (Free). */
              const display: PriceDisplay | null = isSold ? plan.billing?.[shownCycle] ?? null : null;
              const price = display ? formatAmount(display.amount, display.currency) : `${symbolFor(plan.currency)}${plan.price}`;
              const period = isFree ? "forever" : display ? PERIOD[shownCycle] : "month";
              const launchLine =
                isSold && shownCycle === "monthly" && launch?.active
                  ? `Launch price · ${launch.spotsLeft} of ${launch.cap} spots left`
                  : null;
              const afterLaunch =
                launchLine && launch?.fullPrice ? `Then ${formatAmount(launch.fullPrice.amount, launch.fullPrice.currency)}/month for new subscribers` : null;
              const withCoupon = isSold ? coupon.applied?.pricing ?? null : null;

              return (
                <Column
                  key={plan._id}
                  highlighted={highlighted}
                  badge={
                    isSold && pausedSubscription
                      ? "Paused"
                      : isCurrent
                        ? pastDue
                          ? "Payment failed"
                          : "Your plan"
                        : highlighted
                          ? "Most popular"
                          : undefined
                  }
                  summary={
                    <>
                      <h2 className="mb-1.5 text-title">{plan.name}</h2>
                      <p className="text-small text-ink-soft">{planTagline(plan.name, plan.description)}</p>

                      <div className="mt-[26px] flex flex-wrap items-baseline gap-x-2.5">
                        {display?.compareAtAmount ? (
                          <span className="text-lg text-[#a39d91] line-through">
                            <span className="sr-only">Was </span>
                            {formatAmount(display.compareAtAmount, display.currency)}
                          </span>
                        ) : null}
                        <span className="text-price">
                          {display?.compareAtAmount ? <span className="sr-only">now </span> : null}
                          {price}
                        </span>
                        <span className="text-small text-ink-soft">/{period}</span>
                      </div>
                      {shownCycle === "yearly" && display?.savingAmount ? (
                        <MonoLabel className="mt-2 text-xs tracking-[0.06em] text-[#7a6a2e]">
                          Save {formatAmount(display.savingAmount, display.currency)} a year
                        </MonoLabel>
                      ) : null}
                      {launchLine ? (
                        <>
                          <MonoLabel className="mt-2 text-xs tracking-[0.06em] text-[#7a6a2e]">{launchLine}</MonoLabel>
                          {afterLaunch ? <p className="mt-1 text-xs text-ink-muted">{afterLaunch}</p> : null}
                        </>
                      ) : null}
                      {withCoupon ? (
                        <p className="mt-3 text-small text-ink" role="status">
                          With {coupon.applied?.code}: {formatAmount(withCoupon.firstChargeAmount, withCoupon.currency)} for your first{" "}
                          {PERIOD[shownCycle]}
                          {withCoupon.renewalAmount !== withCoupon.firstChargeAmount
                            ? `, then ${formatAmount(withCoupon.renewalAmount, withCoupon.currency)}/${PERIOD[shownCycle]}`
                            : ""}
                        </p>
                      ) : null}
                    </>
                  }
                  actions={
                    <>
                      {isFree ? (
                        hasPaidPlan ? (
                          // A paid member can't drop to Free from here — the
                          // backend refuses it until the paid plan is cancelled.
                          <Button variant="outline" className={planButton} disabled>
                            Included in {currentPlan?.name}
                          </Button>
                        ) : userInfo ? (
                          // Free needs no checkout: into the app, as this account.
                          <Button variant="outline" className={planButton} onClick={() => enterApp(plan._id)} disabled={entering}>
                            {entering ? "Opening Socrate…" : "Get started free"}
                          </Button>
                        ) : (
                          <Button variant="outline" className={planButton} onClick={() => signUpThen(here)} disabled={userLoading}>
                            Get started free
                          </Button>
                        )
                      ) : isSold && pausedSubscription ? (
                        // Paused by support: a new subscription would bill alongside it once resumed.
                        <>
                          <Button variant="outline" className={planButton} disabled>
                            Subscription paused
                          </Button>
                          <p className="mt-2 text-xs text-ink-soft">
                            Email <a className="underline" href="mailto:support@socrate.in">support@socrate.in</a> to resume it.
                          </p>
                        </>
                      ) : isCurrent && pastDue ? (
                        // A renewal failed: Pro stays on while Razorpay retries; the app's Plan & billing fixes it.
                        <>
                          <Button variant={highlighted ? "default" : "outline"} className={planButton} asChild>
                            <a href={appHref}>Fix payment</a>
                          </Button>
                          <p className="mt-2 text-xs text-ink-soft">Your renewal didn&apos;t go through. Update your payment method in the app.</p>
                        </>
                      ) : isCurrent ? (
                        // Already theirs: nothing to buy, so the way in instead.
                        <>
                          <Button
                            variant={highlighted ? "default" : "outline"}
                            className={planButton}
                            onClick={() => (appReturn ? window.location.assign(appReturn) : enterApp())}
                            disabled={entering}
                          >
                            {entering ? "Opening Socrate…" : "Go to app"}
                          </Button>
                          <p className="mt-2 text-xs text-ink-soft">
                            <a className="underline" href={appHref}>
                              Manage or cancel
                            </a>{" "}
                            in the app, under Settings → Plan &amp; billing.
                          </p>
                        </>
                      ) : hasPaidPlan && (currentPlan?.price ?? 0) >= plan.price ? (
                        <Button variant="outline" className={planButton} disabled>
                          Included in {currentPlan?.name}
                        </Button>
                      ) : userInfo ? (
                        <Button
                          variant={highlighted ? "default" : "outline"}
                          className={planButton}
                          disabled={isSold && coupon.checking}
                          asChild={!(isSold && coupon.checking)}
                        >
                          {isSold && coupon.checking ? <span>Upgrade to {plan.name}</span> : <Link href={checkoutHref(plan)}>Upgrade to {plan.name}</Link>}
                        </Button>
                      ) : (
                        <Button
                          variant={highlighted ? "default" : "outline"}
                          className={planButton}
                          onClick={() => signUpThen(here)}
                          disabled={userLoading}
                        >
                          Upgrade to {plan.name}
                        </Button>
                      )}

                      {isSold && !hasPaidPlan && !pausedSubscription ? (
                        <div className="mt-4">
                          <CouponField
                            coupon={coupon}
                            disabled={userLoading}
                            // Signed out: a code can only be checked with a session — sign in, and it's applied on return.
                            onApply={userInfo ? undefined : (code) => signUpThen(pricingPath(shownCycle, code || null, appReturn))}
                          />
                        </div>
                      ) : null}

                      <FeatureList strong={highlighted} items={plan.planFeatures.filter((f) => f.enabled).map(featureLabel)} />
                    </>
                  }
                />
              );
            })}

            {/* Max isn't sold yet; show it as announced until the backend
                returns a real plan for it. */}
            {!hasMaxPlan && (
              <Column
                badge="Coming soon"
                summary={
                  <>
                    <h2 className="mb-1.5 text-title">Max</h2>
                    <p className="text-small text-ink-soft">For practical studies</p>
                    <div className="mt-[26px] flex min-h-[clamp(2.375rem,4.4vw,3.25rem)] items-baseline">
                      <MonoLabel className="text-[13px] tracking-[0.08em]">Pricing to be announced</MonoLabel>
                    </div>
                  </>
                }
                actions={
                  <>
                    <Button variant="outline" className={cn(planButton, "border-[#eae6de] text-ink-muted")} disabled>
                      Coming soon
                    </Button>
                    <FeatureList
                      items={["Everything in Pro", "Collaborate with friends", "Extended premium chats", "AI video generations", "Priority support"]}
                    />
                  </>
                }
              />
            )}
          </RevealGroup>
        )}

        <p className="mt-[clamp(1.75rem,3vw,2.25rem)] border-t border-[#eae6de] pt-5 text-xs leading-relaxed text-ink-muted">
          Prices are in Indian rupees, GST included. Payments are secured by Razorpay. Pro starts with a {PLANS.pro.trialDays}-day free
          trial for first-time subscribers, then renews automatically until you cancel — anytime, from Settings → Plan &amp; billing.
          A coupon&apos;s discount is applied by Razorpay when you&apos;re charged.
        </p>
      </Container>
    </Section>
  );
}
