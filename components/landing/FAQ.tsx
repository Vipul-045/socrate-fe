import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/hooks/use-reveal";

const faqs = [
  {
    q: "What file types are supported?",
    a: "Currently we support PDF files of any size. We're working on adding support for DOCX, PPTX, and EPUB formats.",
  },
  {
    q: "How accurate is the AI?",
    a: "Socrate uses state-of-the-art language models that provide highly accurate answers sourced directly from your documents. It always cites the relevant sections.",
  },
  {
    q: "Can I use it on mobile?",
    a: "Yes! Socrate is fully responsive and works great on phones and tablets. A native app is coming soon.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your documents are encrypted at rest and in transit. We never use your data to train our models. You can delete your files anytime.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time with no questions asked. You'll retain access until the end of your billing period.",
  },
  {
    q: "What's the note download format?",
    a: "Notes can be downloaded as beautifully formatted PDFs. We're also adding Markdown and DOCX export options.",
  },
  {
    q: "How many PDFs can I upload?",
    a: "Free users get 3 PDFs per month. Pro and Team plans include unlimited uploads.",
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes! Students with a valid .edu email get 30% off Pro plans. Contact us to apply.",
  },
];

export function FAQ() {
  return (
    <section id="faqs" className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about Socrate.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 data-[state=open]:bg-muted/50 bg-white"
              >
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
