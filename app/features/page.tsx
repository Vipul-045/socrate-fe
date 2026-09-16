import { SiteShell } from "@/components/site/site-shell";
import { FeatureGrid } from "@/components/site/feature-grid";
import { Faq } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";
import { Container, PageHeader, Section } from "@/components/site/primitives";

export const metadata = {
  title: "Features",
  description: "Everything you need to study smarter with AI.",
};

export default function FeaturesPage() {
  return (
    <SiteShell>
      <Section>
        <Container>
          <PageHeader
            eyebrow="Features"
            title="Everything you need to study smarter"
            lede="Powerful AI tools designed for students, researchers, and lifelong learners."
          />
          <FeatureGrid />
        </Container>
      </Section>

      <Faq />
      <CtaBand />
    </SiteShell>
  );
}
