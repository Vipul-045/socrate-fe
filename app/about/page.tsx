import { SiteShell } from "@/components/site/site-shell";
import { CtaBand } from "@/components/site/cta-band";
import { JsonLd } from "@/components/site/json-ld";
import {
  Container,
  PageHeader,
  Section,
  TextLink,
} from "@/components/site/primitives";
import { AUDIENCES, CONTACT_CHANNELS } from "@/lib/content";
import { ENTITY_DESCRIPTION, aboutJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: { absolute: "About Socrate: a study platform that cites its sources" },
  description:
    "Socrate is a study platform for your own notes and PDFs: explanations that cite the source page, quizzes, flashcards and notes you can export. Why we built it and how it works.",
  path: "/about",
});

const EMAIL = CONTACT_CHANNELS.find((channel) => channel.label === "Email");

const prose = "text-base leading-[1.7] text-pretty text-ink-soft";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line-strong py-[clamp(1.75rem,3.4vw,2.5rem)] lg:grid-cols-12 lg:gap-10">
      <h2 className="text-[clamp(1.1875rem,2vw,1.4375rem)] font-medium leading-tight tracking-[-0.022em] lg:col-span-4">
        {title}
      </h2>
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-7 lg:col-start-6">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <SiteShell>
      <JsonLd data={aboutJsonLd()} />
      <Section>
        <Container>
          <PageHeader eyebrow="About" title="About Socrate" lede={ENTITY_DESCRIPTION} />

          <div className="border-b border-line-strong">
            <Row title="Why Socrate exists">
              <p className={prose}>
                Most students end up studying the same way: read the chapter,
                highlight what looks important, then read the highlights again
                the night before. It feels productive, but recognising a page
                isn&apos;t the same as being able to recall it in an exam.
              </p>
              <p className={prose}>
                Socrate is built to move study time from re-reading to
                understanding and practice — working from the notes and PDFs
                you&apos;re actually examined on, not a generic textbook.{" "}
                <TextLink href="/blog/why-re-reading-your-notes-doesnt-work">
                  Why re-reading your notes doesn&apos;t work
                </TextLink>{" "}
                explains the research behind that.
              </p>
            </Row>

            <Row title="How we approach AI for studying">
              <p className={prose}>
                A study tool has an unusual failure mode: if it invents a
                definition, you might memorise it and repeat it in an exam. So
                every answer in Socrate comes from your own document and points
                back to the page it came from, and when the document doesn&apos;t
                contain an answer, Socrate says so instead of guessing.
              </p>
              <p className={prose}>
                An answer you can check in ten seconds is worth more than a
                longer one you have to trust. Read{" "}
                <TextLink href="/blog/how-we-built-an-ai-tutor-that-cites-its-sources">
                  how we built an AI tutor that cites its sources
                </TextLink>{" "}
                for the details.
              </p>
            </Row>

            <Row title="What you can do with it">
              <ul className="flex flex-col gap-3">
                <li className={prose}>
                  <span className="font-medium text-ink">Understand —</span> ask
                  questions about your material and get explanations that cite
                  the source page, or search inside your PDFs by meaning.
                </li>
                <li className={prose}>
                  <span className="font-medium text-ink">Practise —</span>{" "}
                  generate quizzes and exam-style questions from what you
                  uploaded, and see where to look when you get one wrong.
                </li>
                <li className={prose}>
                  <span className="font-medium text-ink">Revise —</span> create
                  structured notes and flashcards, and export your notes as a
                  PDF.
                </li>
              </ul>
              <p className={prose}>
                <TextLink href="/features">Explore Socrate features</TextLink> in
                detail, or{" "}
                <TextLink href="/pricing">compare plans and pricing</TextLink> —
                Socrate is free to start, with no card required.
              </p>
            </Row>

            <Row title="Who it's for">
              <ul className="flex flex-col gap-3">
                {AUDIENCES.map((audience) => (
                  <li key={audience.title} className={prose}>
                    <span className="font-medium text-ink">{audience.title} —</span>{" "}
                    {audience.description}
                  </li>
                ))}
              </ul>
            </Row>

            <Row title="Your documents">
              <p className={prose}>
                Your documents are encrypted in transit and at rest, and are
                never used to train models. You can delete any file from your
                dashboard at any time. The{" "}
                <TextLink href="/privacy">privacy policy</TextLink> covers exactly
                what we collect and why.
              </p>
            </Row>

            <Row title="Get in touch">
              <p className={prose}>
                Questions, feedback or partnership ideas: email{" "}
                {EMAIL && "href" in EMAIL ? (
                  <a
                    href={EMAIL.href}
                    className="text-[#3f3b34] underline decoration-[#c9c3b6] underline-offset-[3px] transition-colors hover:text-ink"
                  >
                    {EMAIL.value}
                  </a>
                ) : null}{" "}
                or use the <TextLink href="/contact">contact form</TextLink>. A
                real person reads every message. Common questions are answered
                in the <TextLink href="/faq">Socrate FAQ</TextLink>.
              </p>
            </Row>
          </div>
        </Container>
      </Section>
      <CtaBand />
    </SiteShell>
  );
}
