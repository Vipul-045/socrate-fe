// app/api/payments/checkouts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { resolveCountryCode } from "@/lib/geo";
import { resolveProductId } from "@/lib/pricing";

const DODO_API_BASE_URL =
  process.env.DODO_PAYMENTS_ENVIRONMENT === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";

export async function POST(req: NextRequest) {
  let body: { planId?: string; billingCycle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { planId, billingCycle } = body;
  if (!planId || !billingCycle) {
    return NextResponse.json(
      { error: "planId and billingCycle are required" },
      { status: 400 }
    );
  }

  // Server decides the region — never trust anything the client sends for this.
  const countryCode = await resolveCountryCode(req.headers);
  const productId = resolveProductId(planId, billingCycle, countryCode);

  if (!productId) {
    return NextResponse.json(
      { error: "Invalid plan, billing cycle, or pricing not configured for this region" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error("NEXT_PUBLIC_APP_URL is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!process.env.DODO_PAYMENTS_API_KEY) {
    console.error("DODO_PAYMENTS_API_KEY is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const response = await fetch(`${DODO_API_BASE_URL}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        return_url: appUrl,
        cancel_url: `${appUrl}/pricing`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log full detail server-side only; never forward raw provider errors to the client.
      console.error("Dodo checkout creation failed:", response.status, data);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: response.status }
      );
    }

    return NextResponse.json({ checkoutUrl: data.checkout_url });
  } catch (error) {
    console.error("Dodo checkout request error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 502 }
    );
  }
}