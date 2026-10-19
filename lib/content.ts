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

export const STATS = [
  { value: "10K+", label: "PDFs analyzed" },
  { value: "500K+", label: "Notes generated" },
  { value: "4.9", label: "Average rating" },
] as const;

export const STUDY_PILLARS_HEADING = "Everything you need to study better";

export const STUDY_PILLARS = [
  {
    title: "Understand",
    description: "Turn difficult topics into simple explanations.",
  },
  {
    title: "Practice",
    description: "Generate quizzes, questions and exams from your material.",
  },
  {
    title: "Revise",
    description: "Create structured notes and flashcards in seconds.",
  },
] as const;

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

export const SHOWCASE = {
  understand: {
    eyebrow: "01 — Understand",
    title: "Ask anything. Get answers that point to the page.",
    body: "Chat with your document in plain language. Socrate explains difficult passages step by step and cites the exact section it drew from, so you can always check the source.",
  },
  practice: {
    eyebrow: "02 — Practice",
    title: "Quiz yourself before the exam does.",
    body: "Socrate turns your material into questions drawn from what you uploaded. Answering them is how knowledge sticks, and every wrong answer shows you exactly where to look next.",
  },
  revise: {
    eyebrow: "03 — Revise",
    title: "Notes worth revising from.",
    body: "Generate structured study notes in one click: key concepts, definitions, and summaries in a clean outline. Download them as a PDF to review offline or print before the exam.",
  },
} as const;

export const JOURNEY = [
  {
    title: "Upload",
    lead: "Bring your study material",
    description:
      "Drop in textbooks, lecture slides, papers, or your own notes. Socrate reads every page.",
    tags: ["PDFs"],
  },
  {
    title: "Understand",
    lead: "Ask questions, search PDFs and get explanations",
    description:
      "Plain-language answers that cite the page they came from, so you can always check the source.",
    tags: ["AI Chat", "Search"],
  },
  {
    title: "Practice",
    lead: "Generate quizzes, questions and exam-style tests",
    description:
      "Test yourself on your own material and see exactly where you went wrong.",
    tags: ["Quizzes", "Exams"],
  },
  {
    title: "Revise",
    lead: "Create notes and flashcards and review key concepts",
    description:
      "Structured notes and flashcards you can review right up to exam day.",
    tags: ["Notes", "Flashcards"],
  },
] as const;

export const TOOLS = [
  "PDFs",
  "AI Chat",
  "Notes",
  "Search",
  "Quizzes",
  "Flashcards",
  "Exams",
] as const;

export const AUDIENCES = [
  {
    title: "Students",
    description:
      "Turn lecture slides and textbook chapters into explanations, practice questions, and revision notes ahead of every exam.",
  },
  {
    title: "Researchers",
    description:
      "Get through dense papers faster. Ask about methods and findings, and get answers tied back to the exact section.",
  },
  {
    title: "Lifelong learners",
    description:
      "Pick up a new subject from books and reports on your own schedule, with a tutor that never runs out of patience.",
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
    label: "Email",
    value: "hello@socrate.in",
    href: "mailto:hello@socrate.in",
    description:
      "Account help, billing, uploads that won't process, and data export or deletion.",
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
