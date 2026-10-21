"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/site/field";
import {
  AuthField,
  AuthHeading,
  AuthNotice,
  AuthShell,
  authButtonClass,
  authControlClass,
  inkLink,
} from "@/components/site/auth-shell";
import { useUser } from "@/components/provider/authoprovider";
import { PASSWORD_RULE, authErrorMessage, passwordHint, resetPassword } from "@/lib/auth-api";

/* Where the emailed reset link lands — for socrate.in and app.socrate.in
   alike, since the account is the same. Also how a Google-only account adds
   a password. The token is in the fragment (#token=…): read here, then taken
   out of the address bar. Setting a password signs the account out
   everywhere, so the reader signs in again with it. */

export default function ResetPasswordPage() {
  const { refresh } = useUser();
  // undefined until the fragment has been read (it isn't available on the server).
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const found = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (found) {
      setToken(found);
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      // The fragment is gone once read: an effect run again (Strict Mode, a remount) keeps the token it found.
      setToken((current) => current ?? null);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !token) return;
    setError(null);
    const hint = passwordHint(password);
    if (hint) return setError(hint);
    if (password !== confirmPassword) return setError("The passwords don't match.");

    setSubmitting(true);
    try {
      setDone((await resetPassword(token, password, confirmPassword)).message);
      // Every earlier session has just ended, this browser's included.
      await refresh();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthShell>
        <AuthHeading title="Password updated" />
        <AuthNotice tone="success">{done}</AuthNotice>
        <Button asChild size="lg" className={authButtonClass}>
          <Link href="/login">Sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  if (token === null) {
    return (
      <AuthShell>
        <AuthHeading title="This link is incomplete">
          Open the link from your email again, or ask for a new one.
        </AuthHeading>
        <Button asChild size="lg" className={authButtonClass}>
          <Link href="/login?mode=forgot">Request a new link</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthHeading title="Choose a new password">
        You&apos;ll be signed out everywhere, then sign in with the new password.
      </AuthHeading>

      {error && (
        <AuthNotice tone="error">
          {error}{" "}
          {/expired|invalid/i.test(error) && (
            <Link href="/login?mode=forgot" className={inkLink}>
              Request a new link
            </Link>
          )}
        </AuthNotice>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label="New password" htmlFor="password" hint={PASSWORD_RULE}>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting || token === undefined}
            className={authControlClass}
          />
        </AuthField>
        <AuthField label="Confirm new password" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting || token === undefined}
            className={authControlClass}
          />
        </AuthField>
        <Button
          type="submit"
          size="lg"
          className={`mt-2 ${authButtonClass}`}
          disabled={submitting || token === undefined}
        >
          {submitting ? "Saving…" : "Set new password"}
        </Button>
      </form>
    </AuthShell>
  );
}
