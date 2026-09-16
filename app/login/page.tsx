"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MonoLabel } from "@/components/site/primitives";
import { ValueProps } from "@/components/site/value-props";
import { FREE_TIER_NOTE } from "@/lib/content";

const GOOGLE_AUTH_URL = "https://socrate-backend-9eza.onrender.com/auth/google";

function GoogleMark() {
  return (
    <div className="min-h-screen bg-foreground/[0.03] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-bold text-foreground">Socrate</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to continue learning"
              : "Start your AI-powered study journey"}
          </p>
        </div>

        <div className="bg-background rounded-xl border border-border p-8 shadow-sm">
          <Button
            variant="outline"
            className="w-full h-11 mb-3 text-sm font-medium"
            onClick={() => {
              window.open(
                `${process.env.NEXT_PUBLIC_BACKENDBASEURL}/auth/google`,
                "_self",
              );
            }}
            // onClick={async () => {
            //   await authClient.signIn.social({
            //     provider: "google",
            //     callbackURL: "/pricing",
            //   });
            // }}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
            Continue with Google
          </Button>

          <p className="mt-6 text-small text-ink-faint">{FREE_TIER_NOTE}</p>

          <div className="mt-9 border-t border-line pt-7">
            <p className="text-small text-ink-soft">
              By continuing you agree to our{" "}
              <Link
                href="/terms"
                className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className="mt-5 text-small font-medium text-ink">
              New to Socrate?{" "}
              {/* Sign-up is the same Google flow — an account is created on
                  first sign-in. */}
              <button
                type="button"
                onClick={() => window.open(GOOGLE_AUTH_URL, "_self")}
                className="cursor-pointer py-2 font-medium underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
