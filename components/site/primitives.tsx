import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Container — the 1160px content box. Every full-bleed band puts one
 * of these inside itself so rules can span the viewport while content
 * stays aligned.
 * ------------------------------------------------------------------ */
export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("gutter-x mx-auto w-full max-w-shell", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Section — vertical rhythm + optional tone and top rule. The rule sits
 * on the section itself so it bleeds edge to edge.
 * ------------------------------------------------------------------ */
type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: "paper" | "surface";
  rule?: boolean;
  as?: "section" | "div" | "header" | "footer";
};

export function Section({
  className,
  tone = "paper",
  rule = false,
  as: Tag = "section",
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(
        "py-section",
        tone === "surface" ? "bg-surface" : "bg-paper",
        rule && "border-t border-line",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ *
 * MonoLabel — the tracked mono caption used for eyebrows, sequence
 * numbers, stat captions and dates.
 * ------------------------------------------------------------------ */
export function MonoLabel({
  className,
  as: Tag = "p",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "p" | "span" | "div" | "dt" }) {
  return (
    <Tag
      className={cn(
        "font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.14em] text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ *
 * SectionHeading — heading on the left, optional description parked on
 * the right column. Stacks under lg.
 * ------------------------------------------------------------------ */
export function SectionHeading({
  title,
  description,
  eyebrow,
  aside = false,
  className,
  id,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: string;
  /** Place the description in a right-hand column instead of below. */
  aside?: boolean;
  className?: string;
  id?: string;
}) {
  const heading = (
    <h2 id={id} className="text-h2 text-balance">
      {title}
    </h2>
  );

  if (aside) {
    return (
      <div
        className={cn(
          "grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-10",
          className,
        )}
      >
        <div className="lg:col-span-7">
          {eyebrow ? <MonoLabel className="mb-5">{eyebrow}</MonoLabel> : null}
          {heading}
        </div>
        {description ? (
          <p className="max-w-measure text-lede text-ink-soft lg:col-span-5 lg:col-start-9 lg:pt-2">
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("max-w-measure", className)}>
      {eyebrow ? <MonoLabel className="mb-5">{eyebrow}</MonoLabel> : null}
      {heading}
      {description ? (
        <p className="mt-5 text-lede text-ink-soft">{description}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * PageHeader — the top of every interior page: eyebrow, h1, lede, and
 * an optional control parked bottom-right (the billing toggle). It's
 * always on the first screen, so it rises in with CSS on first paint
 * like the hero rather than waiting on a scroll reveal.
 * ------------------------------------------------------------------ */
export function PageHeader({
  eyebrow,
  title,
  lede,
  action,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pb-[clamp(2.5rem,5vw,3.75rem)]", className)}>
      <MonoLabel className="mb-[clamp(1.375rem,3vw,1.875rem)] animate-rise-in tracking-[0.16em] text-ink-soft">
        {eyebrow}
      </MonoLabel>
      <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-10">
        <div>
          <h1 className="max-w-[760px] animate-rise-in text-page text-balance [--rise-delay:60ms]">
            {title}
          </h1>
          {lede ? (
            <p className="mt-[clamp(1.25rem,2.6vw,1.75rem)] max-w-[520px] animate-rise-in text-lede text-pretty text-ink-soft [--rise-delay:120ms]">
              {lede}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="shrink-0 animate-rise-in [--rise-delay:180ms]">{action}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Rule — a hairline that spans the content box.
 * ------------------------------------------------------------------ */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

/* ------------------------------------------------------------------ *
 * TextLink — an underlined link inside running copy.
 * ------------------------------------------------------------------ */
export function TextLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "text-[#3f3b34] underline decoration-[#c9c3b6] underline-offset-[3px] transition-colors hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
