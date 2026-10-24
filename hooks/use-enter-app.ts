"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useUser } from "@/components/provider/authoprovider";
import { GetMemberPlans, grantFreePlan } from "@/lib/services";
import { APP_URL } from "@/lib/navigation";

/**
 * Takes a signed-in reader into the app — the same account and session, so
 * nothing there asks them to sign in again. An account with no plan yet is
 * given Free on the way, as the pricing page always has; if that can't be
 * done right now the reader still goes on (the app works without it), so
 * this never leaves anyone stuck on a button.
 */
export function useEnterApp() {
  const { userInfo, membership } = useUser();
  const [entering, setEntering] = useState(false);
  const busy = useRef(false);

  // Coming back with the browser's Back button restores this page as it was
  // left — mid-"Opening…". Give the button back.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      busy.current = false;
      setEntering(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const enterApp = useCallback(
    async (freePlanId?: string) => {
      if (busy.current) return;
      busy.current = true;
      setEntering(true);
      if (userInfo && !membership) {
        try {
          const planId =
            freePlanId ?? (await GetMemberPlans()).data.PlanList.find((plan) => plan.price === 0)?._id;
          if (planId) await grantFreePlan(planId);
        } catch (err) {
          console.error("Couldn't start the free plan before opening the app:", err);
        }
      }
      window.location.assign(APP_URL);
    },
    [userInfo, membership],
  );

  return { enterApp, entering };
}
