import { headers } from "next/headers";

import { resolveCountryCode } from "@/lib/geo";
import { regionFromCountryCode, PRO_DISPLAY_PRICING } from "@/lib/pricing";
import { PricingClient, type Plan } from "./pricing-client";

/**
 * Server component: region (and therefore currency) is resolved from the
 * request, never from the client, so the displayed price always matches
 * the product the checkout API will charge.
 */
export async function Pricing() {
  const headersList = headers();
  const countryCode = await resolveCountryCode(headersList);
  const region = regionFromCountryCode(countryCode);
  const pro = PRO_DISPLAY_PRICING[region];

  const plans: Plan[] = [
    {
      id: "starter",
      name: "Free",
      description: "Perfect for trying things out",
      pricing: {
        monthly: {
          price: "$0",
          period: "/forever",
          originalPrice: null,
          discountBadge: null,
          note: null,
        },
        yearly: {
          price: "$0",
          period: "/forever",
          originalPrice: null,
          discountBadge: null,
          note: null,
        },
      },
      features: ["3 PDFs/month", "Basic chat", "Watermarked notes"],
      cta: "Get Started",
      href: "/login",
      kind: "link",
    },
    {
      id: "pro",
      name: "Pro",
      badge: "Most popular",
      description: "For serious students",
      pricing: pro,
      features: [
        "Unlimited PDFs",
        "Full notes download",
        "Priority AI responses",
        "No watermarks",
        "Chat history",
      ],
      cta: "Start your 7 day free trial",
      kind: "checkout",
      highlighted: true,
    },
    {
      id: "max",
      name: "Max",
      badge: "Coming soon",
      description: "For practical studies",
      pricing: null,
      priceNote: "Pricing to be announced",
      features: [
        "Everything in Pro",
        "Collaborate with friends",
        "Extended premium chats",
        "AI video generations",
        "Priority support",
      ],
      cta: "Coming soon",
      kind: "disabled",
    },
  ];

  // Free plan price is region-agnostic zero — show it in the local symbol.
  if (region === "IN") {
    plans[0].pricing = {
      monthly: { ...plans[0].pricing!.monthly, price: "₹0" },
      yearly: { ...plans[0].pricing!.yearly, price: "₹0" },
    };
  }

  return <PricingClient plans={plans} />;
}
