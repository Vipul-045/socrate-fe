import type { Metadata } from "next";

import { NO_INDEX } from "@/lib/seo";

/** page.tsx is a client component and can't export metadata, so it lives here. */
export const metadata: Metadata = {
  title: "Checkout",
  robots: NO_INDEX,
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
