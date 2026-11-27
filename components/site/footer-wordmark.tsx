"use client";

import { useRef } from "react";
import { m } from "framer-motion";

import { EASE_CALM } from "@/lib/motion";

/*
 * The oversized "Socrate" that closes every page. It's drawn in SVG so the
 * word always spans the content box exactly, whatever the screen width.
 *
 * The letters are made of ruled lines, like writing on a notebook page.
 * They fade out toward the bottom of the footer, which cuts them off.
 * On short screens the cut comes sooner (the word keeps its full width
 * and loses height instead), so the footer still fits in one screen.
 * Moving a mouse over them fills in the lines under the pointer, like a
 * reading lamp. Touch and reduced-motion users get the still version.
 *
 * Purely decorative: the brand name is real text in the footer above it.
 */

// The viewBox is 1000 wide. The baseline sits below the bottom edge, so
// the footer cuts the word off just under its lowercase letters.
const W = 1000;
const H = 190;
const BASELINE = 216;
const FONT_SIZE = 292;
const CAP_TOP = 12;
// The distance between rules, and how much of each one the ink covers.
const PITCH = 7;
const STROKE = 5.25;
const LAMP_RADIUS = 150;
// The letters dissolve into the page toward the bottom edge.
const FADE = "linear-gradient(to bottom, #000 40%, transparent)";

export function FooterWordmark() {
  const svgRef = useRef<SVGSVGElement>(null);
  const lampRef = useRef<SVGRadialGradientElement>(null);
  const frame = useRef(0);

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const svg = svgRef.current;
      const lamp = lampRef.current;
      if (!svg || !lamp) return;
      // The word is scaled to the box's width and cropped from below, so
      // one scale serves both axes.
      const box = svg.getBoundingClientRect();
      const scale = box.width / W;
      lamp.setAttribute("cx", String((clientX - box.left) / scale));
      lamp.setAttribute("cy", String((clientY - box.top) / scale));
    });
  };

  const word = (
    <text
      x={0}
      y={BASELINE}
      textLength={W}
      lengthAdjust="spacing"
      fontSize={FONT_SIZE}
      fontWeight={500}
      letterSpacing="-0.045em"
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      Socrate
    </text>
  );

  return (
    <div className="overflow-hidden [container-type:inline-size]">
      <m.div
        data-reveal=""
        initial={{ opacity: 0, y: "38%" }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.1, ease: EASE_CALM }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMin slice"
          // Full height where there's room; on short screens, down to about
          // two thirds of it. The fade follows whatever height is shown.
          className="group/wordmark block h-[clamp(12.5cqw,23svh,19cqw)] w-full select-none"
          style={{ maskImage: FADE, WebkitMaskImage: FADE }}
          aria-hidden
          focusable="false"
          onPointerMove={onPointerMove}
        >
          <defs>
            <pattern
              id="socrate-wm-rules"
              width={PITCH}
              height={PITCH}
              patternUnits="userSpaceOnUse"
            >
              <rect width={PITCH} height={STROKE} fill="#fff" />
            </pattern>
            <mask id="socrate-wm-stripes" maskUnits="userSpaceOnUse">
              <rect width={W} height={H} fill="url(#socrate-wm-rules)" />
            </mask>

            <linearGradient
              id="socrate-wm-ink"
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={CAP_TOP}
              x2={0}
              y2={H}
            >
              <stop offset="0" stopColor="#1a1815" stopOpacity="0.92" />
              <stop offset="0.5" stopColor="#3f3b34" stopOpacity="0.78" />
              <stop offset="1" stopColor="#938e83" stopOpacity="0.5" />
            </linearGradient>

            <radialGradient
              ref={lampRef}
              id="socrate-wm-lamp-light"
              gradientUnits="userSpaceOnUse"
              cx={-W}
              cy={-H}
              r={LAMP_RADIUS}
            >
              <stop offset="0" stopColor="#fff" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="socrate-wm-lamp" maskUnits="userSpaceOnUse">
              <rect width={W} height={H} fill="url(#socrate-wm-lamp-light)" />
            </mask>
          </defs>

          <g fill="url(#socrate-wm-ink)" mask="url(#socrate-wm-stripes)">
            {word}
          </g>
          <g
            fill="#1a1815"
            mask="url(#socrate-wm-lamp)"
            className="opacity-0 transition-opacity duration-500 ease-calm group-hover/wordmark:opacity-100"
          >
            {word}
          </g>
        </svg>
      </m.div>
    </div>
  );
}
