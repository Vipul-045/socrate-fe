import Link from "next/link";

import { MonoLabel } from "@/components/site/primitives";

/* The frame and parts of every sign-in page: /login, /reset-password and
   /verify-email. */

/** "Create an account", "Sign in": the link that is the next step. */
export const inkLink =
  "font-medium text-ink underline decoration-[#c9c3b6] underline-offset-[3px] transition-colors hover:decoration-ink";

/** Terms and Privacy in the small print. */
export const footerLink =
  "whitespace-nowrap text-ink-soft underline decoration-[#d4cfc4] underline-offset-[3px] transition-colors hover:text-ink";

/** "Forgot password?" — there when needed, quiet otherwise. */
export const quietLink = "text-ink-soft transition-colors hover:text-ink";

/* 48px controls with a firmer edge than the site's other forms, and a focus
   ring as well as the border so the field being typed in is unmistakable.
   Passed to TextInput / PasswordInput, whose own classes these override. */
export const authControlClass =
  "h-12 py-0 border-[#d4cfc4] bg-[#fdfcfa] placeholder:text-ink-faint transition-[border-color,box-shadow] hover:border-[#bcb6a9] focus:border-[#a39d91] focus:ring-[3px] focus:ring-ink/[0.07]";

/** The primary button of every auth form. */
export const authButtonClass = "h-12 w-full rounded-lg text-[15px] tracking-[-0.008em]";

export function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="flex-none" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#d4cfc4] bg-[#fdfcfa] text-[15px] font-medium tracking-[-0.008em] text-ink transition-colors hover:border-[#bcb6a9] hover:bg-white disabled:opacity-60"
    >
      <GoogleMark />
      Continue with Google
    </button>
  );
}

/** The rule between Google and the email form. */
export function OrDivider() {
  return (
    <div className="my-[1.375rem] flex items-center gap-4 text-[13px] text-ink-muted" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      or with email
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** A label (with an optional link beside it), its control, and a hint or error under it. */
export function AuthField({
  label,
  htmlFor,
  aside,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  aside?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="text-[15px] font-medium leading-[1.4] tracking-[-0.01em] text-[#3f3b34]">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint && <p className="text-[13.5px] leading-[1.5] text-ink-muted">{hint}</p>}
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-paper text-ink lg:grid-cols-2">
      {/* Brand panel. Below lg it follows the form: on a phone the reason
          you came here — signing in — should be on the first screen. */}
      <section className="order-last flex min-w-0 flex-col gap-12 border-t border-line bg-surface pl-[max(clamp(1.5rem,4.5vw,4rem),env(safe-area-inset-left))] pr-[max(clamp(1.5rem,4.5vw,4rem),env(safe-area-inset-right))] pb-[max(clamp(2.5rem,5vw,3.5rem),env(safe-area-inset-bottom))] pt-[clamp(2.5rem,4vw,2.75rem)] lg:order-none lg:pb-8 lg:border-r lg:border-t-0">
        <Link
          href="/"
          className="-my-2.5 hidden self-start py-2.5 text-[1.25rem] font-semibold tracking-[-0.02em] lg:block"
        >
          Socrate
        </Link>

        <div className="lg:my-auto">
          <MonoLabel className="mb-[clamp(1.125rem,2vw,1.4375rem)] text-[clamp(11px,0.85vw,13px)] tracking-[0.16em] text-ink-soft">
            Learning made easy
          </MonoLabel>
          <p className="max-w-[31rem] text-[clamp(1.75rem,3.5vw,2.6875rem)] font-medium leading-[1.15] tracking-[-0.032em] text-balance">
            Drop your notes. Walk out knowing everything.
          </p>
          <p className="mt-[clamp(1rem,1.6vw,1.1875rem)] max-w-[29rem] text-[clamp(1rem,1.3vw,1.125rem)] leading-[1.65] text-pretty text-ink-soft">
            Upload any document and have an AI tutor explain, summarize, and
            quiz you instantly.
          </p>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex min-w-0 flex-col pl-[max(clamp(1.5rem,4.5vw,4rem),env(safe-area-inset-left))] pr-[max(clamp(1.5rem,4.5vw,4rem),env(safe-area-inset-right))] pb-[clamp(3rem,7vw,5rem)] pt-[max(1rem,env(safe-area-inset-top))] lg:justify-center lg:pt-[clamp(3.5rem,7vw,5rem)]">
        <Link
          href="/"
          className="inline-flex h-12 items-center self-start text-[1.125rem] font-semibold tracking-[-0.02em] lg:hidden"
        >
          Socrate
        </Link>
        <div className="mx-auto mt-[clamp(2rem,9vw,4rem)] w-full max-w-[27rem] lg:mt-0">{children}</div>
      </section>
    </div>
  );
}

export function AuthHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <>
      <h1 className="text-[clamp(1.75rem,3vw,2.125rem)] font-medium leading-[1.1] tracking-[-0.032em] text-balance">
        {title}
      </h1>
      {children ? (
        <p className="mb-[clamp(1.375rem,2.8vw,1.6875rem)] mt-3 text-[clamp(1rem,1.2vw,1.0625rem)] leading-[1.6] text-pretty text-ink-soft">
          {children}
        </p>
      ) : (
        <div className="mb-[clamp(1.5rem,3vw,1.875rem)]" />
      )}
    </>
  );
}

/** An error (role=alert) or a confirmation (role=status) above or in place of a form. */
export function AuthNotice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "mb-5 rounded-lg border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-[14px] leading-[1.6] text-destructive"
          : "mb-5 rounded-lg border border-[#d4cfc4] bg-[#fdfcfa] px-4 py-3 text-[14px] leading-[1.6] text-ink"
      }
    >
      {children}
    </p>
  );
}

/** "New to Socrate? Create an account" — directly under the form's button. */
export function AuthSwitch({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-[15px] leading-[1.6] text-ink-soft">{children}</p>;
}

/** The small print under a rule: what's free, and what continuing agrees to. */
export function AuthFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-7 flex flex-col gap-1 border-t border-line pt-5 text-[14px] leading-[1.7] text-ink-muted">
      {children}
    </div>
  );
}
