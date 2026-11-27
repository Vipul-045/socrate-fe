// lib/plans.ts

import type { LaunchOffer, MemberPlan, PlanFeature } from "@/lib/services";

/* ─── Free and Pro, wherever the site describes them ───
   The pricing cards and checkout read the live plans (fetchPlans, below).
   Everything else that states a price or a limit — the FAQ, /features, the
   hero, page descriptions, structured data and llms.txt — reads PLANS, so
   each is written down once.

   PLANS is what production's GET /MShip/plan returns (the backend's
   scripts/seed_dev.ts carries the same values). When a plan changes in the
   database, change it here: /pricing logs every difference it finds between
   the two (planDrift). Limits count per 30-day plan period. */

export type LimitedFeature = "quiz_generation" | "flashcard_generation" | "exam_generation";

type Limits = Record<LimitedFeature, number>;

export const PLAN_CURRENCY = "INR";

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: { quiz_generation: 10, flashcard_generation: 10, exam_generation: 2 },
  },
  pro: {
    name: "Pro",
    /** A month, GST included. */
    price: 399,
    /** First-time subscribers only, once per account. */
    trialDays: 7,
    limits: { quiz_generation: 30, flashcard_generation: 30, exam_generation: 30 },
  },
} as const satisfies Record<string, { name: string; price: number; trialDays?: number; limits: Limits }>;

/** "₹399", "₹4,200". */
export function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** What a reader makes with each generation feature: [one, several], in the
 *  order the site lists them. */
const FEATURE_NOUNS: Record<LimitedFeature, [string, string]> = {
  quiz_generation: ["quiz", "quizzes"],
  flashcard_generation: ["flashcard deck", "flashcard decks"],
  exam_generation: ["practice exam", "practice exams"],
};

function counted(key: LimitedFeature, n: number): string {
  return `${n} ${n === 1 ? FEATURE_NOUNS[key][0] : FEATURE_NOUNS[key][1]}`;
}

/** "10 quizzes, 10 flashcard decks and 2 practice exams" */
export function limitsPhrase(limits: Limits): string {
  const parts = (Object.keys(FEATURE_NOUNS) as LimitedFeature[]).map((key) => counted(key, limits[key]));
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** "10 quizzes a month". A feature this doesn't know keeps its key's words. */
export function featureLabel(feature: Pick<PlanFeature, "featureKey" | "limit">): string {
  if (!(feature.featureKey in FEATURE_NOUNS)) {
    return `${feature.limit} ${feature.featureKey.replace(/_/g, " ")}/month`;
  }
  return `${counted(feature.featureKey as LimitedFeature, feature.limit)} a month`;
}

/** Where the live plans and PLANS disagree, one line each; empty when they
 *  match. A plan PLANS doesn't describe (Max, one day) isn't compared. */
export function planDrift(live: MemberPlan[]): string[] {
  const problems: string[] = [];
  for (const known of Object.values(PLANS)) {
    const plan = live.find((p) => p.name === known.name);
    if (!plan) {
      problems.push(`${known.name}: not in GET /MShip/plan`);
      continue;
    }
    if (plan.price !== known.price) {
      problems.push(`${known.name}: price is ${plan.price}, lib/plans.ts says ${known.price}`);
    }
    for (const [key, limit] of Object.entries(known.limits)) {
      const feature = plan.planFeatures.find((f) => f.featureKey === key && f.enabled);
      if (feature?.limit !== limit) {
        problems.push(`${known.name}: ${key} is ${feature?.limit ?? "off"}, lib/plans.ts says ${limit}`);
      }
    }
  }
  return problems;
}

/* ─── The plans, read on the server ───
   /pricing used to ask the backend for its plans only in the browser, so the
   page's HTML said "Loading plans…" and held no plan, price or limit: all a
   crawler that doesn't run JavaScript (most AI ones) ever saw. The server
   asks now, and the plans are in the HTML.

   The backend is the one source of plan facts (GET /MShip/plan, public): the
   pricing cards and checkout read what it returns. */

const BACKEND = process.env.NEXT_PUBLIC_BACKENDBASEURL;

/** How long a fetched plan list is reused in the page's HTML. A price or
 *  limit changed in the database shows here within the hour; the pricing
 *  cards ask again in the browser anyway, for the launch spots left. */
const REVALIDATE_SECONDS = 3600;

/** The active plans, cheapest first, and the launch offer; null plans when
 *  the backend didn't answer (the page then asks again from the browser,
 *  and can offer a retry). */
export async function fetchPricing(): Promise<{ plans: MemberPlan[] | null; launch: LaunchOffer | null }> {
  if (!BACKEND) return { plans: null, launch: null };
  try {
    const res = await fetch(`${BACKEND}/MShip/plan`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return { plans: null, launch: null };
    const body = (await res.json()) as { data?: { PlanList?: MemberPlan[]; launch?: LaunchOffer | null } };
    const plans = body.data?.PlanList;
    return { plans: Array.isArray(plans) && plans.length > 0 ? plans : null, launch: body.data?.launch ?? null };
  } catch {
    return { plans: null, launch: null };
  }
}

/** The active plans alone (structured data, llms.txt). */
export async function fetchPlans(): Promise<MemberPlan[] | null> {
  return (await fetchPricing()).plans;
}
