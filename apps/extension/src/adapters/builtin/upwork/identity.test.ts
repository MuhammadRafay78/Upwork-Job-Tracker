// Every detail-page action is keyed on the id parsed here, so a URL shape that
// doesn't parse silently disables the whole surface. Shapes and pattern: identity.ts.
import { describe, expect, it } from "vitest";

import { upworkJobId, upworkRenderKey } from "./identity";

describe("upworkJobId", () => {
  it("reads the id from the bare short link", () => {
    expect(upworkJobId("/jobs/~021842968588232972923")).toBe("021842968588232972923");
    expect(upworkJobId("/jobs/~021842968588232972923/")).toBe("021842968588232972923");
  });

  it("reads the id behind the SEO slug on the full posting url", () => {
    expect(upworkJobId("/jobs/Full-Stack-Developer-Needed_~021842968588232972923/")).toBe(
      "021842968588232972923",
    );
  });

  it("reads absolute urls", () => {
    expect(upworkJobId("https://www.upwork.com/jobs/~021842968588232972923")).toBe(
      "021842968588232972923",
    );
  });

  it("returns null when the url names no job", () => {
    expect(upworkJobId("/nx/search/jobs/?q=devops")).toBeNull();
    expect(upworkJobId("/ab/find-work/")).toBeNull();
  });
});

describe("upworkRenderKey", () => {
  it("prefixes the id, so both url shapes tag a card identically", () => {
    expect(upworkRenderKey("/jobs/~021842968588232972923")).toBe("UW-021842968588232972923");
    expect(upworkRenderKey("/jobs/Full-Stack-Developer-Needed_~021842968588232972923/")).toBe(
      "UW-021842968588232972923",
    );
  });

  it("is null when there is no id to prefix", () => {
    expect(upworkRenderKey("/nx/search/jobs/")).toBeNull();
  });
});
