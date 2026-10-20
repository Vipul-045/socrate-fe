"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/**
 * Loads Framer's DOM animation features once for the whole site (the `m.*`
 * components stay tiny without them) and hands reduced-motion handling to
 * the OS setting: with it on, transforms snap to their end state and only
 * opacity still eases.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
