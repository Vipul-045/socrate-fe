// lib/services.ts

import { api } from "./Api";
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
  baseAmount: number; // paise
  convenienceFee: number; // paise
  gstAmount: number; // paise
  gstPercent: number;
  convenienceFeePercent: number;
  totalAmount: number; // paise — the amount actually charged
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
}

// Pre-payment price breakdown (base price + convenience fee + GST) for the
// checkout page. Mirrors exactly what createOrder will charge — same backend
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
// session cookie on its own domain goes along with the request.
export function createRazorpayOrder(planId: string) {
  return api.post<CreateOrderResponse>("/Payment/create-order", { planId });
}

// Backend recomputes the signature against its Order record, marks it paid
// and grants the membership.
export function verifyRazorpayPayment(response: RazorpayPaymentResponse) {
  return api.post<{ success: boolean; message?: string }>("/Payment/verify-payment", {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  });
}