"use client";

import { LogOutUser } from "@/lib/userinfo_service";
import { api, ApiError } from "@/lib/Api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

export interface UserInfo {
  picture: string;
  name: string;
  email?: string;
}

export interface PlanInfo {
  planId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationDays: number;
  dailyTokenLimit?: number;
  planFeatures?: {
    featureId: string;
    featureKey: string;
    enabled: boolean;
    limit?: number;
  }[];
}

export interface MembershipInfo {
  membershipId: string;
  status: "active" | "cancelled" | "expired" | "trial" | "pending" | "trialing" | "past_due" | "halted";
  tokenLimit: number;
  tokensUsed: number;
  tokensRemaining: number;
  startDate: string;
  /** Paid orders only: a subscription runs until it's cancelled. */
  endDate?: string;
  /** Subscriptions: when the free trial ends and the first charge is taken. */
  trialEnd?: string;
  /** Subscriptions: when the current paid period ends (the next renewal). */
  currentPeriodEnd?: string;
  billingCycle?: "monthly" | "yearly";
  /** A subscription (it can be cancelled), not a one-time order. */
  isSubscription?: boolean;
  /** Cancelled with its paid period still running: the plan until endDate, then it won't renew. */
  cancelAtPeriodEnd?: boolean;
  isAutoRenew: boolean;
  plan: PlanInfo | null;
}

/** "pro" while a paid plan is running; "free" otherwise (including no plan yet). */
export type PlanTier = "free" | "pro";

/** The statuses that give the plan: paid (order or subscription), a
 *  subscription's free trial, or a renewal Razorpay is retrying (a grace
 *  period). The backend's ACCESS_STATUSES. */
const ACCESS_STATUSES: ReadonlySet<MembershipInfo["status"]> = new Set(["active", "trialing", "past_due"]);

export function tierOf(membership: MembershipInfo | null): PlanTier {
  if (!membership || !ACCESS_STATUSES.has(membership.status) || !membership.plan) return "free";
  if (membership.endDate && new Date(membership.endDate).getTime() <= Date.now()) return "free";
  return membership.plan.price > 0 ? "pro" : "free";
}

export interface SessionSnapshot {
  userInfo: UserInfo | null;
  membership: MembershipInfo | null;
  /** null when signed out. */
  tier: PlanTier | null;
}

interface UserContextValue extends SessionSnapshot {
  isLoading: boolean;
  /** Re-fetch user + membership from the backend, and return what it said.
   *  `quiet`: no loading state, and a backend that can't be reached leaves
   *  the session as it was instead of signing the reader out. */
  refresh: (options?: { quiet?: boolean }) => Promise<SessionSnapshot>;
  /** Sign the user out and clear local state. */
  logout: () => Promise<void>;
}

const SIGNED_OUT: SessionSnapshot = { userInfo: null, membership: null, tier: null };

/* A quiet re-check when the reader comes back to the tab — they may have
   signed out, or upgraded, in the app meanwhile. Not more often than this. */
const FOCUS_RECHECK_MS = 15_000;

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionSnapshot>(SIGNED_OUT);
  const [isLoading, setIsLoading] = useState(true);
  const lastCheck = useRef(0);
  const current = useRef<SessionSnapshot>(SIGNED_OUT);
  const setSession = useCallback((next: SessionSnapshot) => {
    current.current = next;
    setSessionState(next);
  }, []);

  /* The backend's answer, always: plan and sign-in state are never kept in
     the browser. A quiet check keeps what's on screen if the backend can't
     be reached; only a definite "no session" signs the reader out. */
  const probe = useCallback(async (quiet: boolean): Promise<SessionSnapshot> => {
    lastCheck.current = Date.now();
    try {
      const data = await api.get<{ user: UserInfo; membership: MembershipInfo | null }>("/user");
      const next: SessionSnapshot = data?.user
        ? { userInfo: data.user, membership: data.membership ?? null, tier: tierOf(data.membership ?? null) }
        : SIGNED_OUT;
      setSession(next);
      return next;
    } catch (err) {
      if (quiet && !(err instanceof ApiError && err.status === 401)) return current.current;
      setSession(SIGNED_OUT);
      return SIGNED_OUT;
    }
  }, [setSession]);

  const refresh = useCallback(async (options?: { quiet?: boolean }) => {
    if (options?.quiet) return probe(true);
    setIsLoading(true);
    try {
      return await probe(false);
    } finally {
      setIsLoading(false);
    }
  }, [probe]);

  const logout = useCallback(async () => {
    try {
      await LogOutUser();
    } finally {
      setSession(SIGNED_OUT);
    }
  }, [setSession]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const recheck = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCheck.current < FOCUS_RECHECK_MS) return;
      probe(true);
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [probe]);

  return (
    <UserContext.Provider value={{ ...session, isLoading, refresh, logout }}>
      {children}
    </UserContext.Provider>
  );
}

/** Access the current user + membership. Must be used within <UserProvider>. */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a <UserProvider>");
  }
  return ctx;
}
