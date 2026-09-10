"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Select, TextArea, TextInput } from "@/components/site/field";
import { CONTACT_TOPICS } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(
          data.error ??
            "That didn't send. Email support@socrate.ai and we'll pick it up there.",
        );
        return;
      }

      form.reset();
      setStatus("sent");
      setMessage("Message sent. We'll reply within 48 hours.");
    } catch {
      setStatus("error");
      setMessage(
        "That didn't send. Email support@socrate.ai and we'll pick it up there.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <TextInput
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Ada Lovelace"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@university.edu"
          />
        </Field>
      </div>

      <Field label="Topic" htmlFor="topic">
        <Select id="topic" name="topic" defaultValue={CONTACT_TOPICS[0]}>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Message" htmlFor="message">
        <TextArea
          id="message"
          name="message"
          required
          minLength={10}
          placeholder="Tell us what's on your mind."
        />
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
        <p
          role="status"
          aria-live="polite"
          className={
            status === "error"
              ? "text-small text-destructive"
              : "text-small text-ink-faint"
          }
        >
          {message ?? "We never share your email."}
        </p>
      </div>
    </form>
  );
}
