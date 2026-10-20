"use client";

import { m, useScroll, useTransform } from "framer-motion";

import { useScrollLinkedMotion } from "@/components/motion/use-scroll-linked-motion";

/**
 * The hero copy eases back as the reader scrolls past it: a little lighter
 * and a little higher over the first screen of scrolling, never gone. The
 * hero always sits at the top of the page, so the window's scroll offset is
 * all it needs to track.
 */
export function HeroScrollFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const enabled = useScrollLinkedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 640], [1, 0.4]);
  const y = useTransform(scrollY, [0, 640], [0, -36]);

  return (
    <m.div
      className={className}
      style={enabled ? { opacity, y } : { opacity: 1, y: 0 }}
    >
      {children}
    </m.div>
  );
}
