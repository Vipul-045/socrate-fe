import { SiteShell } from "@/components/site/site-shell";
import { ContactForm } from "@/components/site/contact-form";
import {
  Container,
  MonoLabel,
  PageHeader,
  Section,
} from "@/components/site/primitives";
import { CONTACT_CHANNELS } from "@/lib/content";

export const metadata = {
  title: "Contact",
  description:
    "Questions, bug reports, student discounts, or partnerships — a real person reads every message.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <Section>
        <Container>
          <PageHeader
            eyebrow="Contact"
            title="Talk to us"
            lede="Questions, bug reports, student discounts, or partnerships — a real person reads every message and replies within 48 hours."
          />

          <div className="grid gap-12 border-t border-line pt-12 lg:grid-cols-12 lg:gap-16 lg:pt-16">
            <dl className="flex flex-col gap-10 lg:col-span-4">
              {CONTACT_CHANNELS.map((channel) => (
                <div key={channel.label}>
                  <MonoLabel as="dt">{channel.label}</MonoLabel>
                  <dd className="mt-3 text-title">
                    {"href" in channel && channel.href ? (
                      <a
                        href={channel.href}
                        className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      channel.value
                    )}
                  </dd>
                  <dd className="mt-2 max-w-[32ch] text-small text-ink-soft">
                    {channel.description}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="lg:col-span-7 lg:col-start-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
