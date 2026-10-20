import { SiteShell } from "@/components/site/site-shell";
import { Pricing } from "@/components/landing/pricing/Pricing";
import { FaqPointer } from "@/components/site/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing. Start free with 3 PDFs a month and no card required, then upgrade to Pro for unlimited uploads when you're ready.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <SiteShell>
      <Pricing />
      <FaqPointer text="Questions about plans, uploads, cancelling or student discounts?" />
    </SiteShell>
  );
}
