import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { DemoVideo } from "@/components/landing/DemoVideo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <Navbar />
      <Hero />
      <DemoVideo />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}
