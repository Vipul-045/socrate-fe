import { NextRequest, NextResponse } from "next/server";

const PRODUCT_IDS: Record<string, Record<string, string>> = {
  basic:    { monthly: "pdt_0Nex3pHDViLFSzbK5uFMj", yearly: "prod_xxx" },
  medium:   { monthly: "pdt_0Nex3pHDViLFSzbK5uFMj", yearly: "prod_xxx1" },
  pro:      { monthly: "pdt_0Nex3pHDViLFSzbK5uFMj", yearly: "prod_xxx" },
};

export async function POST(req: NextRequest) {
  const { planId, billingCycle } = await req.json();
  console.log("planId:", planId, "billingCycle:", billingCycle);

    console.log("API KEY:", process.env.DODO_PAYMENTS_API_KEY);
  console.log("ENV:", process.env.DODO_PAYMENTS_ENVIRONMENT);
  const productId = PRODUCT_IDS[planId]?.[billingCycle];
  if (!productId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // ✅ Correct base URL for test mode
  const baseUrl = process.env.DODO_MODE === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";

  const response = await fetch(`${baseUrl}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // ✅ Correct request body — product_cart array
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      cancel_url: `${process.env.NEXT_APP_URL}/pricing`,
    }),
  });

  const data = await response.json();
  console.log("Dodo status:", response.status);
  console.log("Dodo response:", data);

  if (!response.ok) {
    return NextResponse.json({ error: data }, { status: response.status });
  }

  return NextResponse.json({ checkoutUrl: data.checkout_url });
}