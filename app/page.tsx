import { SiteShell } from "@/components/site/site-shell";
import { Hero } from "@/components/site/hero";
import { DemoVideo } from "@/components/site/demo-video";
import { Showcase } from "@/components/site/showcase";
import { HowItWorks } from "@/components/site/how-it-works";
import { WhoItsFor } from "@/components/site/who-its-for";
import { LatestPosts } from "@/components/site/latest-posts";
import { Faq } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <DemoVideo />
      <Showcase />
      <HowItWorks />
      <WhoItsFor />
      <LatestPosts />
      <Faq />
      <CtaBand
        variant="centered"
        lede="Upload a PDF and have your first explanation, quiz, and set of notes in minutes."
        secondary={{ label: "See pricing", href: "/pricing" }}
        note="Free to start · Cancel anytime"
      />
    </SiteShell>
  );
}
