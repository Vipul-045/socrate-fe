import { NextResponse } from "next/server";

export async function POST() {
  const response = await fetch(
    "https://test.dodopayments.com/v1/checkout/sessions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify({
        product_id: "pdt_0NdTH3JybBatyTgvSTGhi",
        quantity: 1,
        return_url: process.env.DODO_PAYMENTS_RETURN_URL,
      }),
    }
  );

  const data = await response.json();

  return NextResponse.json(data);
}