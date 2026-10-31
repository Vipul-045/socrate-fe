import { SiteShell } from "@/components/site/site-shell";
import { Hero } from "@/components/site/hero";
import { DemoVideo } from "@/components/site/demo-video";
import { Showcase } from "@/components/site/showcase";
import { HowItWorks } from "@/components/site/how-it-works";
import { WhoItsFor } from "@/components/site/who-its-for";
import { LatestPosts } from "@/components/site/latest-posts";
import { Faq } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import { FAQS } from "@/lib/content";
import demoPoster from "@/public/videos/socrate-demo-poster.jpg";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  homeJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

const FEATURED_FAQS = FAQS.filter((faq) => faq.featured);

export default function HomePage() {
  return (
    <SiteShell>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <DemoVideo
        src="/videos/Socrate-Product-Demo.mp4"
        poster={demoPoster}
        duration={50}
      />
      <Showcase />
      <HowItWorks />
      <WhoItsFor />
      <LatestPosts />
      <Faq items={FEATURED_FAQS} seeAll />
      <CtaBand
        variant="centered"
        lede="Upload a PDF and have your first explanation, quiz, and set of notes in minutes."
        secondary={{ label: "Compare plans and pricing", href: "/pricing" }}
        note="Free to start · Cancel anytime"
      />
    </SiteShell>
  );
}
