"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthHeading, AuthNotice, AuthShell, authButtonClass, inkLink } from "@/components/site/auth-shell";
import { useUser } from "@/components/provider/authoprovider";
import { authErrorMessage, resendVerificationEmail, verifyEmail } from "@/lib/auth-api";

/* Where the emailed verification link lands. The token is in the fragment
   (#token=…): read here, sent once, and taken out of the address bar. */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.socrate.in";

type State =
  | { step: "verifying" }
  | { step: "verified" }
  | { step: "failed"; message: string };

export default function VerifyEmailPage() {
  const { userInfo } = useUser();
  const [state, setState] = useState<State>({ step: "verifying" });
  const [resend, setResend] = useState<"idle" | "sending" | string>("idle");
  // Effects run twice in development; the link is redeemed once.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      setState({ step: "failed", message: "This link is incomplete. Open it from your email again." });
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    verifyEmail(token)
      .then(() => setState({ step: "verified" }))
      .catch((err) => setState({ step: "failed", message: authErrorMessage(err) }));
  }, []);

  async function sendAgain() {
    setResend("sending");
    try {
      setResend((await resendVerificationEmail()).message);
    } catch (err) {
      setResend(authErrorMessage(err));
    }
  }

  return (
    <AuthShell>
      {state.step === "verifying" && <AuthHeading title="Verifying your email…" />}

      {state.step === "verified" && (
        <>
          <AuthHeading title="Email verified">Thanks — your Socrate account is all set.</AuthHeading>
          <Button asChild size="lg" className={authButtonClass}>
            <a href={APP_URL}>Continue to Socrate</a>
          </Button>
        </>
      )}

      {state.step === "failed" && (
        <>
          <AuthHeading title="We couldn't verify your email" />
          <AuthNotice tone="error">{state.message}</AuthNotice>
          {userInfo ? (
            resend === "idle" ? (
              <Button type="button" size="lg" className={authButtonClass} onClick={sendAgain}>
                Send a new link
              </Button>
            ) : (
              <p role="status" className="text-[15px] leading-[1.6] text-ink-soft">
                {resend === "sending" ? "Sending…" : resend}
              </p>
            )
          ) : (
            <p className="text-[15px] leading-[1.6] text-ink-soft">
              <Link href="/login?next=%2Fverify-email" className={inkLink}>
                Sign in
              </Link>{" "}
              to get a new verification link.
            </p>
          )}
        </>
      )}
    </AuthShell>
  );
}
