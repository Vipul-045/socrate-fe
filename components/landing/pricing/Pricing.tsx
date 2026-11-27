// components/pricing/pricing-section.tsx
import { headers } from "next/headers";
import { resolveCountryCode } from "@/lib/geo";
import { regionFromCountryCode, PRO_DISPLAY_PRICING } from "@/lib/pricing";
import type { MemberPlan } from "@/lib/services";
import { PricingClient } from "./pricing-client";

/** `plans` are read on the server (lib/plans.ts), so they are in the page's
 *  HTML; null when the backend didn't answer, and the browser asks instead. */
export async function Pricing({ plans }: { plans: MemberPlan[] | null }) {
  const headersList = await headers();
  const countryCode = await resolveCountryCode(headersList);
  const region = regionFromCountryCode(countryCode);
  const proPricing = PRO_DISPLAY_PRICING[region];

  return <PricingClient proPricing={proPricing} initialPlans={plans} />;
}
