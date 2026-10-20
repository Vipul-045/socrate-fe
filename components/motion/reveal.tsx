"use client";

import type { ComponentType } from "react";
import { m, type HTMLMotionProps } from "framer-motion";

import {
  GROUP_VIEWPORT,
  REVEAL_VIEWPORT,
  groupVariants,
  itemVariants,
  revealVariants,
} from "@/lib/motion";

/*
 * Scroll reveals. Each renders the real element (a grid's <li>, a section's
 * column) rather than wrapping it, so `last:`, `even:` and grid placement
 * keep working.
 *
 * Content above the fold doesn't use these: they can't start until the page
 * hydrates, so the hero and page headers rise in with CSS on first paint.
 *
 * `data-reveal` is what the <noscript> rule in the root layout un-hides, so
 * nothing stays invisible when JavaScript doesn't run.
 */

const TAGS = {
  div: m.div,
  section: m.section,
  article: m.article,
  ul: m.ul,
  ol: m.ol,
  li: m.li,
};

type Tag = keyof typeof TAGS;

type Props = Omit<
  HTMLMotionProps<"div">,
  "initial" | "animate" | "whileInView" | "viewport" | "variants" | "custom"
> & {
  as?: Tag;
};

const tag = (as: Tag) => TAGS[as] as ComponentType<HTMLMotionProps<"div">>;

/** One block that fades up once as it enters the viewport. */
export function Reveal({
  as = "div",
  delay = 0,
  ...props
}: Props & { delay?: number }) {
  const Comp = tag(as);
  return (
    <Comp
      data-reveal=""
      initial="hidden"
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
      variants={revealVariants}
      custom={delay}
      {...props}
    />
  );
}

/** Paces its `RevealItem` children one after another. Doesn't move itself. */
export function RevealGroup({
  as = "div",
  delay = 0,
  ...props
}: Props & { delay?: number }) {
  const Comp = tag(as);
  return (
    <Comp
      initial="hidden"
      whileInView="show"
      viewport={GROUP_VIEWPORT}
      variants={groupVariants}
      custom={delay}
      {...props}
    />
  );
}

/** A card or row inside a `RevealGroup`; takes its cue from the group. */
export function RevealItem({ as = "div", ...props }: Props) {
  const Comp = tag(as);
  return <Comp data-reveal="" variants={itemVariants} {...props} />;
}
