import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

/**
 * Contact form intake, delivered by email through Resend.
 *
 * Requires RESEND_API_KEY (a sending-only key for socrate.in). The sender
 * must be on a domain verified in Resend; override it with
 * CONTACT_FROM_EMAIL. Without an API key, development logs the submission
 * so the form still works; production refuses rather than dropping messages.
 */
const CONTACT_TO_EMAIL = "hello@socrate.in";
const DEFAULT_FROM_EMAIL = "Socrate Contact <contact@socrate.in>";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
});

const DELIVERY_ERROR = "We couldn't deliver that. Email hello@socrate.in instead.";

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] RESEND_API_KEY not set, submission:", parsed.data);
      return NextResponse.json({ ok: true });
    }
    console.error("[contact] RESEND_API_KEY is not set");
    return NextResponse.json({ error: DELIVERY_ERROR }, { status: 502 });
  }

  const { name, email, topic, message } = parsed.data;
  // Collapse whitespace so user input can't break the subject line.
  const subject = `[Contact] ${topic || "General"} — ${name}`.replace(/\s+/g, " ");

  const { data, error } = await new Resend(apiKey).emails.send(
    {
      from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      replyTo: email,
      subject,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Topic: ${topic || "—"}`,
        "",
        message,
      ].join("\n"),
    },
    { signal: AbortSignal.timeout(8000) },
  );

  if (error) {
    console.error("[contact] delivery failed", error);
    return NextResponse.json({ error: DELIVERY_ERROR }, { status: 502 });
  }

  console.info("[contact] sent", data?.id);
  return NextResponse.json({ ok: true });
}
