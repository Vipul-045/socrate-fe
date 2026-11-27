import { POSTS } from "@/lib/blog";
import { PLANS, limitsPhrase, rupees } from "@/lib/plans";
import { ENTITY_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo";

/**
 * /llms.txt (https://llmstxt.org): a plain-text map of the site for AI
 * systems. Built from the same constants as the pages (plans: lib/plans.ts), so it
 * can't drift.
 */
export const dynamic = "force-static";

export function GET() {
  const pages = [
    ["Features", "/features", "Every feature in detail: uploads, cited explanations, search, quizzes, flashcards and exportable notes."],
    ["Pricing", "/pricing", `Plans and prices. Free to start, no card required; Pro is ${rupees(PLANS.pro.price)} a month with higher limits.`],
    ["FAQ", "/faq", "File types, accuracy, privacy, mobile use, exports, billing and student discounts."],
    ["About", "/about", "Why Socrate exists and how it approaches AI for studying."],
    ["Blog", "/blog", "Essays on study methods, memory and building an AI tutor that cites its sources."],
  ];

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${ENTITY_DESCRIPTION}`,
    "",
    "Key facts:",
    "- Answers come from the uploaded document and cite the page and section they were drawn from; if the document doesn't contain an answer, Socrate says so.",
    "- Supported uploads: PDF. DOCX, PPTX and EPUB support is in progress.",
    "- Notes export as formatted PDFs.",
    "- Works in the browser on desktop, tablet and phone.",
    "- Uploaded documents are encrypted in transit and at rest and are never used to train models.",
    "",
    "## Plans",
    "",
    "Prices are in Indian rupees, GST included. Limits count per 30-day plan period; uploads aren't capped on either plan.",
    "",
    `- ${PLANS.free.name}: ${rupees(PLANS.free.price)}, no card required. ${limitsPhrase(PLANS.free.limits)} a month.`,
    `- ${PLANS.pro.name}: ${rupees(PLANS.pro.price)} a month, renewing until cancelled. ${limitsPhrase(PLANS.pro.limits)} a month, and a higher daily AI allowance. First-time subscribers get a ${PLANS.pro.trialDays}-day free trial.`,
    "",
    "## Pages",
    "",
    ...pages.map(([name, path, note]) => `- [${name}](${absoluteUrl(path)}): ${note}`),
    "",
    "## Blog",
    "",
    ...POSTS.map((post) => `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.excerpt}`),
    "",
    "## Optional",
    "",
    `- [Contact](${absoluteUrl("/contact")})`,
    `- [Privacy Policy](${absoluteUrl("/privacy")})`,
    `- [Terms & Conditions](${absoluteUrl("/terms")})`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
