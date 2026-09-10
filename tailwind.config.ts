import type { Config } from "tailwindcss";

/**
 * Socrate theme.
 * Everything below is derived from the tokens declared in app/globals.css —
 * add a colour or a step here only if it also exists there.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },

      colors: {
        // Brand scale
        paper: "hsl(var(--paper) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)",
          soft: "hsl(var(--ink-soft) / <alpha-value>)",
          faint: "hsl(var(--ink-faint) / <alpha-value>)",
        },
        line: {
          DEFAULT: "hsl(var(--line) / <alpha-value>)",
          strong: "hsl(var(--line-strong) / <alpha-value>)",
          control: "hsl(var(--line-control) / <alpha-value>)",
        },

        // shadcn/ui contract
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      /**
       * Fluid type scale. Every step interpolates between its mobile and
       * desktop size, so layouts never need a font-size breakpoint.
       */
      fontSize: {
        display: [
          "clamp(2rem, 8.4vw, 4.5rem)",
          { lineHeight: "1.04", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        h1: [
          "clamp(2.125rem, 4.6vw, 3.75rem)",
          { lineHeight: "1.06", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        h2: [
          "clamp(1.625rem, 2.9vw, 2.375rem)",
          { lineHeight: "1.1", letterSpacing: "-0.026em", fontWeight: "500" },
        ],
        h3: [
          "clamp(1.375rem, 2vw, 1.75rem)",
          { lineHeight: "1.16", letterSpacing: "-0.022em", fontWeight: "600" },
        ],
        title: [
          "1.1875rem",
          { lineHeight: "1.34", letterSpacing: "-0.012em", fontWeight: "600" },
        ],
        stat: [
          "clamp(1.75rem, 2.4vw, 1.9375rem)",
          { lineHeight: "1", letterSpacing: "-0.028em", fontWeight: "600" },
        ],
        price: [
          "clamp(2.5rem, 4vw, 3.25rem)",
          { lineHeight: "1", letterSpacing: "-0.032em", fontWeight: "600" },
        ],
        lede: ["clamp(1.0625rem, 1.35vw, 1.25rem)", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.7" }],
        small: ["0.875rem", { lineHeight: "1.6" }],
      },

      maxWidth: {
        shell: "1224px", // 1160px content box + 2 × 32px gutter
        measure: "38rem", // ~68 characters
        prose: "44rem",
      },

      spacing: {
        section: "var(--section-y)",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        well: "0.875rem",
      },

      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
        "accordion-up": "accordion-up 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
        "rise-in": "rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
