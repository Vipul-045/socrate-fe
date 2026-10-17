import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/site/primitives";

export function CtaBand({
  title = "Start with your next document.",
  note = "Free to start. Cancel anytime.",
  action = { label: "Get Started Free", href: "/login" },
}: {
  title?: React.ReactNode;
  note?: string;
  action?: { label: string; href: string };
}) {
  return (
    <Section tone="surface" rule className="py-[clamp(4.5rem,9vw,7.5rem)]">
      <Container>
        <div className="flex flex-col gap-[clamp(1.5rem,4vw,3rem)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-measure text-h1 text-balance">{title}</h2>
            <p className="mt-3.5 text-body text-ink-soft">{note}</p>
          </div>
          <Button
            size="lg"
            className="h-[52px] w-full rounded-lg px-7 text-[15px] tracking-[-0.008em] sm:w-auto sm:self-start lg:self-auto"
            asChild
          >
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
