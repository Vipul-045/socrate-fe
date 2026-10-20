import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  prefix: "",
  // Touch screens fire :hover on tap and then keep it, which leaves rows and
  // links stuck in their hover colour. Only apply hover where it's real.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-space-grotesk)"],
        serif: ["var(--font-crimson)"],
      },

      colors: {
        // Site palette — warm paper and ink, from the Socrate design.
        paper: "#f6f4f0",
        surface: "#f1eee8",
        ink: {
          DEFAULT: "#1a1815",
          hover: "#33302a",
          soft: "#6b665d",
          muted: "#7d786e",
          faint: "#938e83",
        },
        line: {
          DEFAULT: "#e6e2d9",
          strong: "#e0dbd1",
          control: "#ddd8cd",
        },
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
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontSize: {
        // 34px at 320, 37px at 375, 40px at 430, 74px from ~1000 up. The
        // vh term only bites on short screens (phones in landscape), where
        // a width-driven headline would fill the whole viewport.
        display: [
          "clamp(2rem, min(0.9rem + 6vw, 1rem + 9vh), 4.625rem)",
          { lineHeight: "1.03", letterSpacing: "-0.038em", fontWeight: "500" },
        ],
        // Interior page titles (Features, Pricing, Contact, legal pages).
        page: [
          "clamp(2.125rem, 5.6vw, 3.75rem)",
          { lineHeight: "1.06", letterSpacing: "-0.035em", fontWeight: "500" },
        ],
        price: [
          "clamp(2.375rem, 4.4vw, 3.25rem)",
          { lineHeight: "1", letterSpacing: "-0.04em", fontWeight: "500" },
        ],
        h1: [
          "clamp(1.75rem, 3.8vw, 2.75rem)",
          { lineHeight: "1.08", letterSpacing: "-0.033em", fontWeight: "500" },
        ],
        h2: [
          "clamp(1.625rem, 3.4vw, 2.375rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        h3: [
          "clamp(1.3125rem, 2.4vw, 1.6875rem)",
          { lineHeight: "1.22", letterSpacing: "-0.026em", fontWeight: "500" },
        ],
        title: [
          "1.1875rem",
          { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "500" },
        ],
        lede: [
          "clamp(1rem, 1.4vw, 1.125rem)",
          { lineHeight: "1.6", letterSpacing: "-0.008em" },
        ],
        body: ["0.9375rem", { lineHeight: "1.6" }],
        small: ["0.875rem", { lineHeight: "1.65" }],
      },
      maxWidth: {
        shell: "1160px",
        measure: "520px",
      },
      padding: {
        section: "clamp(3.5rem, 8vw, 6.5rem)",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(.2,.7,.3,1)",
      },
      borderRadius: {
        well: "14px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        // First-paint entrance for the hero and page headers. Stagger by
        // setting `[--rise-delay:120ms]` on each piece.
        "rise-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.6s cubic-bezier(.2,.7,.3,1) var(--rise-delay, 0ms) both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
