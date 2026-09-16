import { headers } from "next/headers";

import { resolveCountryCode } from "@/lib/geo";
import { regionFromCountryCode, PRO_DISPLAY_PRICING } from "@/lib/pricing";
import { PricingClient } from "./pricing-client";

/**
 * Server component: region (and therefore currency) is resolved from the
 * request, never from the client, so the displayed price always matches
 * the product the checkout API will charge.
 */
export async function Pricing() {
  const headersList = headers();
  const countryCode = await resolveCountryCode(headersList);
  const region = regionFromCountryCode(countryCode);
  const pro = PRO_DISPLAY_PRICING[region];


  return <PricingClient />;
}
