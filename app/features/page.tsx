import { SiteShell } from "@/components/site/site-shell";
import { FeatureGrid } from "@/components/site/feature-grid";
import { FeatureSections } from "@/components/site/feature-sections";
import { FaqPointer } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/motion/reveal";
import {
  Container,
  PageHeader,
  Section,
  TextLink,
} from "@/components/site/primitives";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features: AI Notes, PDF Study, Quizzes & Flashcards",
  description:
    "Study with AI from your own notes and PDFs: explanations that cite the source page, search inside documents, an AI quiz generator, flashcards and notes you can export.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <SiteShell>
      <Section>
        <Container>
          <PageHeader
            eyebrow="Features"
            title="Study with AI, straight from your own notes and PDFs"
            lede="Socrate is an AI study platform built around the material you're actually examined on. Upload a PDF once, then understand it, practise on it and revise from it. Here's what each feature does and how students use it."
          />
          <FeatureGrid />
        </Container>
      </Section>

      <FeatureSections />

      <Section rule aria-labelledby="together-title">
        <Container>
          <div className="grid gap-[clamp(1.75rem,5vw,4.5rem)] lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <h2 id="together-title" className="text-h2 text-balance">
                How the features work together
              </h2>
            </Reveal>
            <Reveal
              delay={0.1}
              className="flex min-w-0 flex-col gap-[clamp(1rem,2vw,1.25rem)] text-base leading-[1.7] text-pretty text-ink-soft lg:col-span-6 lg:col-start-7">
              <p>
                Most study sessions use several features in a row. Upload the
                week&apos;s lecture slides, ask about the parts that didn&apos;t
                make sense, quiz yourself on the chapter, then finish with a set
                of notes and flashcards to revise from. Because every step works
                from the same document, the explanations, questions and notes
                all line up with what you&apos;ll be examined on.
              </p>
              <p>
                That loop — understand, practise, revise — follows what learning
                research recommends: testing yourself does more for exam
                preparation than reading the same pages again. We explain why in{" "}
                <TextLink href="/blog/why-re-reading-your-notes-doesnt-work">
                  why re-reading your notes doesn&apos;t work
                </TextLink>
                .
              </p>
              <p>
                Socrate is built for students preparing for exams, researchers
                working through dense papers, and anyone teaching themselves a
                new subject. It&apos;s free to start with 3 PDFs a month and no
                card required —{" "}
                <TextLink href="/pricing">compare plans and pricing</TextLink>{" "}
                when you need unlimited uploads.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <FaqPointer />
      <CtaBand />
    </SiteShell>
  );
}
