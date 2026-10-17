import { MonoLabel } from "@/components/site/primitives";
import { FEATURES } from "@/lib/content";

/**
 * A ruled grid rather than a set of cards — the hairlines carry the
 * structure so nothing needs a shadow. 3 up on desktop, 2 on tablet,
 * 1 on phones. Every cell owns its bottom rule; the vertical rules sit
 * only between columns, never on the outer edge.
 */
export function FeatureGrid() {
  return (
    <ul className="grid border-t border-line-strong sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature, i) => (
        <li
          key={feature.title}
          className="border-b border-line-strong py-[clamp(1.75rem,3.5vw,2.5rem)] sm:px-[clamp(1.375rem,2.6vw,2.125rem)] sm:even:border-l lg:even:border-l-0 lg:[&:not(:nth-child(3n+1))]:border-l"
        >
          <MonoLabel>{String(i + 1).padStart(2, "0")}</MonoLabel>
          <h2 className="mb-2.5 mt-[clamp(1rem,2vw,1.375rem)] text-title text-balance">
            {feature.title}
          </h2>
          <p className="text-small leading-[1.7] text-pretty text-ink-soft">
            {feature.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
