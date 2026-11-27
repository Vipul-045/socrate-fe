import Link from "next/link";
import { ArrowRight, ArrowUp, Mail } from "lucide-react";

import { Container, MonoLabel, Rule } from "@/components/site/primitives";
import { FooterWordmark } from "@/components/site/footer-wordmark";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CONTACT_CHANNELS, FOOTER_NAV, LEGAL_LINKS } from "@/lib/content";
import { cn } from "@/lib/utils";

const EMAIL = CONTACT_CHANNELS[0];

// The underline draws in from the left on hover and keyboard focus. Drawn
// as a background so it follows the text when a label wraps.
const underline =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-px transition-[background-size] duration-300 ease-calm group-hover/link:bg-[length:100%_1px] group-focus-visible/link:bg-[length:100%_1px]";

const navLink =
  "group/link inline-flex min-h-11 items-center gap-1.5 text-small text-ink-soft transition-colors duration-200 ease-calm hover:text-ink focus-visible:text-ink sm:min-h-9";

export function Footer() {
  return (
    <footer className="relative isolate border-t border-line bg-paper">
      {/* Lamplight: a soft, warm glow rising from the foot of the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[min(70%,560px)] bg-[radial-gradient(55%_75%_at_50%_100%,#fdfbf6_0%,rgba(253,251,246,0)_100%)]"
      />

      {/* Spacing scales with the shorter of width and height, so on a
          laptop or desktop the whole footer fits in one screen under the
          sticky header. */}
      <Container className="pt-[clamp(1.75rem,min(8vw,5.5svh),5rem)]">
        <RevealGroup className="grid gap-[clamp(2.75rem,6vw,4rem)] lg:grid-cols-12 lg:gap-10">
          {/* Brand: logo, the statement, what Socrate is. On tablets the
              statement and the description sit side by side. */}
          <RevealItem className="grid gap-x-10 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Link
              href="/"
              className="-my-2 inline-flex min-h-11 items-center justify-self-start text-[1.25rem] font-semibold tracking-[-0.025em] text-ink md:col-span-2 lg:col-span-1"
              aria-label="Socrate — home"
            >
              Socrate
            </Link>

            {/* Broken by hand so "makes sense." always lands as a pair. */}
            <p className="mt-[clamp(1rem,min(3vw,2.6svh),1.75rem)] font-serif text-[clamp(2rem,min(4vw,5.4svh),2.75rem)] leading-[1.06] tracking-[-0.015em] text-ink">
              Ask until it
              <br />
              <span className="italic text-ink-soft">makes sense.</span>
            </p>

            <div className="mt-5 md:mt-[clamp(1rem,min(3vw,2.6svh),1.75rem)] md:pt-1.5 lg:mt-[clamp(0.875rem,2svh,1.25rem)] lg:pt-0">
              <p className="max-w-[400px] text-small text-pretty text-ink-soft">
                Socrate is an AI study platform. Upload your notes and PDFs, get
                explanations that cite the source page, then quiz yourself and
                revise.
              </p>
              <a
                href={EMAIL.href}
                className="mt-[clamp(1rem,2.6svh,1.5rem)] inline-flex h-11 max-w-full items-center gap-2.5 rounded-lg border border-line-control px-4 text-small text-[#3f3b34] transition-colors duration-200 ease-calm hover:border-[#cfc9bc] hover:bg-[#efece5] hover:text-ink"
              >
                <Mail className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                <span className="truncate">{EMAIL.value}</span>
              </a>
            </div>
          </RevealItem>

          <nav aria-label="Footer" className="lg:col-span-7 lg:pt-2">
            <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-8">
              {FOOTER_NAV.map((group) => {
                const headingId = `footer-${group.title.toLowerCase()}`;
                return (
                  <RevealItem key={group.title}>
                    <MonoLabel id={headingId} className="mb-4 text-ink-faint">
                      {group.title}
                    </MonoLabel>
                    <ul aria-labelledby={headingId} className="-my-2.5 sm:-my-1.5">
                      {group.links.map((link) => {
                        const primary = link.label === "Get started";
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className={cn(navLink, primary && "text-ink")}
                            >
                              <span className={underline}>{link.label}</span>
                              {primary ? (
                                <ArrowRight
                                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-calm group-hover/link:translate-x-0.5"
                                  aria-hidden
                                />
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </nav>
        </RevealGroup>

        <Rule className="mt-[clamp(2rem,min(7vw,5.5svh),5rem)]" />

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between lg:py-4">
          <p className="text-xs tracking-[0.01em] text-ink-muted sm:flex-1">
            © {new Date().getFullYear()} Socrate. All rights reserved.
          </p>
          <MonoLabel
            as="span"
            className="hidden shrink-0 text-ink-faint lg:inline"
          >
            Understand · Practice · Revise
          </MonoLabel>
          <ul className="-mx-2 flex flex-wrap items-center gap-x-1 text-xs tracking-[0.01em] sm:-my-2 sm:flex-1 sm:justify-end">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group/link inline-flex min-h-11 items-center px-2 text-ink-soft transition-colors duration-200 hover:text-ink focus-visible:text-ink sm:min-h-9"
                >
                  <span className={underline}>{link.label}</span>
                </Link>
              </li>
            ))}
            <li className="ml-auto sm:ml-3">
              {/* "#top" scrolls to the top of any page, with or without an
                  element by that id. */}
              <a
                href="#top"
                className="group/link inline-flex min-h-11 items-center gap-1.5 px-2 text-ink transition-colors duration-200 sm:min-h-9"
              >
                <span className={underline}>Back to top</span>
                <ArrowUp
                  className="h-3.5 w-3.5 transition-transform duration-200 ease-calm group-hover/link:-translate-y-0.5"
                  aria-hidden
                />
              </a>
            </li>
          </ul>
        </div>
      </Container>

      {/* The signature: the name, oversized and cut off by the page edge. */}
      <Container className="mt-[clamp(0.5rem,min(3vw,2.5svh),1.75rem)]">
        <FooterWordmark />
      </Container>
    </footer>
  );
}
