import { SiteShell } from "@/components/site/site-shell";
import { Pricing } from "@/components/landing/pricing/Pricing";
import { Faq } from "@/components/site/faq";

export const metadata = {
  title: "Pricing — Socrate",
  description: "Simple, transparent pricing. Start free. Upgrade when ready.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <Pricing />
      <Faq />
    </SiteShell>
  );
}
