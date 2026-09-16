/**
 * Single source of truth for site copy.
 * Pages stay layout-only; edit wording here.
 */

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/#faqs" },
] as const;

export const FOOTER_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
] as const;

export const FREE_TIER_NOTE =
  "Free to start · 3 PDFs every month · No card required";

export const VALUE_PROPS = [
  {
    title: "3 PDFs / month",
    description: "Start free, no card required",
  },
  {
    title: "Instant AI insights",
    description: "Summarize, ask, and quiz from your PDFs",
  },
  {
    title: "Built for students",
    description: "Learn faster without any confusion",
  },
] as const;

export const STEPS = [
  {
    title: "Upload your PDF",
    description:
      "Drag and drop any document into Socrate. We support all PDF formats.",
  },
  {
    title: "Ask questions or generate notes",
    description:
      "Chat with your document or let AI create comprehensive study notes for you.",
  },
  {
    title: "Download & study smarter",
    description: "Export your notes, review key concepts, and ace your exams.",
  },
] as const;

export const FEATURES = [
  {
    title: "Upload any PDF",
    description:
      "Drag and drop any document — textbooks, papers, reports — and start learning instantly.",
  },
  {
    title: "Chat with your document",
    description:
      "Ask questions in natural language and get precise answers sourced from your PDF.",
  },
  {
    title: "Auto-generate notes",
    description:
      "One click to generate structured, comprehensive notes from any document.",
  },
  {
    title: "Download notes as PDF",
    description:
      "Export your AI-generated notes as beautifully formatted PDFs.",
  },
  {
    title: "Smart search inside PDFs",
    description: "Find exactly what you need with AI-powered semantic search.",
  },
  {
    title: "Quiz yourself on content",
    description:
      "Test your understanding with auto-generated quizzes based on your documents.",
  },
] as const;

export const FAQS = [
  {
    q: "What file types are supported?",
    a: "Currently we support PDF files of any size. Support for DOCX, PPTX and EPUB is in progress.",
  },
  {
    q: "How accurate is the AI?",
    a: "Socrate answers only from the document you uploaded and cites the section it drew from, so you can check any claim against the source rather than taking it on trust.",
  },
  {
    q: "Can I use it on mobile?",
    a: "Yes. Socrate works on phones and tablets in the browser. A native app is coming.",
  },
  {
    q: "Is my data private?",
    a: "Your documents are encrypted in transit and at rest, and are never used to train models. You can delete any file from your dashboard at any time.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from Settings and you keep access until the end of the billing period. No email required.",
  },
  {
    q: "What's the note download format?",
    a: "Notes download as formatted PDFs. Markdown and DOCX export are on the way.",
  },
  {
    q: "How many PDFs can I upload?",
    a: "Free gives you 3 PDFs a month. Pro and Max include unlimited uploads.",
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes. Students with a valid .edu address get 30% off Pro — email us from that address to apply.",
  },
] as const;

export const CONTACT_CHANNELS = [
  {
    label: "Support",
    value: "support@socrate.ai",
    href: "mailto:support@socrate.ai",
    description: "Account issues, uploads that won't process, billing.",
  },
  {
    label: "Privacy",
    value: "privacy@socrate.in",
    href: "mailto:privacy@socrate.in",
    description: "Data requests, deletion, and export.",
  },
  {
    label: "Response time",
    value: "Within 48 hours",
    description: "Monday to Friday. Weekend messages are answered Monday.",
  },
] as const;

export const CONTACT_TOPICS = [
  "General question",
  "Bug report",
  "Billing or subscription",
  "Student discount",
  "Partnership",
] as const;
