/* Plan prices and limits are stated once, in lib/plans.ts, and every page
   derives its wording from there. These pin the wording, the drift check
   /pricing runs against the live plans, and that no page writes a limit by
   hand again (it once promised "3 PDFs a month" and "unlimited uploads",
   neither of which the backend enforces or offers). */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { PLANS, featureLabel, limitsPhrase, planDrift, rupees } from "../lib/plans.ts";
import type { MemberPlan } from "../lib/services";

function livePlan(name: string, price: number, limits: Record<string, number>): MemberPlan {
  return {
    _id: name,
    name,
    description: "",
    price,
    currency: "INR",
    durationDays: 30,
    tokenLimit: 0,
    dailyTokenLimit: 0,
    providerPlans: [],
    isActive: true,
    createdAt: "",
    updatedAt: "",
    planFeatures: Object.entries(limits).map(([featureKey, limit]) => ({
      featureId: featureKey,
      featureKey,
      enabled: true,
      limit,
    })),
  };
}

const LIVE = [
  livePlan("Free", 0, { exam_generation: 2, quiz_generation: 10, flashcard_generation: 10 }),
  livePlan("Pro", 399, { exam_generation: 30, quiz_generation: 30, flashcard_generation: 30 }),
];

test("limits read as one sentence", () => {
  assert.equal(limitsPhrase(PLANS.free.limits), "10 quizzes, 10 flashcard decks and 2 practice exams");
  assert.equal(
    limitsPhrase({ quiz_generation: 1, flashcard_generation: 1, exam_generation: 1 }),
    "1 quiz, 1 flashcard deck and 1 practice exam",
  );
  assert.equal(rupees(4200), "₹4,200");
});

test("each pricing-card line names what it counts", () => {
  assert.equal(featureLabel({ featureKey: "exam_generation", limit: 2 }), "2 practice exams a month");
  assert.equal(featureLabel({ featureKey: "pdf_pages", limit: 5 }), "5 pdf pages/month");
});

test("the live plans match lib/plans.ts", () => {
  assert.deepEqual(planDrift(LIVE), []);
  // Plans it doesn't describe are left alone.
  assert.deepEqual(planDrift([...LIVE, livePlan("Max", 999, {})]), []);
});

test("a changed price, limit or missing plan is reported", () => {
  const [free, pro] = LIVE;
  const drift = planDrift([
    { ...free, planFeatures: free.planFeatures.map((f) => (f.featureKey === "exam_generation" ? { ...f, enabled: false } : f)) },
    { ...pro, price: 499 },
  ]);
  assert.deepEqual(drift, [
    "Free: exam_generation is off, lib/plans.ts says 2",
    "Pro: price is 499, lib/plans.ts says 399",
  ]);
  assert.deepEqual(planDrift([free]), ["Pro: not in GET /MShip/plan"]);
});

const ROOT = path.join(import.meta.dirname, "..");

/** What the site renders: pages, site components, copy and SEO helpers.
 *  components/landing/*.tsx outside pricing/ is an older homepage nothing
 *  imports. */
const RENDERED = ["app", "lib", "components/site", "components/landing/pricing"];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) return sources(file);
    return /\.(ts|tsx)$/.test(name) ? [file] : [];
  });
}

test("no page states a plan limit by hand", () => {
  const handWritten = [
    /\b\d+\s+(free\s+)?PDFs?\s*(a|every|per|\/)\s*month/i,
    /unlimited (uploads|PDFs)/i,
    /\b(Pro|Max) (and|&) Max\b/,
  ];
  const offenders = RENDERED.flatMap((dir) => sources(path.join(ROOT, dir)))
    .filter((file) => !file.endsWith(path.join("lib", "plans.ts")))
    .flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return handWritten.filter((re) => re.test(text)).map((re) => `${path.relative(ROOT, file)}: ${re}`);
    });
  assert.deepEqual(offenders, []);
});
