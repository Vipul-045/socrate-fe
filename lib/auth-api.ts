// lib/auth-api.ts
//
// Sign-in for socrate.in. There is one auth backend for socrate.in and
// app.socrate.in: every call here goes to it, and the session cookie it sets
// (on .socrate.in) signs the reader in on both sites at once. Nothing about
// accounts or sessions is decided in this app.

import { api, ApiError } from "./Api";

const BASE_URL: string = process.env.NEXT_PUBLIC_BACKENDBASEURL || "http://localhost:3000";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function signInWithPassword(email: string, password: string) {
  return api.post<{ emailVerified: boolean }>("/auth/login", { email, password });
}

export function registerWithPassword(input: SignUpInput) {
  return api.post<{ emailVerified: boolean; verificationEmailSent: boolean }>("/auth/register", input);
}

/** Answers the same whether or not the account exists. */
export function requestPasswordReset(email: string) {
  return api.post<{ message: string }>("/auth/password/forgot", { email });
}

export function resetPassword(token: string, password: string, confirmPassword: string) {
  return api.post<{ message: string }>("/auth/password/reset", { token, password, confirmPassword });
}

export function verifyEmail(token: string) {
  return api.post<{ message: string; alreadyVerified?: boolean }>("/auth/email/verify", { token });
}

export function resendVerificationEmail() {
  return api.post<{ message: string; alreadyVerified?: boolean }>("/auth/email/resend");
}

/**
 * Google sign-in, coming back to `returnTo` — a full URL on this site; the
 * backend only returns to Socrate's own origins.
 */
export function googleSignInUrl(returnTo: string) {
  return `${BASE_URL}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
}

/** The server's own message (written for the reader), or a generic one. */
export function authErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Couldn't reach Socrate. Check your connection and try again.";
}

/** The server's error code, e.g. EMAIL_USES_GOOGLE. */
export function authErrorCode(err: unknown): string | undefined {
  return err instanceof ApiError ? (err.body as { code?: string } | null)?.code : undefined;
}

/* The same rules the backend applies (it has the last word); checked here
   only so an obvious mistake is caught before a round trip. */
export const PASSWORD_RULE = "At least 8 characters, with a letter and a number.";

export function passwordHint(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/\p{L}/u.test(password) || !/\p{N}/u.test(password)) return "Use at least one letter and one number.";
  return null;
}
