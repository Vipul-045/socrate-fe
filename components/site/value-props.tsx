import { Container } from "@/components/site/primitives";
import { VALUE_PROPS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Three promises separated by hairlines, sitting under the hero.
 *
 * On mobile the vertical dividers become horizontal ones so the row can
 * stack without losing its structure. `compact` drops the supporting line
 * for tight columns (the login panel), where it would wrap three deep.
 */
export function ValueProps({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <ul
      className={cn(
        "grid border-t border-line",
        compact ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3",
        className,
      )}
    >
      {VALUE_PROPS.map((item, i) => (
        <li
          key={item.title}
          className={cn(
            compact
              ? "py-6 pr-4 sm:pr-6"
              : "border-b border-line py-8 last:border-b-0 md:border-b-0 md:px-4 md:py-10 md:text-center lg:px-6",
            !compact && i > 0 && "md:border-l md:border-line",
            compact && i > 0 && "border-l border-line pl-4 sm:pl-6",
          )}
        >
          <p
            className={cn(
              "font-semibold tracking-[-0.02em] text-ink",
              compact
                ? "text-body leading-snug"
                : "text-[clamp(1.125rem,1.9vw,1.375rem)] leading-snug",
            )}
          >
            {item.title}
          </p>
          {!compact ? (
            <p className="mt-3 text-small text-ink-soft text-pretty">
              {item.description}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
