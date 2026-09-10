// lib/pricing.ts

export type BillingCycle = "monthly" | "yearly";
export type PlanId = "pro";
export type Region = "IN" | "GLOBAL";

type RegionPricing = Record<BillingCycle, { productId: string }>;

// All product IDs come from env vars — nothing hardcoded here.
const PLAN_PRICING: Record<PlanId, Record<Region, RegionPricing>> = {
  pro: {
    IN: {
      monthly: { productId: process.env.DODO_PRICE_ID_PRO_IN_MONTHLY ?? "" },
      yearly: { productId: process.env.DODO_PRICE_ID_PRO_IN_YEARLY ?? "" },
    },
    GLOBAL: {
      monthly: { productId: process.env.DODO_PRICE_ID_PRO_GLOBAL_MONTHLY ?? "" },
      yearly: { productId: process.env.DODO_PRICE_ID_PRO_GLOBAL_YEARLY ?? "" },
    },
  },
};

export function regionFromCountryCode(countryCode: string): Region {
  return countryCode === "IN" ? "IN" : "GLOBAL";
}

function isValidPlan(planId: string): planId is PlanId {
  return planId in PLAN_PRICING;
}

function isValidBillingCycle(cycle: string): cycle is BillingCycle {
  return cycle === "monthly" || cycle === "yearly";
}

/**
 * The ONLY function that should decide which Dodo product ID gets charged.
 * planId/billingCycle come from the client (trusted only as a *selection*),
 * region comes from server-side geolocation (never from the client).
 */
export function resolveProductId(
  planId: string,
  billingCycle: string,
  countryCode: string
): string | null {
  if (!isValidPlan(planId) || !isValidBillingCycle(billingCycle)) return null;

  const region = regionFromCountryCode(countryCode);
  const productId = PLAN_PRICING[planId][region][billingCycle].productId;

  return productId || null; // empty string (unset env var) → null
}

// Display-only pricing, also resolved server-side, kept in lockstep with
// the product IDs above so the UI never shows a price the backend won't honor.
//
// IMPORTANT: these strings are what the customer sees. They must match the
// amounts configured on the corresponding Dodo products above — the backend
// is what actually charges, this table only renders.
export type DisplayPrice = {
  price: string;
  period: string;
  originalPrice: string | null;
  discountBadge: string | null;
  /** Shown under the price on the yearly tab, e.g. "Billed ₹3,990 yearly". */
  note: string | null;
};

export const PRO_DISPLAY_PRICING: Record<
  Region,
  Record<BillingCycle, DisplayPrice>
> = {
  IN: {
    monthly: {
      price: "₹399",
      period: "/month",
      originalPrice: "₹499",
      discountBadge: "20% off for first 100 students",
      note: null,
    },
    yearly: {
      price: "₹333",
      period: "/month",
      originalPrice: "₹399",
      discountBadge: "2 months free",
      note: "Billed ₹3,990 yearly",
    },
  },
  GLOBAL: {
    monthly: {
      price: "$9",
      period: "/month",
      originalPrice: null,
      discountBadge: null,
      note: null,
    },
    yearly: {
      price: "$7.50",
      period: "/month",
      originalPrice: "$9",
      discountBadge: "2 months free",
      note: "Billed $90 yearly",
    },
  },
};