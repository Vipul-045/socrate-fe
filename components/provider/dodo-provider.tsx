"use client";

import { useEffect } from "react";
import { DodoPayments } from "dodopayments-checkout";

export default function DodoProvider() {
  useEffect(() => {
    DodoPayments.Initialize({
      mode: "test", // change to "live" in production
      displayType: "overlay",
      onEvent: (event) => {
        console.log("Checkout event:", event);

        switch (event.event_type) {
          case "checkout.opened":
            break;
          case "checkout.closed":
            break;
          case "checkout.error":
            console.error("Checkout error:", event.data?.message);
            break;
        }
      },
    });
  }, []);

  return null;
}