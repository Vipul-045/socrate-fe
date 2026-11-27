import { SiteShell } from "@/components/site/site-shell";
import { Pricing } from "@/components/landing/pricing/Pricing";
import { FaqPointer } from "@/components/site/faq";
import { JsonLd } from "@/components/site/json-ld";
import { PLANS, fetchPricing, limitsPhrase, planDrift, rupees } from "@/lib/plans";
import { pageMetadata, pricingJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing: Free and Pro Plans",
  description: `Start free with no card: ${limitsPhrase(PLANS.free.limits)} a month. Pro is ${rupees(PLANS.pro.price)} a month, with higher limits and a ${PLANS.pro.trialDays}-day free trial.`,
  path: "/pricing",
});

export default async function PricingPage() {
  // Read here, on the server, so the plans, prices and limits are in the
  // HTML and in the structured data (lib/plans.ts).
  const { plans, launch } = await fetchPricing();

  // The rest of the site states the plans from lib/plans.ts: say so when
  // the backend now sells something different.
  const drift = plans ? planDrift(plans) : [];
  if (drift.length > 0) {
    console.warn(`lib/plans.ts no longer matches GET /MShip/plan:\n  ${drift.join("\n  ")}`);
  }

  return (
    <SiteShell>
      <JsonLd data={pricingJsonLd(plans)} />
      <Pricing plans={plans} launch={launch} />
      <FaqPointer text="Questions about plans, uploads, cancelling or student discounts?" />
    </SiteShell>
  );
}
