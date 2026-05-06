import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Reveal, RevealGroup } from "@/hooks/use-reveal";
import { CheckoutButton } from "../provider/chekout-button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying things out",
    features: [
      "3 PDFs/month",
      "Basic chat",
      "Watermarked notes",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For serious students",
    features: [
      "Unlimited PDFs",
      "Full notes download",
      "Priority AI responses",
      "No watermarks",
      "Chat history",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Max",
    price: "$29",
    period: "/month",
    description: "For practical studies",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Admin panel",
      "Team analytics",
      "Priority support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/50 font-">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
        </Reveal>

        <RevealGroup
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          staggerMs={100}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-7 border transition-all ${
                plan.highlighted
                  ? "border-foreground bg-background shadow-xl shadow-foreground/5 scale-[1.02]"
                  : "border-border bg-background"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium">
                  {plan.badge}
                </div>
              )}
              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">
                  {plan.period}
                </span>
              </div>
              {plan.name === "Pro" ? (
                <CheckoutButton
                  label={plan.cta}
                  checkoutUrl="https://checkout.dodopayments.com/session/cks_123"
                />
              ) : (
                <Button
                  className="w-full mb-6"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/login">{plan.cta}</Link>
                </Button>
              )}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
