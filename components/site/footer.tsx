import Link from "next/link";

import { Container, Rule } from "@/components/site/primitives";
import { FOOTER_LINKS } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="pb-[max(clamp(2.5rem,5vw,3.5rem),env(safe-area-inset-bottom))] pt-[clamp(2.5rem,5vw,3.5rem)]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <Link
              href="/"
              className="-my-2.5 inline-block py-2.5 text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink lg:my-0 lg:py-1"
            >
              Socrate
            </Link>
            <span className="text-small text-ink-soft">Learning made easy</span>
          </div>

          <nav aria-label="Footer">
            <ul className="-my-2.5 grid grid-cols-1 gap-x-8 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:-my-2 lg:flex lg:flex-wrap lg:justify-end lg:gap-x-8">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center text-small text-ink-soft transition-colors duration-200 hover:text-ink lg:inline-block lg:min-h-0 lg:py-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Rule className="mt-[clamp(1.75rem,3.5vw,2.5rem)] border-[#eae6de]" />

        <p className="mt-5 text-xs tracking-[0.01em] text-ink-muted">
          © {new Date().getFullYear()} Socrate. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
