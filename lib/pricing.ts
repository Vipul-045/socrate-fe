// lib/pricing.ts

export type BillingCycle = "monthly" | "yearly";
// export type PlanId = "pro";
export type Region = "IN" | "GLOBAL";

export function regionFromCountryCode(countryCode: string): Region {
  // return countryCode === "IN" ? "IN" : "GLOBAL";
  return "IN"
}

// Display-only: the promotional strike-through for Pro. /pricing shows it
// only when `price` equals what the backend's plan charges (pricing-client).
export type DisplayPrice = {
  price: string;
  originalPrice: string | null;
  discountBadge: string | null;
  /** e.g. "/month" — only set where a UI renders the cycle next to the price. */
  period?: string;
  note?: string;
};

export const PRO_DISPLAY_PRICING: Record<Region, DisplayPrice> = {
  IN: { price: "₹399", originalPrice: "₹499", discountBadge: "20% off for First 100 Students*" },
  GLOBAL: { price: "$9", originalPrice: null, discountBadge: null },
};