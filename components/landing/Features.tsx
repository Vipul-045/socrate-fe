import {
  FileText,
  MessageSquare,
  StickyNote,
  Download,
  Search,
  FlaskConical,
} from "lucide-react";
import { Reveal, RevealGroup } from "@/hooks/use-reveal";

const features = [
  {
    icon: FileText,
    title: "Upload Any PDF",
    description:
      "Drag and drop any document — textbooks, papers, reports — and start learning instantly.",
  },
  {
    icon: MessageSquare,
    title: "Chat with Your Document",
    description:
      "Ask questions in natural language and get precise answers sourced from your PDF.",
  },
  {
    icon: StickyNote,
    title: "Auto-Generate Notes",
    description:
      "One click to generate structured, comprehensive notes from any document.",
  },
  {
    icon: Download,
    title: "Download Notes as PDF",
    description:
      "Export your AI-generated notes as beautifully formatted PDFs.",
  },
  {
    icon: Search,
    title: "Smart Search Inside PDFs",
    description:
      "Find exactly what you need with AI-powered semantic search.",
  },
  {
    icon: FlaskConical,
    title: "Quiz Yourself on Content",
    description:
      "Test your understanding with auto-generated quizzes based on your documents.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/50">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to study smarter
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful AI tools designed for students, researchers, and lifelong
              learners.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerMs={80}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-background border border-border hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/[0.03] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
