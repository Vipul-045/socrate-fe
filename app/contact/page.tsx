import { SiteShell } from "@/components/site/site-shell";
import { ContactForm } from "@/components/site/contact-form";
import {
  Container,
  MonoLabel,
  PageHeader,
  Section,
} from "@/components/site/primitives";
import { CONTACT_CHANNELS } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Questions, bug reports, student discounts, or partnerships — a real person reads every message.",
  path: "/contact",
});

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

          <div className="grid gap-[clamp(2.25rem,5vw,4.5rem)] border-t border-line-strong pt-[clamp(2.25rem,4.5vw,3.5rem)] lg:grid-cols-12">
            <dl className="flex flex-col gap-[clamp(1.625rem,3vw,2.125rem)] lg:col-span-4">
              {CONTACT_CHANNELS.map((channel) => (
                <div key={channel.label}>
                  <MonoLabel as="dt">{channel.label}</MonoLabel>
                  <dd className="mt-2 text-base font-medium tracking-[-0.012em]">
                    {"href" in channel && channel.href ? (
                      <a
                        href={channel.href}
                        className="-my-3 inline-block py-3 transition-colors hover:text-ink-soft"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      channel.value
                    )}
                  </dd>
                  <dd className="mt-2 max-w-[280px] text-small text-ink-soft">
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
