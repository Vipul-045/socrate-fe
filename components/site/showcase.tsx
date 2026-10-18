import {
  Container,
  MonoLabel,
  Section,
} from "@/components/site/primitives";
import { SHOWCASE } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Understand / Practice / Revise — one band each, copy beside a small
 * product mock. The middle band flips on desktop so the page zig-zags;
 * on mobile the copy always comes first.
 */

const mockCard =
  "min-w-0 rounded-xl border border-line-strong bg-card p-[clamp(1.375rem,2.8vw,2rem)]";
const chip =
  "inline-flex h-[26px] items-center rounded-md border border-line-strong px-2.5 font-mono text-xs text-ink-soft";

function Band({
  id,
  copy,
  flip = false,
  children,
}: {
  id: string;
  copy: { eyebrow: string; title: string; body: string };
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Section id={id} rule aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <Container>
        <div className="grid items-center gap-[clamp(2.25rem,6vw,5.5rem)] lg:grid-cols-2">
          <div className={cn("min-w-0 max-w-[460px]", flip && "lg:order-last")}>
            <MonoLabel className="mb-[clamp(1.125rem,2.2vw,1.5rem)]">
              {copy.eyebrow}
            </MonoLabel>
            <h2 id={`${id}-title`} className="text-h2 text-balance">
              {copy.title}
            </h2>
            <p className="mt-[clamp(1rem,2vw,1.25rem)] text-base leading-[1.7] text-pretty text-ink-soft">
              {copy.body}
            </p>
          </div>
          {children}
        </div>
      </Container>
    </Section>
  );
}

function ChatMock() {
  return (
    <div className={mockCard}>
      <MonoLabel className="mb-1.5">You asked</MonoLabel>
      <p className="mb-[22px] text-base font-medium leading-[1.45] tracking-[-0.012em]">
        Why does the Krebs cycle need oxygen if oxygen isn&apos;t used in any of
        its steps?
      </p>
      <div className="border-t border-[#eae6de] pt-5">
        <MonoLabel className="mb-1.5">Socrate</MonoLabel>
        <p className="text-body leading-[1.7] text-pretty text-[#3f3b34]">
          Because it depends on NAD⁺ being regenerated. The electron transport
          chain recycles NADH back into NAD⁺, and that chain only runs when
          oxygen is there to accept electrons at the end.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={chip}>p. 142 · §6.3</span>
          <span className={chip}>p. 147 · Fig. 6.9</span>
        </div>
      </div>
    </div>
  );
}

const QUIZ_OPTIONS = [
  "Cytoplasm",
  "Mitochondrial matrix",
  "Inner mitochondrial membrane",
  "Nucleus",
];

function QuizMock() {
  return (
    <div className={mockCard}>
      <div className="mb-4 flex justify-between gap-3">
        <MonoLabel as="span">Question 3 of 10</MonoLabel>
        <MonoLabel as="span">Chapter 6</MonoLabel>
      </div>
      <p className="mb-5 text-base font-medium leading-[1.45] tracking-[-0.012em]">
        Where in the cell does the Krebs cycle take place?
      </p>
      <ul className="flex flex-col gap-2">
        {QUIZ_OPTIONS.map((option, i) => {
          const correct = i === 1;
          return (
            <li
              key={option}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg border px-3.5 text-small",
                correct
                  ? "border-ink bg-paper text-ink"
                  : "border-line-strong text-[#3f3b34]",
              )}
            >
              <span
                className={cn(
                  "font-mono text-xs",
                  !correct && "text-ink-soft",
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
              {correct ? (
                <span className="ml-auto text-xs text-[#3f3b34]">Correct</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const NOTES = [
  {
    heading: "Glycolysis",
    text: "Glucose → 2 pyruvate in the cytoplasm. Net yield of 2 ATP and 2 NADH.",
  },
  {
    heading: "Krebs cycle",
    text: "Runs in the mitochondrial matrix. Produces NADH and FADH₂ for the electron transport chain.",
  },
  {
    heading: "Electron transport chain",
    text: "Oxygen is the final electron acceptor. This step produces most of the ATP.",
  },
];

function NotesMock() {
  return (
    <div className={mockCard}>
      <div className="flex items-baseline justify-between gap-3 border-b border-[#eae6de] pb-4">
        <p className="text-base font-medium tracking-[-0.015em]">
          Cellular respiration
        </p>
        <MonoLabel as="span">Notes · PDF</MonoLabel>
      </div>
      <div className="flex flex-col gap-4 pt-[18px]">
        {NOTES.map((note) => (
          <div key={note.heading}>
            <p className="mb-1 text-small font-medium">{note.heading}</p>
            <p className="text-small leading-[1.6] text-ink-soft">{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Showcase() {
  return (
    <>
      <Band id="understand" copy={SHOWCASE.understand}>
        <ChatMock />
      </Band>
      <Band id="practice" copy={SHOWCASE.practice} flip>
        <QuizMock />
      </Band>
      <Band id="revise" copy={SHOWCASE.revise}>
        <NotesMock />
      </Band>
    </>
  );
}
