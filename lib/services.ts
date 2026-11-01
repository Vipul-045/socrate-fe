// lib/services.ts

import { api } from "./Api";
import type { BillingCycle } from "./pricing";
import type { RazorpayPaymentResponse } from "@/types/razorpay";

export interface PlanFeature {
  featureId: string;
  featureKey: string;
  enabled: boolean;
  limit: number;
}

export interface MemberPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  tokenLimit: number;
  dailyTokenLimit: number;
  planFeatures: PlanFeature[];
  providerPlans: any[]
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetMemberPlansResponse {
  message: string;
  data: {
    PlanList: MemberPlan[];
  };
}

export function GetMemberPlans() {
  return api.get<GetMemberPlansResponse>("/MShip/plan");
}

export function grantFreePlan(planId: string) {
  return api.post("/Payment/grant-free-plan", { planId });
}

export interface OrderPriceBreakdown {
  baseAmount: number; // paise — the plan's price, all taxes included
  taxableAmount: number; // paise — for the invoice: baseAmount less the GST inside it
  gstAmount: number; // paise — the GST included in the price, never added to it
  gstPercent: number;
  gstInclusive: true;
  totalAmount: number; // paise — the amount actually charged, === baseAmount
  currency: string;
}

export interface OrderSummaryResponse {
  success: boolean;
  plan: {
    _id: string;
    name: string;
    description?: string;
    durationDays: number;
  };
  breakdown: OrderPriceBreakdown;
  /** The reader already has this plan (or a better one): paying would buy nothing. */
  alreadySubscribed?: boolean;
  activeUntil?: string | null;
}

// Pre-payment price for the checkout page: the plan's price, taxes included,
// is the total. Mirrors exactly what createOrder will charge — same backend
// util computes both, so these numbers never drift from what Razorpay bills.
export function getOrderSummary(planId: string) {
  return api.get<OrderSummaryResponse>(`/Payment/order-summary/${planId}`);
}

export interface CreateOrderResponse {
  success: boolean;
  order: { id: string; amount: number; currency: string };
  key_id: string;
  breakdown?: OrderPriceBreakdown;
}

// Called straight from the browser (not via a Next route) so the backend's
// session cookie on its own domain goes along with the request. Only the plan
// is sent: the backend prices it, and hands back the same open order for a
// repeat request (double click, retry, second tab). 409 ALREADY_SUBSCRIBED
// when the reader already has it.
export function createRazorpayOrder(planId: string) {
  return api.post<CreateOrderResponse>("/Payment/create-order", { planId });
}

// Backend recomputes the signature against its Order record, marks it paid
// and grants the membership. 400 VERIFICATION_FAILED proves nothing either
// way — the order's status (below) is asked next.
export function verifyRazorpayPayment(response: RazorpayPaymentResponse) {
  return api.post<{ success: boolean; status?: "paid"; message?: string }>("/Payment/verify-payment", {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  });
}
export type OrderStatus =
  /** No payment attempted yet. */
  | "created"
  /** A payment is with the bank (UPI awaiting approval, authorised, pending). */
  | "processing"
  | "paid"
  | "failed"
  /** Replaced by a newer checkout. */
  | "expired"
  /** Razorpay couldn't be asked just now — check again. */
  | "unknown";

export interface OrderStatusResponse {
  success: boolean;
  order: {
    id: string;
    status: OrderStatus;
    /** A code from lib/payment.ts' PaymentFailureCode when status is "failed". */
    failureReason?: string;
    planId: string;
    amount: number;
    currency: string;
  };
}

// The backend's answer, not the browser's: an unsettled order is checked
// with Razorpay itself, and a payment found there is granted on the spot.
export function getPaymentStatus(orderId: string) {
  return api.get<OrderStatusResponse>(`/Payment/order/${encodeURIComponent(orderId)}`);
}

/* ─── Subscriptions (recurring billing, 7-day free trial) ─── */

export interface AppliedCoupon {
  /** Normalised by the backend, e.g. "EARLYBIRD". */
  code: string;
  /** What the reader sees, e.g. "Early Bird Discount". */
  label: string;
}

export interface ValidateCouponResponse extends AppliedCoupon {
  success: true;
  valid: true;
}

// Only the code is sent: the backend maps it to a Razorpay offer and says
// whether it applies to this billing cycle. A code that doesn't is a 400
// COUPON_INVALID with a message written for the reader.
export function validateSubscriptionCoupon(couponCode: string, billingCycle: BillingCycle) {
  return api.post<ValidateCouponResponse>("/api/subscriptions/coupon/validate", { couponCode, billingCycle });
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscription_id: string;
  key_id: string;
  /** null: no trial (the account has had its one) — the first charge is taken in Checkout. */
  trial_end: string | null;
  /** Only when a coupon was applied. */
  coupon_applied?: AppliedCoupon;
}

// Starts the trial and returns the subscription_id Razorpay Checkout opens
// with. couponCode is left out entirely when none is applied. A code the
// backend (or Razorpay) refuses is a 400 COUPON_INVALID, never a
// subscription at full price: see couponRefusal() in
// hooks/use-subscription-coupon.ts.
export function createSubscription(billingCycle: BillingCycle, couponCode?: string | null) {
  return api.post<CreateSubscriptionResponse>("/api/subscriptions/create", {
    billingCycle,
    ...(couponCode ? { couponCode } : {}),
  });
}

export interface SubscriptionCycle {
  /** The MembershipPlan this cycle grants (what /pricing links to as planId). */
  planId: string;
  name: string;
  description: string | null;
  /** Paise, charged every cycle after the trial — Razorpay's own price. */
  amount: number;
  currency: string;
}

export interface SubscriptionSummaryResponse {
  success: boolean;
  trialDays: number;
  /** One free trial per account: false once this reader has had theirs — then it's charged today. */
  trialEligible: boolean;
  /** Only the cycles the backend can sell. */
  cycles: Partial<Record<BillingCycle, SubscriptionCycle>>;
  /** The reader already has the plan (a trial, a subscription, or a paid order). */
  alreadySubscribed: boolean;
  activeUntil: string | null;
}

// What /checkout shows before subscribing. 404 PLAN_NOT_FOUND when no cycle
// can be sold; 502 PRICE_UNAVAILABLE when Razorpay couldn't give the price.
export function getSubscriptionSummary() {
  return api.get<SubscriptionSummaryResponse>("/api/subscriptions/summary");
}

/** Pending until the mandate is authorised; trialing / active give the plan. */
export type SubscriptionStatus =
  | "pending"
  | "trialing"
  | "active"
  | "past_due"
  | "halted"
  | "cancelled"
  | "expired";

// Checkout's success callback. The backend checks Razorpay's signature and
// starts the trial. 400 VERIFICATION_FAILED proves nothing either way — the
// status (below) is asked next.
export function verifySubscription(response: RazorpayPaymentResponse) {
  return api.post<{ success: boolean; status: SubscriptionStatus; trial_end?: string | null }>("/api/subscriptions/verify", {
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_subscription_id: response.razorpay_subscription_id,
    razorpay_signature: response.razorpay_signature,
  });
}

export interface SubscriptionCheckoutStatusResponse {
  success: boolean;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    billingCycle?: BillingCycle;
    trialEnd?: string;
    couponCode: string | null;
  };
}

// Where a subscription started from /checkout stands (the backend's record,
// kept current by verify and Razorpay's webhooks). 404 if it isn't this
// reader's.
export function getSubscriptionCheckoutStatus(subscriptionId: string) {
  return api.get<SubscriptionCheckoutStatusResponse>(
    `/api/subscriptions/checkout/${encodeURIComponent(subscriptionId)}`,
  );
}
