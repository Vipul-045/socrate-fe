"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PasswordInput, TextInput } from "@/components/site/field";
import {
  AuthField,
  AuthFooter,
  AuthHeading,
  AuthNotice,
  AuthShell,
  AuthSwitch,
  GoogleButton,
  OrDivider,
  authButtonClass,
  authControlClass,
  footerLink,
  inkLink,
  quietLink,
} from "@/components/site/auth-shell";
import { useUser } from "@/components/provider/authoprovider";
import { FREE_TIER_NOTE } from "@/lib/content";
import {
  PASSWORD_RULE,
  authErrorMessage,
  googleSignInUrl,
  passwordHint,
  registerWithPassword,
  requestPasswordReset,
  resendVerificationEmail,
  signInWithPassword,
} from "@/lib/auth-api";

/* Signing in here signs you in on app.socrate.in too: one account and one
   session, kept by the backend for both sites. Without a `next` page, a
   signed-in reader goes on to the app, as Google sign-in always has. */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.socrate.in";

type Mode = "signin" | "signup" | "forgot";

const COPY: Record<Mode, { title: string; body: string }> = {
  signin: { title: "Welcome back", body: "Sign in to continue learning where you left off." },
  signup: { title: "Create your account", body: "Start your study journey with Socrate in seconds." },
  forgot: {
    title: "Reset your password",
    body: "Enter your account's email and we'll send you a link to choose a new password.",
  },
};

/** A page on this site to go on to, or null — never another site. */
function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { userInfo, isLoading, refresh } = useUser();

  const initialMode = searchParams.get("mode");
  const [mode, setMode] = useState<Mode>(
    initialMode === "signup" || initialMode === "forgot" ? initialMode : "signin",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth_failed"
      ? "Google couldn't sign you in. Please try again, or use your email and password."
      : null,
  );
  const [resetSent, setResetSent] = useState<string | null>(null);
  /* After registering, the reader is told about the verification email
     before going on — so this page doesn't move on by itself then. */
  const [signedUp, setSignedUp] = useState<{ email: string; emailSent: boolean } | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | string>("idle");

  const leaving = useRef(false);
  const goOn = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    if (next) router.replace(next);
    else window.location.assign(APP_URL);
  }, [next, router]);

  /* Already signed in — here, on app.socrate.in, or by Google bringing the
     reader back to this page — so there is nothing to do here. */
  useEffect(() => {
    if (!isLoading && userInfo && !signedUp && !submitting) goOn();
  }, [isLoading, userInfo, signedUp, submitting, goOn]);

  const switchTo = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
    setResetSent(null);
    setPassword("");
    setConfirmPassword("");
  };

  const startGoogle = () => {
    // Google brings the reader back here; the effect above takes them on.
    const back = `${window.location.origin}/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    window.location.assign(googleSignInUrl(back));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (mode === "signup") {
      const hint = passwordHint(password);
      if (hint) return setError(hint);
      if (password !== confirmPassword) return setError("The passwords don't match.");
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithPassword(email.trim(), password);
        // A `next` page here is reached without a reload: it must see the session.
        await refresh();
        goOn();
        return;
      }
      if (mode === "signup") {
        const res = await registerWithPassword({ name: name.trim(), email: email.trim(), password, confirmPassword });
        setSignedUp({ email: email.trim(), emailSent: res.verificationEmailSent });
        await refresh();
        return;
      }
      setResetSent((await requestPasswordReset(email.trim())).message);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setResendState("sending");
    try {
      setResendState((await resendVerificationEmail()).message);
    } catch (err) {
      setResendState(authErrorMessage(err));
    }
  }

  if (signedUp) {
    return (
      <>
        <AuthHeading title="You're in">Your account is ready on socrate.in and in the Socrate app.</AuthHeading>
        <AuthNotice tone="success">
          {signedUp.emailSent
            ? `We've sent a link to ${signedUp.email} to verify your email. You can start studying now and verify when you're ready.`
            : "We couldn't send the verification email just now. You can start studying now and ask for another below."}
        </AuthNotice>
        <Button type="button" size="lg" className={authButtonClass} onClick={goOn}>
          Continue
        </Button>
        <AuthSwitch>
          {resendState === "idle" ? (
            <>
              Didn&apos;t get it?{" "}
              <button type="button" onClick={resend} className={inkLink}>
                Send it again
              </button>
            </>
          ) : resendState === "sending" ? (
            "Sending…"
          ) : (
            resendState
          )}
        </AuthSwitch>
      </>
    );
  }

  /* Signed in already: the effect is taking them on. */
  if (userInfo && !isLoading) {
    return <AuthHeading title="Signing you in…" />;
  }

  return (
    <>
      <AuthHeading title={COPY[mode].title}>{COPY[mode].body}</AuthHeading>

      {error && <AuthNotice tone="error">{error}</AuthNotice>}

      {mode !== "forgot" && (
        <>
          <GoogleButton onClick={startGoogle} disabled={submitting} />
          <OrDivider />
        </>
      )}

      {resetSent ? (
        <AuthNotice tone="success">{resetSent} The link works for an hour.</AuthNotice>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <AuthField label="Name" htmlFor="name">
              <TextInput
                id="name"
                name="name"
                required
                maxLength={80}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className={authControlClass}
              />
            </AuthField>
          )}

          <AuthField label="Email" htmlFor="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className={authControlClass}
            />
          </AuthField>

          {mode !== "forgot" && (
            <AuthField
              label="Password"
              htmlFor="password"
              hint={mode === "signup" ? PASSWORD_RULE : undefined}
              aside={
                mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchTo("forgot")}
                    className={`-my-2 py-2 text-[14px] ${quietLink}`}
                  >
                    Forgot password?
                  </button>
                )
              }
            >
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className={authControlClass}
              />
            </AuthField>
          )}

          {mode === "signup" && (
            <AuthField label="Confirm password" htmlFor="confirmPassword">
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className={authControlClass}
              />
            </AuthField>
          )}

          <Button type="submit" size="lg" className={`mt-2 ${authButtonClass}`} disabled={submitting}>
            {submitting
              ? mode === "signin"
                ? "Signing in…"
                : mode === "signup"
                  ? "Creating account…"
                  : "Sending…"
              : mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
          </Button>
        </form>
      )}

      <AuthSwitch>
        {mode === "signin" ? "New to Socrate? " : mode === "signup" ? "Already have an account? " : "Remembered it? "}
        <button
          type="button"
          onClick={() => switchTo(mode === "signin" ? "signup" : "signin")}
          className={`-my-2 py-2 ${inkLink}`}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </AuthSwitch>

      {mode !== "forgot" && (
        <AuthFooter>
          <p>
            {/* Each phrase kept whole, so a narrow screen never strands "required". */}
            {FREE_TIER_NOTE.split(" · ").map((phrase, i) => (
              <span key={phrase}>
                {i > 0 && " · "}
                <span className="whitespace-nowrap">{phrase}</span>
              </span>
            ))}
          </p>
          <p>
            By continuing you agree to our{" "}
            <Link href="/terms" className={footerLink}>
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className={footerLink}>
              Privacy Policy
            </Link>
            .
          </p>
        </AuthFooter>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
