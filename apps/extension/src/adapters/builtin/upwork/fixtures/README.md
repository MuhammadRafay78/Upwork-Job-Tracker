# Upwork fixtures needed

`web.ts` currently discovers cards structurally (via `a[href*="~"]`) instead of by classname, because Upwork's React SPA ships hashed/rotating classnames the same way LinkedIn's SDUI layouts do (see `builtin/linkedin/web.ts`'s `SEL` table and its multi-layout handling for what that eventually looks like once pinned down). That keeps the scaffold from breaking immediately, but it also means rich fields — budget, client rating/spend/location, skills, proposal count, connects required, job description — aren't captured yet.

To harden this the way LinkedIn's adapter is (`fixtures/*.html` + `*.fixture.test.ts` asserting against saved markup), we need real captured HTML from a **logged-in** Upwork session:

1. **Search/browse results page** — `https://www.upwork.com/nx/search/jobs/…` with at least 3-4 job cards visible. Save via DevTools → right-click the results container → "Copy → Copy outerHTML" (preferred over "View Source", which won't show the SPA's rendered DOM).
2. **A single job's detail page** — same capture method, for the full posting view (title, budget, client sidebar, description, skills, proposals).
3. Ideally one **saved/my-jobs or proposals view** too, if we want that surface tracked (mirrors how LinkedIn's adapter separately handles the `/jobs-tracker` "Applied" wall).

Please scrub any personally-identifying info (client names/emails you'd rather not commit) before handing the HTML over, the same way you would before opening an issue upstream with a repro.

Once we have that, `web.ts` gets a real `SEL` table (like LinkedIn's) plus `*.fixture.test.ts` coverage, and `findCards`/`capture` stop being structure-only guesses.
