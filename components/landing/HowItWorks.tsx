import { Upload, MessageCircleQuestion, BookOpen } from "lucide-react";
import { Reveal, RevealGroup } from "@/hooks/use-reveal";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload your PDF",
    description:
      "Drag and drop any document into Socrate. We support all PDF formats.",
  },
  {
    icon: MessageCircleQuestion,
    number: "02",
    title: "Ask questions or generate notes",
    description:
      "Chat with your document or let AI create comprehensive study notes for you.",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Download & study smarter",
    description: "Export your notes, review key concepts, and ace your exams.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to transform your study experience.
            </p>
          </div>
        </Reveal>

        <RevealGroup
          className="grid md:grid-cols-3 gap-8 md:gap-12"
          staggerMs={150}
        >
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto mb-5">
                <step.icon className="h-7 w-7 text-foreground" />
              </div>
              <span className="text-xs font-mono text-muted-foreground mb-2 block">
                {step.number}
              </span>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
