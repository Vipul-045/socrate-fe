import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Contact form intake.
 *
 * Set CONTACT_WEBHOOK_URL to forward submissions somewhere real (Slack,
 * Zapier, a mail relay). Without it the message is logged server-side so
 * the form still behaves correctly in development.
 */
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the fields and try again." },
      { status: 422 },
    );
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    console.info("[contact] submission", parsed.data);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return NextResponse.json(
      { error: "We couldn't deliver that. Email support@socrate.ai instead." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
