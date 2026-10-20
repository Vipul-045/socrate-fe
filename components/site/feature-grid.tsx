import type { CSSProperties } from "react";
import Link from "next/link";

import { MonoLabel } from "@/components/site/primitives";
import { FEATURES } from "@/lib/content";

/**
 * A ruled grid rather than a set of cards — the hairlines carry the
 * structure so nothing needs a shadow. 3 up on desktop, 2 on tablet,
 * 1 on phones. Every cell owns its bottom rule; the vertical rules sit
 * only between columns, never on the outer edge.
 *
 * On /features it doubles as the page's index: each cell jumps to that
 * feature's section, which carries the heading, so the titles here aren't
 * headings themselves.
 *
 * It sits on the first screen under the page header, so the cells carry on
 * that header's CSS entrance rather than waiting for a scroll reveal.
 */
export function FeatureGrid() {
  return (
    <nav aria-label="Features on this page">
      <ul className="grid border-t border-line-strong sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <li
            key={feature.id}
            style={{ "--rise-delay": `${220 + Math.min(i, 5) * 60}ms` } as CSSProperties}
            className="relative animate-rise-in border-b border-line-strong py-[clamp(1.75rem,3.5vw,2.5rem)] sm:px-[clamp(1.375rem,2.6vw,2.125rem)] sm:even:border-l lg:even:border-l-0 lg:[&:not(:nth-child(3n+1))]:border-l"
          >
            <MonoLabel>{String(i + 1).padStart(2, "0")}</MonoLabel>
            <p className="mb-2.5 mt-[clamp(1rem,2vw,1.375rem)] text-title text-balance text-ink">
              {/* The ::after stretches the link over the whole cell. */}
              <Link
                href={`#${feature.id}`}
                className="transition-colors after:absolute after:inset-0 after:content-[''] hover:text-ink-soft"
              >
                {feature.title}
              </Link>
            </p>
            <p className="text-small leading-[1.7] text-pretty text-ink-soft">
              {feature.summary}
            </p>
          </li>
        ))}
      </ul>
    </nav>
  );
}
