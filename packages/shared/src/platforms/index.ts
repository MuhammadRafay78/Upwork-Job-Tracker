// Runtime-agnostic display metadata for captured platforms. App-level overlays can
// register private boards without adding them to the public package.
export interface PlatformMeta {
  /** Display name. */
  label: string;
  /** Build a posting URL from its platform id, when the id is sufficient. */
  buildUrl?: (platformId: string) => string | null;
  /** Whether stored or reconstructed URLs open the posting directly. */
  directLink?: boolean;
  /** Ignore this platform's posted_date because it reflects capture time. */
  untrustedExactDate?: boolean;
}

const REGISTRY: Record<string, PlatformMeta> = {
  linkedin: {
    label: "LinkedIn",
    buildUrl: (id) => `https://www.linkedin.com/jobs/view/${id}/`,
    directLink: true,
  },
  // Upwork's bare `/jobs/~<id>` short link redirects to the full slugged posting
  // URL, so the id alone is sufficient to rebuild a working link — same shape as
  // LinkedIn's numeric id, just an opaque token instead of a number.
  upwork: {
    label: "Upwork",
    buildUrl: (id) => `https://www.upwork.com/jobs/~${id}`,
    directLink: true,
  },
  manual: { label: "Manual" },
};

/** Register or override platform display metadata. */
export function registerPlatform(platform: string, meta: PlatformMeta): void {
  REGISTRY[platform] = meta;
}

export function platformMeta(platform: string): PlatformMeta | undefined {
  return REGISTRY[platform];
}

/** Return the registered label, or preserve the captured platform token. */
export function platformLabel(platform: string): string {
  return REGISTRY[platform]?.label ?? platform;
}
