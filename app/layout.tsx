import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import DodoProvider from "@/components/provider/dodo-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Reserved for labels, sequence numbers, dates and stat captions.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://socrate.in"),
  title: {
    default: "Socrate — Drop your notes. Walk out knowing everything.",
    template: "%s — Socrate",
  },
  description:
    "Upload any document and have an AI tutor explain, summarize, and quiz you instantly.",
  icons: { icon: "/icon.png" },
  openGraph: {
    title: "Socrate — Drop your notes. Walk out knowing everything.",
    description:
      "Upload any document and have an AI tutor explain, summarize, and quiz you instantly.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f3ef",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-small focus:font-medium focus:text-card"
        >
          Skip to content
        </a>
        <DodoProvider />
        {children}
        <Toaster />

        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-EN7YHML2W7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EN7YHML2W7');
          `}
        </Script>
      </body>
    </html>
  );
}
