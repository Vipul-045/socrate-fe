"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Loader2, Lock, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

/* The pieces of /checkout: a quiet frame without the site's navigation (one
   thing to do here), and the panel every outcome — paid, failed, cancelled,
   still confirming — is told in. Each panel reads the same way: status,
   what happened, why, and what to do next. */

export function CheckoutFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="gutter-x mx-auto flex h-16 w-full max-w-[66rem] items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex h-11 items-center text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink"
            aria-label="Socrate — home"
          >
            Socrate
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Secure checkout
          </span>
        </div>
      </header>
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}

/** The column every checkout view sits in. */
export function CheckoutColumn({ wide, children }: { wide?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "gutter-x mx-auto w-full pb-[max(clamp(3rem,8vw,5rem),env(safe-area-inset-bottom))] pt-[clamp(1.25rem,4vw,2.5rem)]",
        wide ? "max-w-[66rem]" : "max-w-[34rem]",
      )}
    >
      {children}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-small text-ink-soft transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}

type Tone = "success" | "error" | "neutral" | "waiting" | "progress";

const MARK_ICONS = { success: Check, error: X, neutral: RotateCcw, waiting: Clock, progress: Loader2 } as const;

function StatusMark({ tone }: { tone: Tone }) {
  const Icon = MARK_ICONS[tone];
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border",
        tone === "success" && "border-ink bg-ink text-[#faf9f6]",
        tone === "error" && "border-destructive/25 bg-destructive/[0.06] text-destructive",
        (tone === "neutral" || tone === "waiting" || tone === "progress") && "border-line-control bg-card text-ink-soft",
      )}
    >
      <Icon className={cn("h-5 w-5", tone === "progress" && "animate-spin")} strokeWidth={tone === "success" ? 2.25 : 2} />
    </span>
  );
}

/**
 * One outcome, told calmly. The heading takes focus when the panel changes,
 * so a screen reader announces where the payment now stands.
 */
export function StatusPanel({
  tone,
  label,
  title,
  children,
  actions,
  footnote,
}: {
  tone: Tone;
  label: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  footnote?: React.ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [title]);

  return (
    <section
      className="pt-[clamp(1.5rem,7vw,4.5rem)]"
      aria-live={tone === "progress" ? "polite" : undefined}
      aria-busy={tone === "progress" || undefined}
    >
      <StatusMark tone={tone} />
      <MonoLabel className="mt-7 text-ink-soft">{label}</MonoLabel>
      <h1
        ref={heading}
        tabIndex={-1}
        className="mt-3 text-[clamp(1.75rem,5vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.032em] text-ink outline-none text-balance"
      >
        {title}
      </h1>
      {children ? (
        <div className="mt-4 flex flex-col gap-3 text-[clamp(1rem,1.2vw,1.0625rem)] leading-[1.65] text-ink-soft text-pretty">
          {children}
        </div>
      ) : null}
      {actions ? <div className="mt-9 flex flex-col gap-2.5 sm:flex-row">{actions}</div> : null}
      {footnote ? (
        <div className="mt-9 border-t border-line pt-5 text-[14px] leading-[1.65] text-ink-muted text-pretty">
          {footnote}
        </div>
      ) : null}
    </section>
  );
}

const actionClass = "h-12 w-full rounded-lg px-6 text-[15px] tracking-[-0.008em] sm:w-auto sm:min-w-[11.5rem]";

/** A panel's next step: a button, or a link when it goes to another page. */
export function PanelAction({
  primary,
  href,
  onClick,
  busy,
  busyLabel,
  children,
}: {
  primary?: boolean;
  href?: string;
  onClick?: () => void;
  busy?: boolean;
  busyLabel?: string;
  children: React.ReactNode;
}) {
  const variant = primary ? "default" : "outline";
  if (href) {
    return (
      <Button variant={variant} className={actionClass} asChild>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }
  return (
    <Button variant={variant} className={actionClass} onClick={onClick} disabled={busy} aria-busy={busy || undefined}>
      {busy ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          {busyLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export const supportEmail = "socratedotin@gmail.com";

export function SupportLine({ children }: { children: React.ReactNode }) {
  return (
    <p>
      {children}{" "}
      <a
        href={`mailto:${supportEmail}`}
        className="whitespace-nowrap font-medium text-ink underline decoration-[#c9c3b6] underline-offset-[3px] transition-colors hover:decoration-ink"
      >
        {supportEmail}
      </a>
    </p>
  );
}
