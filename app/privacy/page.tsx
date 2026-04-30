import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";


export const metadata = { title: "Privacy Policy – Socrate" };

const sections = [
  {
    title: "1. Data We Collect",
    items: [
      {
        label: "Account information:",
        text: "When you sign up via Google or email, we receive your name, email address, and profile picture. We store this to identify your account.",
      },
      {
        label: "Uploaded documents:",
        text: "PDFs you upload are stored securely and used solely to power your AI study sessions. You can delete them at any time from your dashboard.",
      },
      {
        label: "Usage data:",
        text: "We track events like document uploads, chat sessions, and notes exports. This helps us understand what's working and what to improve. No keystroke logging, no browsing history.",
      },
      {
        label: "Payment data:",
        text: "Payments are processed by Stripe. We do not store your card number or full payment details. We receive only a confirmation of payment status and your subscription tier.",
      },
    ],
  },
  {
    title: "2. How We Use It",
    items: [
      {
        label: "To provide the service:",
        text: "Your documents and chat history are used to power the AI tutor experience.",
      },
      {
        label: "To improve Socrate:",
        text: "Aggregated, anonymised usage data helps us prioritise features and fix bugs.",
      },
      {
        label: "To communicate with you:",
        text: "We may send transactional emails (receipts, password resets). We will not spam you.",
      },
    ],
  },
  {
    title: "3. Data Sharing",
    items: [
      {
        label: "We don't sell your data.",
        text: "Full stop. We share data only with sub-processors needed to run the service (e.g. OpenAI for AI responses, Stripe for payments, Cloudflare for storage).",
      },
      {
        label: "Legal requirements:",
        text: "We may disclose data if required by law, but we'll notify you unless legally prohibited from doing so.",
      },
    ],
  },
  {
    title: "4. Data Retention",
    items: [
      {
        label: "Your documents:",
        text: "Stored for as long as your account is active. Deleted immediately upon your request.",
      },
      {
        label: "Account data:",
        text: "Retained for 30 days after account deletion, then permanently erased.",
      },
    ],
  },
  {
    title: "5. Your Rights",
    items: [
      {
        label: "Access & export:",
        text: "You can request a copy of all data we hold about you at any time.",
      },
      {
        label: "Deletion:",
        text: "You can delete your account and all associated data from Settings → Account.",
      },
      {
        label: "Correction:",
        text: "You can update your name and email directly from your profile.",
      },
    ],
  },
  {
    title: "6. Contact",
    items: [
      {
        label: "Questions?",
        text: "Email us at privacy@socrate.in — we respond within 48 hours.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-[#f5f3ef]">
      <div className="max-w-2xl mx-auto px-6 py-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background text-xs text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Last updated: March 28, 2026
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
          Privacy Policy
        </h1>

        {/* Intro */}
        <p className="text-muted-foreground text-base leading-relaxed mb-12 border-b border-dashed border-border pb-10">
          This policy explains what data Socrate collects, why we collect it,
          and how we use it. We've written it in plain English — no legal walls.
        </p>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-dashed border-border pb-10">
              <h2 className="text-xl font-bold text-foreground mb-5">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <p key={item.label} className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">{item.label}</span>{" "}
                    {item.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
    <Footer/>
    </>
  );
}