"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container, MonoLabel, PageHeader, Section } from "@/components/site/primitives";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { GetMemberPlans, grantFreePlan, MemberPlan } from "@/lib/services";
import { useUser } from "@/components/provider/authoprovider";
import type { DisplayPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const AppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.socrate.in";

const CURRENCY_SYMBOLS: Record<string, string> = { INR: "₹", USD: "$" };
const symbolFor = (currency?: string) =>
  CURRENCY_SYMBOLS[currency?.toUpperCase() ?? ""] ?? "₹";

const planButton = "h-[46px] w-full rounded-lg text-sm";

function FeatureList({ items, strong }: { items: string[]; strong?: boolean }) {
  return (
    <ul className="mt-7 flex flex-col gap-3">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex gap-2.5 text-small leading-normal",
            strong
              ? "text-[#3f3b34] before:text-ink"
              : "text-ink-soft before:text-[#a39d91]",
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
      <MonoLabel
        className={cn(
          "mb-3.5 h-[22px] md:col-span-2",
          highlighted && "text-ink",
          !badge && "hidden lg:block",
        )}
      >
        {badge ?? "\u00A0"}
      </MonoLabel>
      <div className="min-w-0">{summary}</div>
      <div className="mt-[26px] min-w-0 md:mt-0 lg:mt-[26px]">{actions}</div>
    </RevealItem>
  );
}

export function PricingClient({ proPricing }: { proPricing?: DisplayPrice }) {
  const [plans, setPlans] = useState<MemberPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingPlanId, setClaimingPlanId] = useState<string | null>(null);

  const { userInfo, membership, isLoading: userLoading, refresh } = useUser();
  const router = useRouter();

  // The backend only returns a membership when it's active.
  const currentPlan = membership?.plan ?? null;
  const hasPaidPlan = (currentPlan?.price ?? 0) > 0;

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        const res = await GetMemberPlans();
        if (cancelled) return;
        setPlans(res.data.PlanList);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch plans:", err);
        setError("Failed to load pricing plans. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sends an unauthenticated visitor to log in and come straight back to
  // pricing so they can pick up the flow (free grant or checkout) right after.
  const redirectToLogin = () => {
    router.push(`/login?next=${encodeURIComponent("/pricing")}`);
  };

  const handleFreePlan = async (plan: MemberPlan) => {
    if (!userInfo) {
      redirectToLogin();
      return;
    }

    setError(null);
    setClaimingPlanId(plan._id);
    try {
      await grantFreePlan(plan._id);
      await refresh(); // pick up the new membership before leaving
      window.location.href = AppUrl;
    } catch (err) {
      console.error("Failed to grant free plan:", err);
      setError("Couldn't activate your free plan. Please try again.");
      setClaimingPlanId(null);
    }
  };

  const hasMaxPlan = plans.some((plan) => plan.name === "Max");

  return (
    <Section id="pricing" className="pb-[clamp(4rem,8vw,6.5rem)]">
      <Container>
        <PageHeader
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          lede="Start free. Upgrade when you're ready."
        />

        {loading && (
          <p className="border-t border-line-strong py-16 text-small text-ink-soft">
            Loading plans…
          </p>
        )}

        {error && !loading && (
          <p className="border-t border-line-strong py-6 text-small text-destructive">
            {error}
          </p>
        )}

        {!loading && plans.length > 0 && (
          <RevealGroup className="grid border-t border-line-strong lg:grid-cols-3">
            {plans.map((plan) => {
              const highlighted = plan.name === "Pro";
              const isFree = plan.price === 0;
              const isClaiming = claimingPlanId === plan._id;
              const isCurrent = currentPlan?.planId === plan._id;
              const price = `${symbolFor(plan.currency)}${plan.price}`;
              // Only show the promotional strike-through when it describes
              // the price the backend is actually charging.
              const promo =
                highlighted && proPricing?.price === price ? proPricing : null;

              return (
                <Column
                  key={plan._id}
                  highlighted={highlighted}
                  badge={highlighted ? "Most popular" : undefined}
                  summary={
                    <>
                      <h2 className="mb-1.5 text-title">{plan.name}</h2>
                      <p className="text-small text-ink-soft">
                        {plan.description}
                      </p>

                      <div className="mt-[26px] flex flex-wrap items-baseline gap-x-2.5">
                        {promo?.originalPrice ? (
                          <span className="text-lg text-[#a39d91] line-through">
                            {promo.originalPrice}
                          </span>
                        ) : null}
                        <span className="text-price">{price}</span>
                        <span className="text-small text-ink-soft">
                          {isFree ? "/forever" : "/month"}
                        </span>
                      </div>
                      {promo?.discountBadge ? (
                        <MonoLabel className="mt-2 text-xs tracking-[0.06em] text-[#7a6a2e]">
                          {promo.discountBadge}
                        </MonoLabel>
                      ) : null}
                    </>
                  }
                  actions={
                    <>
                      {isCurrent ? (
                        <Button
                          variant={highlighted ? "default" : "outline"}
                          className={planButton}
                          disabled
                        >
                          {isFree
                            ? "Your current plan"
                            : `You're a ${plan.name} member`}
                        </Button>
                      ) : isFree ? (
                        // A paid member can't drop to Free from here — the
                        // backend refuses it until the paid plan is cancelled.
                        <Button
                          variant="outline"
                          className={planButton}
                          onClick={() => handleFreePlan(plan)}
                          disabled={userLoading || isClaiming || hasPaidPlan}
                        >
                          {hasPaidPlan
                            ? `Included in ${currentPlan?.name}`
                            : isClaiming
                              ? "Activating…"
                              : "Get Started"}
                        </Button>
                      ) : !highlighted ? (
                        <Button
                          variant="outline"
                          className={planButton}
                          asChild
                        >
                          <Link href="/login">Choose Plan</Link>
                        </Button>
                      ) : userInfo ? (
                        <Button
                          className={planButton}
                          onClick={() =>
                            router.push(`/checkout?planId=${plan._id}`)
                          }
                        >
                          Start your 7 day free trial
                        </Button>
                      ) : (
                        <Button
                          className={planButton}
                          onClick={redirectToLogin}
                          disabled={userLoading}
                        >
                          Start your 7 day free trial
                        </Button>
                      )}

                      <FeatureList
                        strong={highlighted}
                        items={plan.planFeatures
                          .filter((f) => f.enabled)
                          .map(
                            (f) =>
                              `${f.limit} ${f.featureKey.replace(/_/g, " ")}/month`,
                          )}
                      />
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
                    <p className="text-small text-ink-soft">
                      For practical studies
                    </p>
                    <div className="mt-[26px] flex min-h-[clamp(2.375rem,4.4vw,3.25rem)] items-baseline">
                      <MonoLabel className="text-[13px] tracking-[0.08em]">
                        Pricing to be announced
                      </MonoLabel>
                    </div>
                  </>
                }
                actions={
                  <>
                    <Button
                      variant="outline"
                      className={cn(
                        planButton,
                        "border-[#eae6de] text-ink-muted",
                      )}
                      disabled
                    >
                      Coming soon
                    </Button>
                    <FeatureList
                      items={[
                        "Everything in Pro",
                        "Collaborate with friends",
                        "Extended premium chats",
                        "AI video generations",
                        "Priority support",
                      ]}
                    />
                  </>
                }
              />
            )}
          </RevealGroup>
        )}

        <p className="mt-[clamp(1.75rem,3vw,2.25rem)] border-t border-[#eae6de] pt-5 text-xs leading-relaxed text-ink-muted">
          Prices shown in your local currency. All plans billed securely; cancel
          anytime from Settings.
        </p>
      </Container>
    </Section>
  );
}
