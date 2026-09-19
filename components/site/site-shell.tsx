import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

/** Nav + main + footer. Every public page renders inside one of these. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
