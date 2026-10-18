/**
 * schema.org structured data. A plain <script>, not next/script — it's data,
 * not code. `<` is escaped so no string in the payload can close the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
