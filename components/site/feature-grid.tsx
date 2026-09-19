import { MonoLabel } from "@/components/site/primitives";
import { FEATURES } from "@/lib/content";

/**
 * A ruled grid rather than a set of cards — the hairlines carry the
 * structure so nothing needs a shadow. 4 up on desktop, 2 on tablet,
 * 1 on phones; the cell borders stay coherent at each count because
 * every cell owns its own left and bottom rule.
 */
export function FeatureGrid() {
  return (
    <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((feature, i) => (
        <li
          key={feature.title}
          className="border-b border-line px-0 py-8 sm:border-l sm:px-6 sm:py-9 lg:px-7 lg:py-10"
        >
          <MonoLabel>{String(i + 1).padStart(2, "0")}</MonoLabel>
          <h2 className="mt-7 text-title text-balance sm:mt-10">
            {feature.title}
          </h2>
          <p className="mt-3 text-small text-ink-soft">{feature.description}</p>
        </li>
      ))}
    </ul>
  );
}
