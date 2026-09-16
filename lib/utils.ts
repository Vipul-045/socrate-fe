import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's stock scales. Our theme adds custom
 * font sizes (`text-h2`) and colours (`text-ink-soft`), and without this
 * registration it treats them as the same `text-*` group and silently drops
 * one — e.g. `text-card text-small` would lose the colour.
 */
const BRAND_COLORS = [
  "paper",
  "surface",
  "ink",
  "ink-soft",
  "ink-faint",
  "line",
  "line-strong",
  "line-control",
  "card",
];

const FONT_SIZES = [
  "display",
  "h1",
  "h2",
  "h3",
  "title",
  "stat",
  "price",
  "lede",
  "body",
  "small",
];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      colors: BRAND_COLORS,
      borderRadius: ["well"],
    },
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
