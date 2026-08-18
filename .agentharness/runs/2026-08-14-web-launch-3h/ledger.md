# AgentHarness ledger

## Baseline

| Time (CST) | Evidence | Result |
|---|---|---|
| 01:34 | Dirty worktree map | Expo rewrite is currently untracked; `.gitignore` is modified. Preserve all existing work. |
| 01:34 | `npm run check` | Pass: ESLint, strict TypeScript, 3 test files / 11 tests. |
| 01:34 | `npm run doctor` | Pass: 20/20 Expo checks. |
| 01:34 | `npm run export:web` | Pass: 10 static routes; Web JS bundle reported at 6.3 MB. |

## Ranked queue

Status values: `candidate`, `verified`, `fixed`, `rejected`, `deferred`, `blocked`.

| ID | Priority | Status | Candidate / finding | Acceptance evidence |
|---|---:|---|---|---|
| AH-001 | P0 | fixed | Complete and persist the budget -> expense -> calculator -> wallet handoff journey in a real browser. | Browser replay before/after refresh. |
| AH-002 | P0 | fixed | Empty expense submission fails silently with no inline or announced recovery guidance (ISSUE-001). Storage failure handling remains to be checked. | Focused tests and browser error recovery. |
| AH-003 | P1 | fixed | Confirm legacy `lad_*` localStorage migration and calculator semantics against authoritative examples. | Migration regression tests and worked examples. |
| AH-004 | P1 | fixed | Make schedule provenance/status trustworthy enough for public use. | Per-event status/provenance and stale-data disclosure. |
| AH-005 | P1 | fixed | Verify all routes, mobile layout, keyboard flow, labels, focus, and console health. | Desktop/mobile QA receipts and accessibility audit. |
| AH-006 | P1 | fixed | Add release metadata and an IP/privacy/about surface consistent with the product decisions. | Exported HTML and routed-page verification. |
| AH-007 | P2 | fixed | Reduce avoidable Web payload and remove duplicate/unintended routes if safely actionable. | Export manifest comparison and route smoke test. |
| AH-010 | P1 | fixed | Expo Web visually diverges from the user-designated original: 1120px two-column near-black UI versus the original 520px lavender glass single-column app; calendar event bars, lead filters, serif month display, original background, and full-width bottom nav are missing. | Reference/current before screenshots plus computed-style receipt; fix requires UI parity screenshots at desktop and mobile widths. |
| AH-008 | P2 | deferred | Supabase anonymous auth/sync and `public_plans` view. | Requires implementation plus hosted Supabase credentials and RLS verification; continue local work first. |
| AH-009 | P2 | deferred | Public Plan object, share Worker, dynamic OG cards. | Separate Phase 2 product gate; not proven by local calculator parity. |
| AH-011 | P2 | deferred | `npm audit --omit=dev` reports 17 high and 8 moderate dependency-path findings, with no critical issue. | The two root advisories are `image-size` denial-of-service paths used by Metro for trusted repository images and an old `uuid` bounds check reached through Xcode tooling. npm's proposed fixes require breaking Expo/Reanimated changes (including an Expo downgrade), so recheck when compatible upstream patches ship. |
| AH-012 | P0 | fixed | The release had no verified Vercel project target or Build Output API artifact, so a future deploy could hit the wrong project or rebuild a different fingerprint. | Exact `tentenco/lad-pocket` link, 63-file prebuilt equality verifier, target preflight, and post-deploy verifier. |
| AH-013 | P1 | fixed | iOS handoff had no committed EAS profiles or preflight to reject Expo's anonymous bundle identifier fallback. | Official-schema-valid `eas.json` plus blocking bundle/privacy/version preflight. |

## Cycles

### Cycle 1 - discover and reproduce

- User designated `https://lad-pocket.vercel.app/` and the supplied 1042px reference screenshot as the visual authority.
- Reference measurements at a 1280px viewport: app/nav max width 520px; card `rgba(56, 42, 96, .40)`, `1px solid rgba(255,255,255,.55)`, 20px radius, 16px blur; body uses `LAD bg.png` over a lavender gradient.
- Reference lead accents: 沈星回 `#a78bfa`, 黎深 `#59b8ff`, 祁煜 `#ff88bf`, 秦徹 `#ff6675`, 夏以晝 `#ffad5c`.
- Reference event accents: 周邊 `#49b8ff`, 日卡池 `#ff78b7`, 月卡池 `#9b8cff`, 混池 `#ffd166`, 生日池 `#ff9f68`, 復刻池 `#65d6c4`, 密約 `#ffd34d`.
- Local before screenshot proves the current app instead renders a near-black 1120px dashboard with dot-only calendar and floating pill navigation. AH-010 is verified.

### Cycle 2 - visual parity and core-flow fixes

- Rebuilt the Web shell as the original 520px lavender glass single-column layout, including the original background assets, fixed full-width bottom navigation, serif month heading, five lead filters, event color system, multi-week calendar bars, and matching August event names.
- Browser replay persisted a NT$3,000 budget, a NT$170 expense, a 40-pull calculator recommendation, and a NT$525 calculator-to-wallet handoff. A fresh route load restored NT$2,305 remaining and both expenses. Receipt: `screenshots/core-flow-refresh-pass.png`.
- Reproduced ISSUE-001 with a video and before screenshots, then added adjacent `role=alert` guidance. Receipt: `screenshots/issue-001-fixed.png`.
- Simulated `Storage.prototype.setItem` throwing `SecurityError`; the app preserved the form, did not claim success, and surfaced recoverable storage guidance.
- Increased page bottom clearance so the fixed navigation no longer covers the wallet submit button at maximum scroll.

### Cycle 3 - trust and accessibility

- Added persistent official-versus-predicted schedule disclosure and per-event status treatment.
- Added `/about` with the product positioning, non-affiliation/IP disclaimer, schedule provenance, local-only storage disclosure, and tracking policy.
- Added install metadata through `manifest.webmanifest` and mobile Web App meta tags.
- Ran axe WCAG 2 A/AA audits for `/wallet`, `/schedule`, `/calculator`, and `/about`: zero confirmed violations on every route. Any remaining `incomplete` result is a manual contrast review for layered background imagery/navigation.
- `npm run check` passes after the fix wave: ESLint, strict TypeScript, and 13/13 tests.

### Cycle 4 - release performance and resilience

- Added validated local JSON backup/restore for budgets, expenses, and calculator state. Browser tests proved download, confirmed restore, rejection of an unrelated JSON file, and preservation of existing data on rejection. Unit suite is now 15/15.
- Replaced blocking delete confirmation with persistent inline Undo and verified deletion plus restoration in storage.
- Enabled Expo Router production async routes and generated a build-specific precache manifest. Each export injects a unique cache version into `sw.js`, so deployments evict stale app bundles.
- Stopped the production server after install, then opened `/wallet`, `/calculator`, and `/about` successfully from the service worker cache. The cache included every hashed route chunk.
- Replaced 3.3 MB / 1.7 MB PNG delivery with visually matched 82 KB / 40 KB WebP assets, self-hosted the 38 KB Cormorant number font under its OFL license, and removed unused icon-font assets in favor of inline SVG.
- Changed HeroUI Web barrel imports to component imports and replaced the 431 KB global HeroUI stylesheet with the original-design skin plus minimal primitives. Web CSS is 29 KB; the full `dist` directory fell from 9.1 MB to 4.7 MB.
- Final mobile Lighthouse receipts for all four routes: Performance 97, Accessibility 100, Best Practices 100, SEO 100. Representative FCP is ~0.9 s and LCP ~1.8 s under Lighthouse throttling.
- Added per-route titles/descriptions, semantic navigation links, Open Graph metadata, install icons, Vercel security headers, a branded static 404, and a host-level root redirect.

### Cycle 5 - original-design lock and iOS handoff

- Rechecked the user-supplied original at the reference mobile width. Removed the added marketing header so the first functional card again starts at the top, and compressed all six lead filters onto one row at 364px while retaining larger native hit slop.
- Moved the original color system into shared native tokens and documented the immutable design rules in `docs/DESIGN_SYSTEM.md`.
- Rebuilt native schedule rendering with lead filters, eight activity colors, multi-week bars, dashed prediction treatment, glass cards, star background, and the original three-item bottom navigation.
- Aligned native wallet, calculator, About, and 404 surfaces; added native storage errors, date validation, delete Undo, and safe calculator-to-wallet navigation.
- Removed the LCP-critical 38 KB Web font download after an A/B Lighthouse run showed simulated LCP falling from 4.6 seconds to about 1.8 seconds without it. The replacement uses system Baskerville/Songti fallbacks and preserves the serif visual direction.
- Added a deterministic `release:web` gate and verified 11 release files, 20 hashed precache bundles, and a 4.5 MiB export.
- The final iOS Hermes export is 6.1 MiB. An isolated Expo prebuild generated the expected app icon, display name, version 1, privacy manifest (`tracking=false`, no collected data), and encryption declaration.
- The isolated prebuild also proved the remaining signing blocker: without owner input Expo falls back to `com.anonymous.deep-space-ledger`. A real bundle identifier, Apple Team, App Store Connect record, and Simulator runtime remain external handoff inputs; no placeholder was committed.

### Cycle 6 - transactional recovery and final release gate

- Made JSON restore transactional: if any storage write fails, all previously written keys roll back to their exact prior values. Unit tests and a browser-injected `QuotaExceededError` proved that partial restore cannot corrupt the existing wallet/calculator data.
- Hardened legacy and damaged local data normalization for budgets, expenses, calculator drafts, pending wallet handoff, date keys, and month keys. Invalid expense input now preserves the original data and shows recoverable guidance instead of silently accepting or deleting it.
- Added deterministic export checks for required routes, manifest fields, CSP inline-script hashes, service-worker build ID, every precached bundle, and a 7 MiB output ceiling. That cycle's `release:web` run passed 26/26 tests, 20/20 Expo Doctor checks, 11 static routes, 20 precached bundles, and a 4.5 MiB export.
- Added a privacy-led iOS launch screen using the original lavender `#7765a7` and a neutral white diamond mark. An isolated prebuild verified dark appearance, the exact background color, and 1x/2x/3x transparent splash assets; no game art or trademark was introduced.
- Replayed the production export at 390px and 320px. Schedule, wallet, and calculator all switched through async routes with zero page/console errors; each route reported document width equal to viewport width. Final visual receipt: `screenshots/schedule-390-release.png`.
- Refreshed `npm audit --omit=dev`: 0 critical, 17 high, 8 moderate dependency-path findings. The high count fans out from two `image-size` parser DoS advisories inside Metro's trusted build-input path; the remaining root advisory is `uuid` under Xcode tooling. No breaking forced fix was applied.
- A same-viewport comparison against the live original prevented an unnecessary calendar-density change and exposed the genuinely missing eighth legend category. Restored `主線分線` at the original `#66b5ff`, reclassified the September/November story events, and verified the September bars as dashed blue on the production export. Receipt: `screenshots/story-390-release.png`.

### Cycle 7 - original-detail parity and durable recovery

- Compared wallet and calculator against the live original at the same 390×844 viewport. Restored the original wallet order (summary with collapsible settings → add expense → monthly detail), kept calculator units horizontal, and added the restrained white-line section icons on Web and native renderers.
- Locked the original shell, five lead accents, eight activity labels/colors, and Web CSS variables into automated design contracts. Complete schedule dates/leads, lane visibility, every pack tier's cumulative pulls/cost, monotonic expense IDs, and non-finite calculator input are also validated. The suite now contains 8 files / 37 tests.
- Replayed the refactored production flow: NT$3,000 budget → NT$170 expense → 40-pull calculation → NT$525 wallet handoff → reload. The result remained NT$2,305 with both records and zero errors. Receipt: `screenshots/core-flow-original-order.png`.
- Latest Lighthouse accessibility audits are 100 on schedule, wallet, calculator, and About. Best Practices and SEO are also 100 on all four routes. A manual keyboard test caught and fixed the missing focus ring on the budget `<summary>`; Tab → Space → Tab now visibly enters the expanded fields.
- Changed malformed JSON handling from silent fallback to write-protected failure. Browser injection proved both wallet and calculator keep the exact malformed source; calculator remains usable for an unsaved estimate without overwriting the damaged key. Receipt: `screenshots/corrupt-json-protected.png`.
- Added a raw recovery download containing every `lad_*` storage value, including malformed strings. A browser download proved all five keys and both injected malformed strings were preserved; normal backup now validates data first and directs invalid data to the recovery path.
- Reverified the current service worker: 30 cached entries (four app pages and all 20 hashed bundles among them); wallet, calculator, and About each opened successfully with browser networking disabled.
- Proved clean-install reproducibility in an isolated `/tmp` copy: `npm ci` rebuilt 1,015 packages from the lockfile, then the full release gate passed 34/34 tests, 20/20 Doctor checks, 11 static routes, 20 precached bundles, and the 4.5 MiB size/design/security verifier.
- Promoted corrupt-wallet handling from a warning to actual write protection: when any stored collection cannot be parsed, budget/save/edit/delete actions are disabled until the user first exports the raw recovery copy and repairs or intentionally clears the data.

### Cycle 8 - immutable artifact audit

- The first final-artifact smoke caught calculator horizontal overflow at exactly 320px after the unit-switch parity change (`scrollWidth=332`). Added a narrow-only wrap rule: at 320px the reserve input occupies the full row and the 95px unit switch moves below/right; at 390px both remain on the original single row. Fresh measurements are 320/320 and 390/390.
- Reran the complete release gate after that fix. Final Web build ID is `b492826fe5d3`: 37/37 tests, 20/20 Doctor, 11 static routes, 20 precached bundles, 4.5 MiB, no verifier failures.
- Reran the native export after shared data and accessibility changes: iOS Hermes bundle passes at 6.1 MiB.
- Fresh-browser final smoke found one service-worker cache (`deep-space-ledger-b492826fe5d3`), no horizontal overflow on any of the four routes at 320px, current About privacy copy, and no console/page errors.
- Artifact hashes and final command receipts are recorded in `FINAL_RECEIPT.md`.
- Captured dedicated final 390px wallet and calculator receipts after the original-order refactor, so earlier iteration screenshots cannot be mistaken for the release UI.
- Repeated the final-build offline proof in a fresh isolated browser: one current cache with 30 entries; wallet, calculator, and About all opened with networking disabled. A fresh 320px calculator Lighthouse audit remained 100/100/100 for Accessibility, Best Practices, and SEO.

## Closeout

- The three-hour timebox ended at `2026-08-14 04:34:47 CST`; closeout was recorded five seconds later.
- No source or release-artifact changes occurred after build `b492826fe5d3`. Final SHA-256 values continued to match `FINAL_RECEIPT.md`.
- Final repeated gates: `npm run check` passed 8 files / 37 tests, Expo Doctor passed 20/20, `verify:web` passed, and the iOS Hermes bundle verifier passed at 6.1 MiB.
- The result is a locally release-ready Web artifact, not a deployed production site. Commit, push, deployment, domain verification, Apple signing, TestFlight, and App Store submission remained outside this run's authority or required owner credentials.

## Post-timebox continuation - deployment and iOS gates

- Confirmed authenticated Vercel access and linked only the gitignored local metadata to `tentenco/lad-pocket`; the similarly named `lad-app` project cannot pass the new target preflight.
- A Vercel-downloaded top-level OIDC file changed Expo's bundle fingerprint. Removed the file without reading or exposing its value, rebuilt cleanly, and recovered the exact final build `b492826fe5d3`.
- Ran `vercel build --yes --scope tentenco` without deploying. The generated Build Output API v3 artifact retains the 307 root redirect, branded 404, CSP/frame headers, service-worker revalidation, and immutable hashed assets. All 63 static files byte-match `dist/`.
- Added `verify:vercel-prebuilt`, `preflight:web-deploy`, and `verify:web-deployment`. The current original production URL intentionally fails the post-deploy verifier, which proves it has not silently been replaced by this release.
- Added official-schema-valid EAS profiles and `preflight:ios-build`. The positive remote EAS config path remains intentionally gated by the missing Expo login and owner-approved bundle identifier; no build, signing, submission, or paid service was started.
