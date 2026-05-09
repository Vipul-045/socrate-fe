"use client";

import { Button } from "@/components/ui/button";
import { DodoPayments } from "dodopayments-checkout";
import { useEffect, useState } from "react";

type CheckoutButtonProps = {
  label: string;
  checkoutUrl: string;
};

export function CheckoutButton({
  label,
  checkoutUrl,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
        checkoutUrl,
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
      {isLoading ? "Loading..." : label}
    </Button>
  );
}