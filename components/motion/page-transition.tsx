"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";

import { EASE_CALM } from "@/lib/motion";

// Module scope, so it outlives the remount every route change causes. Only
// ever set in an effect, so on the server it stays false.
let navigated = false;

/**
 * Fades each page in on client-side navigation. The first page load skips
 * it: that HTML comes from the server and has to be visible before any
 * JavaScript runs.
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [animateIn] = useState(() => navigated);

  useEffect(() => {
    navigated = true;
  }, []);

  return (
    <m.div
      className={className}
      initial={animateIn ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_CALM }}
    >
      {children}
    </m.div>
  );
}
