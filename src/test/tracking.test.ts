import { describe, it, expect } from "vitest";
import { withTracking } from "@/lib/tracking";

const SEARCH = "?utm_source=google&utm_medium=cpc&utm_campaign=test_campaign";

describe("withTracking", () => {
  it("appends the campaign params to main-site links", () => {
    expect(withTracking("https://madmonkeyhostels.com/our-story", SEARCH)).toBe(
      "https://madmonkeyhostels.com/our-story" + SEARCH
    );
  });

  it("handles the bare main-site origin", () => {
    expect(withTracking("https://madmonkeyhostels.com", SEARCH)).toBe(
      "https://madmonkeyhostels.com/" + SEARCH
    );
  });

  it("leaves same-page anchors alone", () => {
    for (const anchor of ["#book", "#basecamp", "#contact", "#surfcamp"]) {
      expect(withTracking(anchor, SEARCH)).toBe(anchor);
    }
  });

  it("leaves external domains alone", () => {
    const social = [
      "https://www.instagram.com/madmonkeyhostels/",
      "https://www.tiktok.com/@madmonkeyhostels",
      "https://x.com/madmonkeyhostel",
      "https://www.facebook.com/MadMonkeyHostels",
    ];
    for (const href of social) expect(withTracking(href, SEARCH)).toBe(href);
  });

  it("does not match lookalike domains", () => {
    const href = "https://notmadmonkeyhostels.com/our-story";
    expect(withTracking(href, SEARCH)).toBe(href);
  });

  it("is a no-op when the landing page has no query string", () => {
    const href = "https://madmonkeyhostels.com/our-story";
    expect(withTracking(href, "")).toBe(href);
  });

  it("merges without clobbering params already on the link", () => {
    const result = withTracking(
      "https://madmonkeyhostels.com/tours-events/surf-camp?utm_source=newsletter",
      SEARCH
    );
    const params = new URL(result).searchParams;
    expect(params.get("utm_source")).toBe("newsletter");
    expect(params.get("utm_medium")).toBe("cpc");
    expect(params.get("utm_campaign")).toBe("test_campaign");
  });

  it("forwards click IDs and any other tracking params, not just utm_*", () => {
    const result = withTracking(
      "https://madmonkeyhostels.com/login",
      "?gclid=abc123&fbclid=xyz789&utm_source=google"
    );
    const params = new URL(result).searchParams;
    expect(params.get("gclid")).toBe("abc123");
    expect(params.get("fbclid")).toBe("xyz789");
    expect(params.get("utm_source")).toBe("google");
  });

  it("preserves a hash on the target link", () => {
    const result = withTracking("https://madmonkeyhostels.com/our-story#team", SEARCH);
    expect(result).toContain("utm_campaign=test_campaign");
    expect(result.endsWith("#team")).toBe(true);
  });
});
