import type { Metadata } from "next";

import { NO_INDEX } from "@/lib/seo";

/** page.tsx is a client component and can't export metadata, so it lives here. */
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Socrate, or create a free account with Google.",
  robots: NO_INDEX,
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
