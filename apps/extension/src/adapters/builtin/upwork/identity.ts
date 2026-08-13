// Upwork's render-key prefix — mirrors LinkedIn's identity.ts (LINKEDIN_PREFIX):
// the web adapter tags a card "UW-021842968588232972923" and parses it back.
// Render keys are extension-local, so they live here rather than in the shared
// platform registry, which owns only runtime-agnostic display/link data.
export const UPWORK_PREFIX = "UW-";

// Upwork hands out two URL shapes for the same posting: a bare short link
// (`/jobs/~021842968588232972923`) that redirects to the full slugged one
// (`/jobs/Full-Job-Title-Here_~021842968588232972923/`). Both carry the opaque
// ciphertext id after a `~`, optionally preceded by an `_` when a slug leads it.
// The id itself is alphanumeric (commonly a long digit run); unanchored at the
// front so it matches inside any path depth (search, saved, detail).
//
// NOTE: derived from Upwork's known public URL scheme, not verified against a
// captured DOM — flag this file if the id format turns out to need adjustment
// once real fixtures are captured (see adapters/builtin/upwork/fixtures/README.md).
const JOB_PATH = /~([a-zA-Z0-9]{8,})/;

/** The opaque platform id in an Upwork job URL or path. Null when there is none. */
export function upworkJobId(source: string): string | null {
  return source.match(JOB_PATH)?.[1] ?? null;
}

/** The prefixed render key ("UW-021842968588232972923") for an Upwork job URL or path. */
export function upworkRenderKey(source: string): string | null {
  const id = upworkJobId(source);
  return id ? UPWORK_PREFIX + id : null;
}
