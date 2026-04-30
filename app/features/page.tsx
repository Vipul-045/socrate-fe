import { Navbar } from "@/components/landing/Navbar";
import { Features } from "@/components/landing/Features";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Features — Socrate",
  description: "Everything you need to study smarter with AI.",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Navbar />
      <div className="pt-16" />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
}
