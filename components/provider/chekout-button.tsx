"use client";

import { Button } from "@/components/ui/button";
import { DodoPayments } from "dodopayments-checkout";
import { useEffect, useState } from "react";

type CheckoutButtonProps = {
  label: string;
  planId: string;       
  billingCycle: "monthly" | "yearly";
};

// Initialize ONCE at module level, not inside the component
let dodoInitialized = false;

export function CheckoutButton({ label, planId, billingCycle }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (dodoInitialized) return;
    dodoInitialized = true;

    DodoPayments.Initialize({
      mode: process.env.NEXT_PUBLIC_DODO_MODE as "test" | "live" || "test",
      displayType: "overlay",
      onEvent: (event) => {
        switch (event.event_type) {
          case "checkout.opened":
            setIsLoading(false);
            break;
          case "checkout.closed":
            setIsLoading(false);
            break;
          case "checkout.error":
            setIsLoading(false);
            console.error("Checkout error:", event.data?.message);
            break;
        }
      },
    });
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // 1. Ask your backend to create the session and return the URL
        const res = await fetch("/api/payments/checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");

      const data = await res.json();
      const checkoutUrl: string = data.checkoutUrl;

      console.log("checkoutUrl:", checkoutUrl);

      if (!checkoutUrl || !checkoutUrl.startsWith("http")) {
        throw new Error(`Invalid checkoutUrl received: ${checkoutUrl}`);
      }

      // 2. Open the overlay with the real URL
      await DodoPayments.Checkout.open({ checkoutUrl });

    } catch (error) {
      console.error("Failed to open checkout:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className="mb-6">
      {isLoading ? "Loading..." : label}
    </Button>
  );
}