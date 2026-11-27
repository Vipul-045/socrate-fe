import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { safeAppUrl, safeInternalPath } from "../lib/navigation.ts";

/* Where /pricing and /checkout may send a reader: ?returnTo= only to a page
   on this site, ?appReturn= only to a page of the app — never anywhere else. */

const APP = "https://app.socrate.in";

describe("safeAppUrl", () => {
  test("a page of the app comes back as it is", () => {
    assert.equal(safeAppUrl("https://app.socrate.in/chat/123?tab=billing", APP), "https://app.socrate.in/chat/123?tab=billing");
    assert.equal(safeAppUrl("https://app.socrate.in", APP), "https://app.socrate.in/");
  });

  test("anything else is refused", () => {
    for (const raw of [
      "https://evil.example/app.socrate.in",
      "https://app.socrate.in.evil.example/",
      "http://app.socrate.in/",
      "//app.socrate.in/",
      "/chat",
      "javascript:alert(1)",
      "https://socrate.in/pricing",
      "",
      null,
      undefined,
      `https://app.socrate.in/${"a".repeat(3000)}`,
    ]) {
      assert.equal(safeAppUrl(raw as string | null | undefined, APP), null, String(raw).slice(0, 60));
    }
  });

  test("without an app URL configured, nothing is allowed", () => {
    assert.equal(safeAppUrl("https://app.socrate.in/", ""), null);
  });
});

describe("safeInternalPath (unchanged)", () => {
  test("the pricing page with the reader's choice is kept; other sites are not", () => {
    assert.equal(safeInternalPath("/pricing?cycle=yearly&coupon=FOUNDER25", "/"), "/pricing?cycle=yearly&coupon=FOUNDER25");
    assert.equal(safeInternalPath("//evil.example/pricing", "/pricing"), "/pricing");
  });
});
