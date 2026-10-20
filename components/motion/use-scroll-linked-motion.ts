"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const WIDE = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(WIDE);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Whether effects that track the scroll position (the hero fade, the demo
 * well's scale) should run. They're a tablet/desktop nicety: on phones they
 * compete with the browser's collapsing toolbars, and they're off for anyone
 * who asked for reduced motion. Always false on the server and during
 * hydration, so the first render matches the HTML.
 */
export function useScrollLinkedMotion() {
  const wide = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
  const reduce = useReducedMotion();
  return wide && !reduce;
}
