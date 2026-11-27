/**
 * Single source of truth for SEO metadata defaults.
 * Page-level `metadata` exports override these; edit wording here.
 */

import type { Metadata } from "next";

import type { Post } from "@/lib/blog";
import { CONTACT_CHANNELS, FAQS } from "@/lib/content";
import { PLANS, PLAN_CURRENCY } from "@/lib/plans";
import type { MemberPlan } from "@/lib/services";

export const SITE_NAME = "Socrate";

/**
 * Canonical origin, no trailing slash. Used for metadataBase, canonicals, and OG urls.
 * Production serves from www — the apex domain 308-redirects there — so canonicals
 * must use www or they'd point search engines at a redirect.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.socrate.in";

/** The homepage title, and the fallback for any route that doesn't set one. */
export const DEFAULT_TITLE =
  "Socrate — The Study Platform for Notes, Quizzes & Revision";

/** The homepage meta description: the entity description, condensed for snippets. */
export const DEFAULT_DESCRIPTION =
  "Upload your notes and PDFs, then understand them, quiz yourself and revise — all in one study platform. AI explanations that cite the source page. Free to start, no card needed.";

/**
 * What Socrate is, in one sentence. Used word for word on the homepage, /about,
 * structured data and llms.txt — and should match the Product Hunt and LinkedIn
 * listings — so search engines and AI systems see one consistent description.
 */
export const ENTITY_DESCRIPTION =
  "Socrate is a study platform where students upload their notes and PDFs, get explanations that cite the source page, generate quizzes and flashcards, and revise from notes they can export.";

export const LOCALE = "en";

export const TITLE_TEMPLATE = `%s — ${SITE_NAME}`;

/** Served by app/opengraph-image.tsx, which reads its size and alt from here. */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}: Drop your notes. Walk out knowing everything. The study platform for notes, quizzes and revision.`,
};

/**
 * Set per indexable page rather than in the root layout, so routes Next marks
 * noindex itself (404s) never also receive a conflicting "index".
 */
const INDEX: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/** For pages that should stay out of search results but still pass link equity. */
export const NO_INDEX: Metadata["robots"] = { index: false, follow: true };

export function absoluteUrl(path = "/"): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/**
 * Metadata for an indexable page: title, description, canonical, robots, and a
 * complete Open Graph block. Next merges `openGraph` shallowly — a page that sets
 * it loses the root layout's, image included — so every page sets the whole
 * block. Twitter tags are derived from Open Graph by Next.
 */
export function pageMetadata({
  title,
  description,
  path,
  article,
}: {
  title: string | { absolute: string };
  description: string;
  /** Route path, e.g. "/pricing". Resolved against metadataBase. */
  path: string;
  article?: { publishedTime: string; section?: string };
}): Metadata {
  const shared = {
    title:
      typeof title === "string"
        ? TITLE_TEMPLATE.replace("%s", title)
        : title.absolute,
    description,
    url: path,
    siteName: SITE_NAME,
    locale: LOCALE,
    images: [OG_IMAGE],
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: INDEX,
    openGraph: article
      ? {
          ...shared,
          type: "article",
          publishedTime: article.publishedTime,
          section: article.section,
        }
      : { ...shared, type: "website" },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data (schema.org JSON-LD). Rendered with <JsonLd />.     */
/* ------------------------------------------------------------------ */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
/** The product. Home and /pricing describe the same node, so they share an id. */
const APP_ID = `${SITE_URL}/#app`;

const SUPPORT = CONTACT_CHANNELS.find((channel) => channel.label === "Email");

function organization() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: ENTITY_DESCRIPTION,
    logo: absoluteUrl("/icon.png"),
    ...(SUPPORT && {
      email: SUPPORT.value,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SUPPORT.value,
        availableLanguage: ["English"],
      },
    }),
  };
}

function breadcrumbs(...trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Home page: who we are, the site, and the product. The FAQPage lives on /faq
 * alone — the homepage shows a few of the same questions, and marking them up
 * twice would hand search engines two competing copies.
 */
export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: ENTITY_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": ORGANIZATION_ID },
      },
      webApplication(PLAN_OFFERS),
    ],
  };
}

type OfferPlan = Pick<MemberPlan, "name" | "price" | "currency" | "durationDays">;

/** Free and Pro as lib/plans.ts states them, for pages that don't read the
 *  live plans. */
const PLAN_OFFERS: OfferPlan[] = Object.values(PLANS).map((plan) => ({
  name: plan.name,
  price: plan.price,
  currency: PLAN_CURRENCY,
  durationDays: 30,
}));

/** What one payment buys: a month, a year, or a number of days. */
function billingPeriod(durationDays: number) {
  if (durationDays >= 28 && durationDays <= 31) return { value: 1, unitCode: "MON" };
  if (durationDays >= 365 && durationDays <= 366) return { value: 1, unitCode: "ANN" };
  return { value: durationDays, unitCode: "DAY" };
}

function offer(plan: OfferPlan) {
  const price = String(plan.price);
  const priceCurrency = (plan.currency || PLAN_CURRENCY).toUpperCase();
  return {
    "@type": "Offer",
    name: plan.name,
    price,
    priceCurrency,
    url: absoluteUrl("/pricing"),
    ...(plan.price > 0 && {
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price,
        priceCurrency,
        referenceQuantity: { "@type": "QuantitativeValue", ...billingPeriod(plan.durationDays) },
      },
    }),
  };
}

/** The product. Home and /pricing describe the same node. No ratings or
 *  reviews: there are none to mark up. */
function webApplication(plans: OfferPlan[]) {
  return {
    "@type": "WebApplication",
    "@id": APP_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: ENTITY_DESCRIPTION,
    inLanguage: "en",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    publisher: { "@id": ORGANIZATION_ID },
    offers: plans.map(offer),
  };
}

/**
 * /pricing: one Offer per plan at the price the page shows — the live plans
 * the server read for the cards, or lib/plans.ts when the backend didn't
 * answer (the browser then loads the same plans).
 */
export function pricingJsonLd(plans: MemberPlan[] | null) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      webApplication(plans?.filter((plan) => plan.isActive !== false) ?? PLAN_OFFERS),
      breadcrumbs({ name: "Pricing", path: "/pricing" }),
    ],
  };
}

export function featuresJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumbs({ name: "Features", path: "/features" })],
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        url: absoluteUrl("/faq"),
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      breadcrumbs({ name: "FAQ", path: "/faq" }),
    ],
  };
}

export function aboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      {
        "@type": "AboutPage",
        url: absoluteUrl("/about"),
        name: `About ${SITE_NAME}`,
        description: ENTITY_DESCRIPTION,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANIZATION_ID },
      },
      breadcrumbs({ name: "About", path: "/about" }),
    ],
  };
}

export function blogPostJsonLd(post: Post) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const publisher = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        url,
        mainEntityOfPage: url,
        image: absoluteUrl(OG_IMAGE.url),
        datePublished: post.date,
        dateModified: post.date,
        articleSection: post.category,
        inLanguage: "en",
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher,
      },
      breadcrumbs(
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ),
    ],
  };
}
