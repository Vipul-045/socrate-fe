import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom tokens in tailwind.config.ts. Without
// this it reads `text-small` as a colour and drops it next to `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "page", "price", "h1", "h2", "h3", "title", "lede", "body", "small"],
        },
      ],
      p: [{ p: ["section"] }],
      py: [{ py: ["section"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
