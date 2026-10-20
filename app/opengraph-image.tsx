import { ImageResponse } from "next/og";

import { OG_IMAGE, SITE_NAME } from "@/lib/seo";

/**
 * Site-wide social share image, inherited by every route. Generated once at
 * build time. Colours are the site palette (paper / ink) from tailwind.config.ts.
 * To use a designed image instead, delete this file and drop an
 * `opengraph-image.png` (1200×630) into app/.
 */

export const alt = OG_IMAGE.alt;
export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f6f4f0",
          color: "#1a1815",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {SITE_NAME}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.04em" }}>
            Drop your notes.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "#6b665d",
            }}
          >
            Walk out knowing everything.
          </div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 30, lineHeight: 1.4, color: "#6b665d", maxWidth: 900 }}>
            The study platform for notes, quizzes &amp; revision.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid #e0dbd1",
            paddingTop: 28,
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#7d786e",
          }}
        >
          <span>Understand · Practice · Revise</span>
          <span>socrate.in</span>
        </div>
      </div>
    ),
    size
  );
}
