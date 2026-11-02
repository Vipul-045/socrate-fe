import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

/* Every link into the app is SOCRATE_APP_URL (lib/navigation.ts), fixed
   into the bundle when it's built: http://localhost:4100 in
   .env.development.local, https://app.socrate.in in production. Without it,
   or with a production build pointing at this machine, readers would be sent
   somewhere that isn't the app — so neither starts.

   It has no NEXT_PUBLIC_ prefix, so Next wouldn't put it into browser code
   by itself: the buttons that call window.location.assign(APP_URL) would go
   to /undefined. `env` below puts it there, server and browser alike. */
function checkAppUrl(phase: string) {
  if (phase !== PHASE_DEVELOPMENT_SERVER && phase !== PHASE_PRODUCTION_BUILD) return;

  const raw = process.env.SOCRATE_APP_URL;
  let url: URL | null = null;
  try {
    url = new URL(raw ?? '');
  } catch {}
  if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:')) {
    throw new Error(
      `SOCRATE_APP_URL must be the Socrate app's full URL, e.g. https://app.socrate.in (see .env.example); it is ${JSON.stringify(raw ?? null)}.`,
    );
  }
  if (phase === PHASE_PRODUCTION_BUILD && LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(
      `SOCRATE_APP_URL is ${raw} in a production build. Set it to https://app.socrate.in where this is built (on Vercel: Settings → Environment Variables), then build again.`,
    );
  }
}

export default function config(phase: string): NextConfig {
  checkAppUrl(phase);
  return { ...nextConfig, env: { SOCRATE_APP_URL: process.env.SOCRATE_APP_URL } };
}
