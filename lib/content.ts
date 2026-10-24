/**
 * Single source of truth for site copy.
 * Pages stay layout-only; edit wording here.
 */

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faq" },
] as const;

export const FOOTER_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
] as const;

export const FREE_TIER_NOTE =
  "Free to start · 3 PDFs every month · No card required";

export const STATS = [
  { value: "10K+", label: "PDFs analyzed" },
  { value: "500K+", label: "Notes generated" },
  { value: "3", label: "Free PDFs a month" },
] as const;

export const STUDY_PILLARS_HEADING = "One upload, three ways to study";

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

export type Feature = {
  /** Anchor on /features. */
  id: string;
  title: string;
  /** One line for the overview grid. */
  summary: string;
  /** What it does and why it's useful. */
  body: readonly string[];
  howTo: string;
  problem: string;
  useCases: readonly string[];
};

/** /features — one section per feature, in study order: understand, practise, revise. */
export const FEATURES: readonly Feature[] = [
  {
    id: "upload",
    title: "Upload your notes and PDFs",
    summary:
      "Bring textbooks, lecture slides, papers or your own notes. Socrate reads every page.",
    body: [
      "Everything in Socrate starts with your own material. Drag in a PDF — a textbook chapter, exported lecture slides, a research paper, a past paper or notes you've typed up — and Socrate reads every page and keeps track of where each passage sits.",
      "That page-by-page map is what makes the rest of the platform trustworthy: every explanation, quiz question and note can point back to the exact place it came from. PDF is supported today; DOCX, PPTX and EPUB support is in progress.",
    ],
    howTo:
      "Upload one file per topic, chapter or lecture so each study session stays focused. The free plan includes 3 PDFs a month with no card required; Pro removes the limit for a full course load.",
    problem:
      "Study material ends up scattered across slides, handouts and textbooks. Keeping it in one place means you search, ask and revise from the same source instead of juggling tabs and folders.",
    useCases: [
      "Lecture slides exported to PDF",
      "Textbook chapters and course readers",
      "Research papers and reports",
      "Your own notes, saved as a PDF",
    ],
  },
  {
    id: "explanations",
    title: "AI explanations that cite the source page",
    summary:
      "Ask in plain language and get answers that point to the exact page they came from.",
    body: [
      "Ask about your document the way you'd ask a tutor: why does this step follow from the last one, what does this paragraph mean in simpler words, how are these two terms different? Socrate answers from the material you uploaded, explains difficult passages step by step, and cites the page and section it drew from.",
      "If your document doesn't contain the answer, Socrate says so rather than guessing. That's the difference between studying with AI and studying with a chatbot that sounds confident.",
    ],
    howTo:
      "Read a section, then ask about whatever didn't land. Open the cited page to check the answer against the original, and keep asking follow-up questions until you could explain the idea in your own words.",
    problem:
      "General-purpose AI can be fluent and wrong, and a wrong definition you memorise costs marks in the exam. Page citations make every answer checkable in seconds.",
    useCases: [
      "Untangling a dense textbook paragraph",
      "Filling the gaps when lecture slides skip steps",
      "Checking you've understood the method section of a paper",
    ],
  },
  {
    id: "search",
    title: "Search inside your PDFs",
    summary:
      "Find what you need by meaning, not just exact words, across long documents.",
    body: [
      "Smart search looks through your documents by meaning. A search for “how cells make energy” can surface the section on cellular respiration even if those exact words never appear on the page.",
      "It makes long PDFs far easier to study from: a 300-page textbook becomes something you can query, not just scroll.",
    ],
    howTo:
      "Use search when you know a topic is in there somewhere but not where — before an open-book test, while writing an essay, or when a quiz question sends you back to the material.",
    problem:
      "Ctrl+F only finds exact words. When you can't remember the term the author used, searching by meaning still gets you to the right page.",
    useCases: [
      "Finding a definition in a long textbook",
      "Locating evidence for an essay or assignment",
      "Going back to a topic you got wrong in a quiz",
    ],
  },
  {
    id: "quizzes",
    title: "AI quiz generator and exam practice",
    summary:
      "Generate quizzes and exam-style questions from your own material.",
    body: [
      "Socrate's AI quiz generator turns what you uploaded into questions — quick multiple-choice checks after a lecture, or exam-style practice when a test is coming up.",
      "Every question is drawn from your document, so you're tested on your course rather than on whatever a generic question bank happens to cover. When you get one wrong, Socrate shows you where in the material to look next.",
    ],
    howTo:
      "Quiz yourself after each study session, not only the week before the exam. Answer from memory first, then review the questions you missed and go back to the pages they point to.",
    problem:
      "Re-reading feels productive but mostly builds familiarity. Answering questions makes you retrieve the material, which is what makes it stick — and it shows you what you don't know while there's still time to fix it.",
    useCases: [
      "Exam preparation for school and university courses",
      "Checking your understanding after a lecture",
      "Finding weak topics before a test",
    ],
  },
  {
    id: "flashcards",
    title: "Flashcards from your material",
    summary:
      "Turn key terms, definitions and concepts into flashcards for quick review.",
    body: [
      "Socrate creates flashcards from your material: key terms, definitions and concepts, one idea per card. Because they come from your own document, the wording matches what your course actually uses.",
    ],
    howTo:
      "Use flashcards for short, frequent reviews — between classes, on the commute, or for ten minutes before bed. Say the answer out loud before you flip a card, and come back to the ones you miss.",
    problem:
      "Writing flashcards by hand often takes longer than reviewing them. Generating them from the source lets you spend that time practising recall instead.",
    useCases: [
      "Vocabulary, definitions and formulas",
      "Memory-heavy subjects like anatomy, law and languages",
      "Last-minute review before an exam",
    ],
  },
  {
    id: "notes",
    title: "AI notes you can export",
    summary:
      "Structured study notes in one click, downloadable as a formatted PDF.",
    body: [
      "Generate structured notes from any document in one click: key concepts, definitions and summaries laid out as a clean outline.",
      "Download your AI notes as a formatted PDF to review offline, print before the exam, or share with a study group. Markdown and DOCX export are on the way.",
    ],
    howTo:
      "Generate notes for a chapter before you read it to see the shape of the topic, then come back to them for revision. Print the PDF if you prefer revising on paper.",
    problem:
      "Turning a long chapter into notes can take an evening. Socrate gives you a structured starting point in seconds, so your time goes into understanding the material rather than copying it out.",
    useCases: [
      "A revision sheet for each topic",
      "Catching up on a missed lecture",
      "Summarising a long paper before a seminar",
    ],
  },
];

export type FaqItem = {
  q: string;
  a: string;
  /** Shown on the homepage. The full list lives on /faq. */
  featured?: boolean;
};

export const FAQS: readonly FaqItem[] = [
  {
    q: "What file types are supported?",
    a: "Currently we support PDF files of any size. Support for DOCX, PPTX and EPUB is in progress.",
    featured: true,
  },
  {
    q: "How accurate is the AI?",
    a: "Socrate answers only from the document you uploaded and cites the section it drew from, so you can check any claim against the source rather than taking it on trust.",
    featured: true,
  },
  {
    q: "Can I use it on mobile?",
    a: "Yes. Socrate works on phones and tablets in the browser. A native app is coming.",
  },
  {
    q: "Is my data private?",
    a: "Your documents are encrypted in transit and at rest, and are never used to train models. You can delete any file from your dashboard at any time.",
    featured: true,
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
    featured: true,
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes. Students with a valid .edu address get 30% off Pro — email us from that address to apply.",
  },
];

export const CONTACT_CHANNELS = [
  {
    label: "Email",
    value: "socratedotin@gmail.com",
    href: "mailto:socratedotin@gmail.com",
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
