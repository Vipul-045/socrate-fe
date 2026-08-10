// components/pricing/pricing-section.tsx
import { headers } from "next/headers";
import { resolveCountryCode } from "@/lib/geo";
import { regionFromCountryCode, PRO_DISPLAY_PRICING } from "@/lib/pricing";
import { PricingClient, type Plan } from "./pricing-client";

export async function Pricing() {
  const headersList = await headers();
  const countryCode = await resolveCountryCode(headersList);
  const region = regionFromCountryCode(countryCode);
  const proPricing = PRO_DISPLAY_PRICING[region];

  const plans: Plan[] = [
    {
      id: "starter",
      name: "Free",
      price: "0",
      originalPrice: null,
      period: "/forever",
      discountBadge: null,
      description: "Perfect for trying things out",
      features: ["3 PDFs/month", "Basic chat", "Watermarked notes"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: proPricing.price,
      originalPrice: proPricing.originalPrice,
      period: "/month",
      discountBadge: proPricing.discountBadge,
      description: "For serious students",
      features: [
        "Unlimited PDFs",
        "Full notes download",
        "Priority AI responses",
        "No watermarks",
        "Chat history",
      ],
      cta: "Start your 7 day free trial",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      id: "max",
      name: "Max",
      price: "*",
      originalPrice: null,
      period: "/month",
      discountBadge: null,
      description: "For practical studies",
      features: [
        "Everything in Pro",
        "Collaborate with friends",
        "Extended Premium chats",
        "Ai video generations",
        "Priority support",
      ],
      cta: "Coming soon",
      highlighted: false,
    },
  ];

  return <PricingClient plans={plans} />;
}