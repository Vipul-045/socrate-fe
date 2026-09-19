import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/site/primitives";

export function CtaBand({
  title = (
    <>
      Start with your
      <br />
      next document.
    </>
  ),
  note = "Free to start. Cancel anytime.",
  action = { label: "Get Started Free", href: "/login" },
}: {
  title?: React.ReactNode;
  note?: string;
  action?: { label: string; href: string };
}) {
  return (
    <Section tone="surface" rule>
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div>
            <h2 className="text-h1 text-balance">{title}</h2>
            <p className="mt-6 text-lede text-ink-soft">{note}</p>
          </div>
          <Button size="lg" className="w-full sm:w-auto sm:self-start lg:self-auto" asChild>
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
