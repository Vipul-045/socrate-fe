// lib/pricing.ts

export type BillingCycle = "monthly" | "yearly";

export const BILLING_CYCLES: BillingCycle[] = ["monthly", "yearly"];

export const isBillingCycle = (value: unknown): value is BillingCycle => value === "monthly" || value === "yearly";

/* Prices are never written here: /pricing and /checkout show what the
   backend returns (GET /MShip/plan, GET /api/subscriptions/summary), and the
   backend alone decides what is charged. */
