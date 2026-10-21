import type { Metadata } from "next";

import { NO_INDEX } from "@/lib/seo";

/* page.tsx is a client component and can't export metadata, so it lives here.
   The link's token is in the URL fragment, which is never sent anywhere; no
   referrer as well, for good measure. */
export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm the email address on your Socrate account.",
  robots: NO_INDEX,
  referrer: "no-referrer",
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
