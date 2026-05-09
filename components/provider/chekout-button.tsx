// components/CheckoutButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { DodoPayments } from "dodopayments-checkout";
import { useEffect, useState } from "react";

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize the SDK
    DodoPayments.Initialize({
      mode: "test",
      displayType: "overlay",
      onEvent: (event) => {
        switch (event.event_type) {
          case "checkout.opened":
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
    try {
      setIsLoading(true);
      await DodoPayments.Checkout.open({
        checkoutUrl: "https://checkout.dodopayments.com/session/cks_123"
      });
    } catch (error) {
      console.error("Failed to open checkout:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout}
      disabled={isLoading}
      className="mb-6"
    >
      {isLoading ? "Loading..." : "Checkout Now"}
    </Button>
  );
}