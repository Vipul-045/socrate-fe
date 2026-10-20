"use client";

import { useState, useSyncExternalStore } from "react";
import { m } from "framer-motion";

import { FAQS, type FaqItem } from "@/lib/content";
import { collapseVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

const noop = () => () => {};

/** False on the server and during hydration, true once React owns the page. */
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** The + collapses to a − on open; nothing else moves. */
function Indicator({ open, enhanced }: { open: boolean; enhanced: boolean }) {
  return (
    <span
      aria-hidden
      className="relative ml-4 mt-1.5 h-3 w-3 shrink-0 text-ink-soft transition-colors group-hover:text-ink sm:ml-6"
    >
      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
      <span
        className={cn(
          "absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-200 ease-calm",
          // Before hydration the native [open] state drives it; after, React
          // does, so the − turns back into a + as soon as a close starts.
          enhanced ? open && "scale-y-0" : "group-open:scale-y-0",
        )}
      />
    </span>
  );
}

function FaqRow({
  faq,
  Question,
  open,
  enhanced,
  onOpenChange,
}: {
  faq: FaqItem;
  Question: "h2" | "h3";
  open: boolean;
  enhanced: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Keeps the native [open] attribute on through the closing animation, so
  // the answer is still rendered while it collapses.
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);

  return (
    <details
      // Without JavaScript the browser keeps one answer open at a time;
      // once hydrated React does, so closes can animate.
      name={enhanced ? undefined : "faq"}
      open={open || present}
      // Opened by the browser itself — find-in-page, or a click before
      // hydration finished. Follow it.
      onToggle={(e) => {
        if (e.currentTarget.open && !open) onOpenChange(true);
      }}
      className="group border-t border-line last:border-b"
    >
      <summary
        onClick={(e) => {
          if (!enhanced) return;
          e.preventDefault();
          onOpenChange(!open);
        }}
        className="flex cursor-pointer list-none items-start justify-between py-5 text-left [&::-webkit-details-marker]:hidden"
      >
        <Question className="text-[1.0625rem] font-medium leading-snug tracking-[-0.01em] text-ink">
          {faq.q}
        </Question>
        <Indicator open={open} enhanced={enhanced} />
      </summary>
      <m.div
        data-collapse=""
        initial={false}
        animate={open ? "open" : "closed"}
        variants={collapseVariants}
        onAnimationComplete={(definition) => {
          if (definition === "closed") setPresent(false);
        }}
        className="overflow-hidden"
      >
        <p className="max-w-[52ch] pb-6 pr-8 text-small text-ink-soft">
          {faq.a}
        </p>
      </m.div>
    </details>
  );
}

/**
 * Native <details> rather than a JS accordion: every answer is in the
 * server-rendered HTML, so crawlers and readers without JavaScript get it
 * whether or not the question is opened. With JavaScript, Framer eases the
 * answer open and closed in every browser; one stays open at a time.
 */
export function FaqList({
  items = FAQS,
  headingLevel = "h3",
  className,
}: {
  items?: readonly FaqItem[];
  /** h3 under a section's h2; h2 when the list sits straight under the page h1. */
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const enhanced = useHydrated();

  return (
    <div className={className}>
      {items.map((faq, i) => (
        <FaqRow
          key={faq.q}
          faq={faq}
          Question={headingLevel}
          open={openIndex === i}
          enhanced={enhanced}
          onOpenChange={(next) =>
            setOpenIndex((current) =>
              next ? i : current === i ? null : current,
            )
          }
        />
      ))}
    </div>
  );
}
