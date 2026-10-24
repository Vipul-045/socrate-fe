// Minimal ambient typing for the Razorpay Checkout script
// (https://checkout.razorpay.com/v1/checkout.js). No official @types package
// exists, so this covers just what components/provider/razorpay-checkout-button.tsx uses.

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  subscription_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  /** Whether Checkout offers another attempt after a failure (default true). */
  retry?: { enabled?: boolean };
  handler?: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
  };
}

/** What Checkout passes to `payment.failed`. Shown to no one: mapped to a code (lib/payment.ts). */
export interface RazorpayPaymentFailure {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

export interface RazorpayCheckoutInstance {
  open: () => void;
  close?: () => void;
  on(event: "payment.failed", handler: (response: RazorpayPaymentFailure) => void): void;
  on(event: string, handler: (response: unknown) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}
