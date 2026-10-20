import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Space_Grotesk, Crimson_Text } from "next/font/google";
import DodoProvider from "../components/provider/dodo-provider";
import { UserProvider } from "@/components/provider/authoprovider";
import { MotionProvider } from "@/components/motion/motion-provider";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  LOCALE,
  SITE_NAME,
  SITE_URL,
  TITLE_TEMPLATE,
} from "@/lib/seo";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const GA_MEASUREMENT_IDS = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

// Site-wide defaults. Canonicals and index directives are set per page
// (lib/seo.ts → pageMetadata), never here — every route would inherit them.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: LOCALE,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/icon.png",
  },
};

// `cover` lets the paper background run under the notch and home indicator;
// Container and the mobile menu pad themselves back out with safe-area insets.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f4f0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${crimsonText.variable}`}
    >
      <body>
        {/* Scroll reveals render hidden until JavaScript plays them in; without
            it, show everything where it belongs. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                "[data-reveal]{opacity:1!important;transform:none!important}[data-collapse]{height:auto!important;opacity:1!important}",
            }}
          />
        </noscript>
        <UserProvider>
        <DodoProvider/>
        <MotionProvider>{children}</MotionProvider>
        <Toaster />
        </UserProvider>

        <Analytics />

        {GA_MEASUREMENT_IDS.length > 0 && (
          <>
            <Script
              id="ga4-script"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_IDS[0]}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${GA_MEASUREMENT_IDS.map(
                  (id) => `gtag('config', '${id}');`
                ).join("\n                ")}
              `}
            </Script>
          </>
        )}

        <Script
          src="https://cdn.flowsery.com/main.js"
          strategy="afterInteractive"
          data-fl-website-id="flid_fMIM7nCNgJeJmBKsGt7_Ew"
          data-cookieless="true"
          data-local="true"
        />
      </body>
    </html>
  );
}