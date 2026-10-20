import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { PageTransition } from "@/components/motion/page-transition";

/**
 * Nav + main + footer. Every public page renders inside one of these. The
 * nav stays put between routes; only what's under it fades in.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <Navbar />
      <PageTransition className="flex flex-1 flex-col">
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </PageTransition>
    </div>
  );
}
