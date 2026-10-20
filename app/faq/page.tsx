import { SiteShell } from "@/components/site/site-shell";
import { FaqList } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import {
  Container,
  PageHeader,
  Section,
  TextLink,
} from "@/components/site/primitives";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers about Socrate: supported file types, how accurate the AI is, privacy, mobile use, note exports, plans, cancelling and student discounts.",
  path: "/faq",
});

/** The one full FAQ — and the only page that marks it up as FAQPage. */
export default function FaqPage() {
  return (
    <SiteShell>
      <JsonLd data={faqJsonLd()} />
      <Section>
        <Container>
          <PageHeader
            eyebrow="FAQ"
            title="Frequently asked questions"
            lede={
              <>
                Uploads, accuracy, privacy and billing. Can&apos;t find your
                answer? <TextLink href="/contact">Contact us</TextLink> and a
                real person will reply within 48 hours.
              </>
            }
          />
          <FaqList headingLevel="h2" className="max-w-[760px]" />
        </Container>
      </Section>
      <CtaBand />
    </SiteShell>
  );
}
