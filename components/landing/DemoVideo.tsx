import { Play, FileText, MessageSquare, Star } from "lucide-react";
import { Reveal, RevealGroup } from "@/hooks/use-reveal";

const stats = [
  { icon: FileText, label: "PDFs Analyzed", value: "10K+" },
  { icon: MessageSquare, label: "Notes Generated", value: "500K+" },
  { icon: Star, label: "User Rating", value: "4.9★" },
];

export function DemoVideo() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Socrate in Action
            </h2>
            <p className="text-muted-foreground text-lg">
              Watch how students are transforming their study workflow
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden bg-muted border border-border aspect-video flex items-center justify-center cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent" />
            <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
              <Play className="h-8 w-8 text-foreground ml-1" />
            </div>
          </div>
        </Reveal>

        <RevealGroup
          className="flex flex-wrap justify-center gap-6 mt-12"
          staggerMs={100}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-muted border border-border"
            >
              <stat.icon className="h-4 w-4 text-foreground" />
              <span className="font-semibold text-sm text-foreground">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
