// lib/payment.ts
//
// What the checkout page says about plans, prices and payments. Amounts and
// outcomes always come from the backend; this file only puts them into
// words. Razorpay's own error text is never shown: a failure arrives as a
// code (from the backend, or mapped here from Checkout's reason) and the
// customer reads one of the messages below.

/* ─── Plans ─── */

/* The catalogue's descriptions are written for admins; these are the ones a
   customer reads. A plan without one here falls back to its description. */
const PLAN_TAGLINES: Record<string, string> = {
  free: "Start learning with an AI tutor. No card required.",
  pro: "Unlock more powerful study tools with Socrate Pro.",
};

export function planTagline(name: string, fallback?: string | null): string {
  return PLAN_TAGLINES[name.trim().toLowerCase()] ?? fallback?.trim() ?? "";
}

/** "month" for a 30-day plan, "year" for 365, otherwise "30 days"-style. */
export function periodLabel(durationDays: number): string {
  if (durationDays >= 28 && durationDays <= 31) return "month";
  if (durationDays >= 365 && durationDays <= 366) return "year";
  if (durationDays === 7) return "week";
  return `${durationDays} days`;
}

/** Paise to "₹480.24" (whole amounts without decimals). */
export function formatAmount(paise: number, currency: string): string {
  const value = paise / 100;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatDate(iso: string | Date | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Failures ─── */

/** The same codes the backend sends (backend src/utils/payment_failure.ts). */
export type PaymentFailureCode =
  | "cancelled"
  | "declined"
  | "insufficient_funds"
  | "limit_exceeded"
  | "upi_timeout"
  | "timed_out"
  | "authentication"
  | "invalid_details"
  | "method_unavailable"
  | "temporary"
  | "unknown";

const FAILURE_MESSAGES: Record<PaymentFailureCode, string> = {
  cancelled: "The payment was cancelled before it was completed.",
  declined: "Your bank declined this payment. Please try another payment method.",
  insufficient_funds: "Your payment could not be completed because of insufficient funds.",
  limit_exceeded:
    "This payment is over your card or account's transaction limit. Please try another payment method.",
  upi_timeout: "The UPI payment timed out. You can try again.",
  timed_out: "The payment timed out before it was completed. You can try again.",
  authentication: "The OTP or PIN couldn't be verified. Please try again.",
  invalid_details: "Some of the payment details didn't match. Please check them and try again.",
  method_unavailable: "That payment method isn't available right now. Please choose another one.",
  temporary:
    "We couldn't complete the payment because of a temporary payment issue. Please try again.",
  unknown: "Something went wrong while processing your payment. Please try again.",
};

export function failureMessage(code: string | null | undefined): string {
  return FAILURE_MESSAGES[(code ?? "unknown") as PaymentFailureCode] ?? FAILURE_MESSAGES.unknown;
}

/** "pending": the bank hasn't answered — never show these as a failure. */
export type ClientFailureOutcome = PaymentFailureCode | "pending" | "already_paid";

/* Razorpay's failure reasons (https://razorpay.com/docs/errors/payments/list),
   grouped the way the backend groups them. */
const REASON_GROUPS: Record<ClientFailureOutcome, string[]> = {
  cancelled: ["payment_cancelled"],
  declined: [
    "card_declined", "debit_declined", "payment_declined", "authorisation_declined_by_psp",
    "payment_risk_check_failed", "debit_instrument_blocked", "debit_instrument_inactive",
    "transaction_on_vpa_restricted", "compliance_violation", "international_transaction_not_allowed",
    "card_expired",
  ],
  insufficient_funds: ["insufficient_funds", "funds_blocked_by_mandate"],
  limit_exceeded: [
    "transaction_limit_exceeded", "transaction_daily_limit_exceeded", "transaction_daily_count_exceeded",
    "transaction_frequency_limit_exceeded", "credit_limit_exceeded",
  ],
  upi_timeout: ["payment_collect_request_expired"],
  timed_out: ["payment_timed_out", "request_timed_out", "payment_session_expired"],
  authentication: [
    "authentication_failed", "incorrect_otp", "otp_expired", "otp_attempts_exceeded", "incorrect_pin",
    "incorrect_atm_pin", "pin_attempts_exceeded", "pin_not_set", "card_not_enrolled",
  ],
  invalid_details: [
    "incorrect_card_details", "incorrect_cvv", "incorrect_card_expiry_date", "incorrect_cardholder_name",
    "card_number_invalid", "card_type_invalid", "invalid_vpa", "invalid_mobile_number",
    "mobile_number_invalid", "user_not_registered_for_netbanking",
  ],
  method_unavailable: [
    "payment_method_not_enabled", "bank_not_enabled", "card_network_not_enabled", "psp_app_not_supported",
    "psp_not_registered", "upi_collect_not_enabled", "upi_intent_not_enabled",
  ],
  temporary: [
    "bank_technical_error", "bank_not_available", "bank_cutoff_in_progress", "issuer_technical_error",
    "gateway_technical_error", "invalid_response_from_gateway", "server_error",
    "payment_declined_due_to_high_traffic", "upi_app_technical_error", "psp_not_available",
    "psp_app_not_available", "vpa_resolution_failed", "duplicate_rrn_found", "capture_failed", "payment_failed",
  ],
  pending: ["payment_pending", "payment_pending_approval", "collect_request_pending", "deemed_transaction"],
  already_paid: ["order_already_paid"],
  unknown: [],
};

const REASONS = new Map<string, ClientFailureOutcome>(
  (Object.entries(REASON_GROUPS) as [ClientFailureOutcome, string[]][]).flatMap(([outcome, reasons]) =>
    reasons.map((reason) => [reason, outcome] as const),
  ),
);

/** Checkout's `payment.failed` error, as one of our codes. */
export function failureFromCheckout(error: { reason?: unknown } | null | undefined): ClientFailureOutcome {
  const reason = typeof error?.reason === "string" ? error.reason.trim().replace(/\s+/g, "") : "";
  return REASONS.get(reason) ?? "unknown";
}
