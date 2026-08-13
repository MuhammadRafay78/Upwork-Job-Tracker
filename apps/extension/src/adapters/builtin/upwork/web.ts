import type { Adapter } from "../../types";
import type { ListingRecord } from "../../../messages";
import {
  autoEmit,
  captureListingOnce,
  injectDetailButtons,
  renderJob,
  refreshStates,
  toNaturalKey,
} from "../../../engine.js";
import { platformMeta } from "@job-tracker/shared/platforms";
import { UPWORK_PREFIX, upworkJobId, upworkRenderKey } from "./identity.js";

// Upwork — SCAFFOLD, not yet verified against a live/logged-in DOM. Identity
// (URL → job id) is derived from Upwork's known public URL scheme and should be
// reliable; card discovery and detail scraping are deliberately conservative
// (structure-based, not classname-based) because Upwork ships hashed/rotating
// classnames on a React SPA the same way LinkedIn's SDUI layouts do, and those
// can only be pinned down from real captured markup. See
// adapters/builtin/upwork/fixtures/README.md for what's needed to harden this
// the way builtin/linkedin/web.ts is (its fixtures/*.html + *.fixture.test.ts).

const UPWORK = platformMeta("upwork")!;
const postingUrl = (platformId: string) => UPWORK.buildUrl!(platformId)!;

// Every element the SPA might route through that could show job listings: the
// search/browse results, saved jobs, and "my jobs"/proposals surfaces. Broad on
// purpose — activeOn only gates *scanning*, never capture correctness, so an
// over-eager match here costs a wasted scan, not a wrong record.
function isJobSurface(path: string): boolean {
  return (
    path.startsWith("/jobs") ||
    path.startsWith("/nx/search/jobs") ||
    path.startsWith("/nx/proposals") ||
    path.startsWith("/ab/proposals") ||
    path.startsWith("/ab/find-work")
  );
}

// Structure-based card discovery: anchor on hrefs that carry a job id (the one
// part of a listing card that Upwork cannot obfuscate without breaking its own
// navigation), not on classnames, which is the part most likely to rotate.
// Deliberately does NOT try to resolve a "company" — Upwork jobs are posted by a
// client, not tied to a company page the way LinkedIn's are, and reading a
// reliable client name needs a captured fixture to confirm where it lives.
function findJobAnchors(doc: Document): HTMLAnchorElement[] {
  const seen = new Set<string>();
  const anchors: HTMLAnchorElement[] = [];
  doc.querySelectorAll<HTMLAnchorElement>('a[href*="~"]').forEach((a) => {
    const id = upworkJobId(a.getAttribute("href") || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    anchors.push(a);
  });
  return anchors;
}

// The nearest ancestor that plausibly bounds one listing's content, so the
// action bar and dataset tags land on the card rather than the bare link. No
// stable Upwork class to key on yet, so this climbs a bounded number of levels
// looking for a list-item-shaped container and falls back to the link's direct
// parent — safe (if imprecise) until fixtures confirm the real card boundary.
function cardFor(anchor: HTMLAnchorElement): HTMLElement {
  let node: HTMLElement | null = anchor;
  for (let i = 0; node && i < 6; node = node.parentElement, i++) {
    if (node.matches('li, article, [role="listitem"], [data-test*="job" i]')) return node;
  }
  return (anchor.parentElement as HTMLElement) || anchor;
}

function currentDetailId(): string | null {
  return upworkRenderKey(location.pathname);
}

// Minimal, honest capture: only the fields derivable without guessing Upwork's
// current DOM (id/url from the URL itself, title from the tab title). Budget,
// client rating, proposals count, skills, description, etc. all belong in
// `meta` once real selectors exist — left absent rather than populated with
// unverified guesses that would silently corrupt captured data.
function captureDetail(jobId: string): ListingRecord | null {
  const key = toNaturalKey(jobId);
  if (!key) return null;
  // Upwork job-detail tab titles are commonly "<Job Title> | Upwork" — split
  // defensively in case that template varies.
  const title = document.title.replace(/\s*\|\s*Upwork\s*$/i, "").trim() || null;
  return {
    ...key,
    url: postingUrl(key.platform_id),
    title,
    company: null,
    apply_type: "unknown",
    meta: {},
  };
}

export const upworkAdapter: Adapter = {
  matches: (h) => h === "www.upwork.com",
  naturalKey: (id) =>
    id.startsWith(UPWORK_PREFIX)
      ? { platform: "upwork", platform_id: id.slice(UPWORK_PREFIX.length) }
      : null,
  activeOn: isJobSurface,
  scanDetail() {
    const jobId = currentDetailId();
    if (!jobId) return;
    // No verified anchor point on Upwork's detail pane yet (see fixtures/README.md)
    // — injectDetailButtons no-ops on a null anchor, so `seen`/state refresh still
    // fire without risking a bar mounted somewhere wrong.
    injectDetailButtons(jobId, null);
    void autoEmit(jobId, "seen");
    void refreshStates([jobId]).then(() => renderJob(jobId));
  },
  capture() {
    captureListingOnce(currentDetailId(), captureDetail);
  },
  findCards(doc) {
    const cards: HTMLElement[] = [];
    findJobAnchors(doc).forEach((a) => {
      const renderKey = upworkRenderKey(a.getAttribute("href") || "");
      if (!renderKey) return;
      const card = cardFor(a);
      if (card.dataset.jhId) return;
      card.dataset.jhId = renderKey;
      card.dataset.jobUrl = a.href;
      card.dataset.jobTitle = a.textContent?.trim() || a.getAttribute("aria-label") || "";
      card.dataset.jobCompany = "";
      cards.push(card);
    });
    return cards;
  },
};
