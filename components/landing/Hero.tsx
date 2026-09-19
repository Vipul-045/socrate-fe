import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/hooks/use-reveal";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center max-w-6xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-medium mb-6 border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              Built to make sure nothing goes over your head
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.08] font tracking-tight mb-6">
              Drop your notes.<br/>
              <span className="text-muted-foreground">Walk out knowing everything.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload any document and have an AI tutor explain, summarize, and
              quiz you instantly.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {/* <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <a href="/features">See Features</a>
              </Button> */}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
