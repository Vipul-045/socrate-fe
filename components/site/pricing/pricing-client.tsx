"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container, MonoLabel, Section, PageHeader } from "@/components/site/primitives";
import { CheckoutButton } from "@/components/provider/chekout-button";
import { BillingToggle } from "./billing-toggle";
import type { BillingCycle, DisplayPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export type Plan = {
  id: string;
  name: string;
  description: string;
  badge?: string;
  /** null when the plan has no price yet (Max); a cycle may be absent,
      in which case the column falls back to `priceNote`. */
  pricing: Partial<Record<BillingCycle, DisplayPrice>> | null;
  priceNote?: string;
  features: string[];
  cta: string;
  href?: string;
  kind: "link" | "checkout" | "disabled";
  highlighted?: boolean;
};

function PlanCta({
  plan,
  billingCycle,
}: {
  plan: Plan;
  billingCycle: BillingCycle;
}) {
  if (plan.kind === "checkout") {
    return (
      <CheckoutButton
        label={plan.cta}
        planId={plan.id}
        billingCycle={billingCycle}
      />
    );
  }

  if (plan.kind === "disabled") {
    return (
      <Button variant="outline" size="lg" className="w-full" disabled>
        {plan.cta}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="lg" className="w-full" asChild>
      <Link href={plan.href ?? "/login"}>{plan.cta}</Link>
    </Button>
  );
}

function PlanColumn({
  plan,
  billingCycle,
  reserveBadgeRow,
  reserveDiscountRow,
}: {
  plan: Plan;
  billingCycle: BillingCycle;
  /** Keep the badge / discount lines in every column so the plan names,
      prices and buttons share a baseline across the row. */
  reserveBadgeRow: boolean;
  reserveDiscountRow: boolean;
}) {
  const price = plan.pricing?.[billingCycle];
  const discount = price?.discountBadge;

  return (
    <div
      className={cn(
        "flex flex-col py-10 lg:py-12",
        // Stacked: every column is a full card. Side by side: only the
        // highlighted column keeps borders, and they double as the dividers.
        plan.highlighted
          ? "border-x border-b border-line bg-card px-6 sm:px-8 lg:border-t-0 lg:px-9"
          : "border-b border-line lg:border-b-0 lg:px-9",
      )}
    >
      {/* The spacer only earns its keep when the columns sit side by side. */}
      {plan.badge ? (
        <MonoLabel className="mb-7">{plan.badge}</MonoLabel>
      ) : reserveBadgeRow ? (
        <MonoLabel className="mb-7 hidden lg:block" aria-hidden>
          {"\u00A0"}
        </MonoLabel>
      ) : null}

      <h2 className="text-[1.375rem] font-semibold tracking-[-0.02em]">
        {plan.name}
      </h2>
      <p className="mt-2 text-small text-ink-soft">{plan.description}</p>

      <div className="mt-8 lg:min-h-[4.5rem]">
        {price ? (
          <>
            {discount ? (
              <MonoLabel className="mb-4 text-ink">{discount}</MonoLabel>
            ) : reserveDiscountRow ? (
              <MonoLabel className="mb-4 hidden lg:block" aria-hidden>
                {"\u00A0"}
              </MonoLabel>
            ) : null}
            <div className="flex flex-wrap items-baseline gap-x-3">
              {price.originalPrice ? (
                <span className="text-lede text-ink-faint line-through">
                  {price.originalPrice}
                </span>
              ) : null}
              <span className="text-price">{price.price}</span>
              <span className="text-small text-ink-soft">{price.period}</span>
            </div>
            {price.note ? (
              <p className="mt-3 text-small text-ink-faint">{price.note}</p>
            ) : null}
          </>
        ) : (
          <MonoLabel className="pt-2">{plan.priceNote}</MonoLabel>
        )}
      </div>

      <div className="mt-8">
        <PlanCta plan={plan} billingCycle={billingCycle} />
      </div>

      <ul className="mt-8 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex gap-3 text-small text-ink-soft before:text-ink-faint before:content-['·']"
          >
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingClient({ plans }: { plans: Plan[] }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const reserveBadgeRow = plans.some((plan) => plan.badge);
  const reserveDiscountRow = plans.some(
    (plan) => plan.pricing?.[billingCycle]?.discountBadge,
  );

  return (
    <Section>
      <Container>
        <PageHeader
          eyebrow="Pricing"
          title={
            <>
              Simple,
              <br />
              transparent pricing
            </>
          }
          lede="Start free. Upgrade when you're ready."
          action={
            <BillingToggle value={billingCycle} onChange={setBillingCycle} />
          }
        />

        <div className="grid border-t border-line lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanColumn
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              reserveBadgeRow={reserveBadgeRow}
              reserveDiscountRow={reserveDiscountRow}
            />
          ))}
        </div>

        <p className="mt-12 border-t border-line pt-7 text-small text-ink-faint">
          Prices shown in your local currency. All plans billed securely; cancel
          anytime from Settings.
        </p>
      </Container>
    </Section>
  );
}
