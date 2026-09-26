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
  const headersList = await headers();
  const countryCode = await resolveCountryCode(headersList);
  const region = regionFromCountryCode(countryCode);
  const pro = PRO_DISPLAY_PRICING[region];

  // Only the monthly cycle has a published price; the yearly column falls
  // back to `priceNote` until one exists.
  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      description: "Start reading with an AI tutor, no card required.",
      pricing: null,
      priceNote: "Free forever",
      features: ["3 PDFs every month", "No card required"],
      cta: "Get Started Free",
      href: "/login",
      kind: "link",
    },
    {
      id: "pro",
      name: "Pro",
      description: "For students who study from PDFs every day.",
      badge: "Most popular",
      pricing: { monthly: { ...pro, period: "/month" } },
      priceNote: "Yearly billing coming soon",
      features: ["Unlimited uploads", "Summaries, Q&A and quizzes"],
      cta: "Upgrade to Pro",
      kind: "checkout",
      highlighted: true,
    },
    {
      id: "max",
      name: "Max",
      description: "Everything in Pro, with more room to work.",
      pricing: null,
      priceNote: "Coming soon",
      features: ["Unlimited uploads"],
      cta: "Coming soon",
      kind: "disabled",
    },
  ];

  return <PricingClient plans={plans} />;
}
