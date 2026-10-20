import type { Transition, Variants } from "framer-motion";

/* ------------------------------------------------------------------ *
 * The site's one motion language. Everything that moves reads its
 * timing from here, and the CSS side (tailwind `ease-calm`, the
 * `rise-in` keyframes) uses the same curve, so a CSS hover and a
 * Framer reveal never feel like two different products.
 * ------------------------------------------------------------------ */

/** Same curve as tailwind's `ease-calm`: a quick start that settles slowly. */
export const EASE_CALM = [0.2, 0.7, 0.3, 1] as const;

export const DURATION = {
  /** Hover, press, small state changes. */
  fast: 0.2,
  /** Cards and list items. */
  item: 0.5,
  /** Section blocks and the demo well. */
  reveal: 0.6,
} as const;

/** Gap between siblings in a staggered group. */
export const STAGGER = 0.07;

/** How far things travel. Small on purpose: motion should be felt, not watched. */
export const DISTANCE = {
  reveal: 28,
  item: 18,
} as const;

/**
 * Small blocks reveal once a fifth of them is on screen. Groups can be
 * taller than the viewport (a stacked list on a phone), where a fraction
 * would leave the first card sitting blank in view — so they trigger off
 * their top edge crossing the lower part of the screen instead.
 */
export const REVEAL_VIEWPORT = { once: true, amount: 0.2 } as const;
export const GROUP_VIEWPORT = {
  once: true,
  margin: "0px 0px -12% 0px",
} as const;

const reveal = (delay = 0): Transition => ({
  duration: DURATION.reveal,
  ease: EASE_CALM,
  delay,
});

/** A single block: a section heading, a mock, a CTA. `custom` is the delay. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: DISTANCE.reveal },
  show: (delay: number = 0) => ({ opacity: 1, y: 0, transition: reveal(delay) }),
};

/** The parent of a staggered set. It doesn't move; it only paces its children. */
export const groupVariants: Variants = {
  hidden: {},
  show: (delay: number = 0) => ({
    transition: { staggerChildren: STAGGER, delayChildren: delay },
  }),
};

/** One card or row inside a group. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: DISTANCE.item },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.item, ease: EASE_CALM },
  },
};

/** FAQ answers. Height has to animate here; it's one element, on a click. */
export const collapseVariants: Variants = {
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.32, ease: EASE_CALM },
      opacity: { duration: 0.24, ease: EASE_CALM, delay: 0.06 },
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.28, ease: EASE_CALM },
      opacity: { duration: DURATION.fast * 0.75, ease: EASE_CALM },
    },
  },
};
