import Link from "next/link";

import { Container, Rule } from "@/components/site/primitives";
import { FOOTER_LINKS } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="py-14 sm:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <Link
              href="/"
              className="inline-block py-1 text-[1.1875rem] font-bold tracking-[-0.02em] text-ink"
            >
              Socrate
            </Link>
            <span className="text-small text-ink-soft">Learning made easy</span>
          </div>

          <nav aria-label="Footer">
            <ul className="-my-2 grid grid-cols-1 gap-x-8 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end lg:gap-x-8">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block py-2 text-small text-ink-soft transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Rule className="mt-10 sm:mt-12" />

        <p className="mt-7 text-small text-ink-faint">
          © {new Date().getFullYear()} Socrate. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
