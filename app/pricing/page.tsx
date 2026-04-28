import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing — Socrate",
  description: "Simple, transparent pricing. Start free. Upgrade when ready.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
