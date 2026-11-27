import type { LaunchOffer, MemberPlan } from "@/lib/services";
import { PricingClient } from "./pricing-client";

/** `plans` and `launch` are read on the server (lib/plans.ts), so the plans
 *  are in the page's HTML; null when the backend didn't answer, and the
 *  browser asks instead. Every price shown comes from the backend. */
export function Pricing({ plans, launch }: { plans: MemberPlan[] | null; launch: LaunchOffer | null }) {
  return <PricingClient initialPlans={plans} initialLaunch={launch} />;
}
