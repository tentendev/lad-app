# AgentHarness execution contract

- Run: `2026-08-14-web-launch-3h`
- Started: `2026-08-14 01:34:47 CST`
- Timebox ends: `2026-08-14 04:34:47 CST`
- Primary target: make the Expo Web app locally release-ready; preserve the shared domain and native renderers so the next phase can package iOS without a rewrite.
- Mutation scope: local source, tests, documentation, and verification artifacts in this repository.
- Excluded without separate authorization: commit, push, deploy, hosted configuration, production credentials, paid services, App Store submission, and legal approval.

## Authority order

1. User-provided task queue and blog routing policy (no blog work is in scope).
2. Architecture decision and PRD under `references/08-13/`.
3. `references/08-13/claude-code-one-shot-shenkong.md` for product invariants and phase gates.
4. Current source and runtime evidence.
5. Legacy `index.html`, `packs.js`, and `schedule.js` only as behavior/data baselines.

## Production-readiness definition for this run

This run may call the local Web MVP release-ready only when all of the following are evidenced:

- the core flow works by interaction: budget -> expense -> calculator -> package recommendation -> wallet handoff;
- refresh persistence and legacy local data compatibility work;
- invalid or empty input cannot create misleading spending records;
- changed behavior has focused regression tests;
- lint, strict typecheck, unit tests, Expo Doctor, and static Web export pass;
- exported routes serve and render without console errors at desktop and mobile widths;
- public metadata, product wording, privacy/IP boundaries, and data-trust disclosures meet the repository decisions;
- every remaining requirement is classified as fixed, rejected, externally blocked, or explicitly deferred to a later product phase.

A green build alone is insufficient. Supabase sync, public Plan sharing, Cloudflare OG rendering, production deployment, and App Store submission remain separate gates unless implemented and verified with their required external systems.

## Three-hour cadence

| Window | Work | Exit evidence |
|---|---|---|
| 00:00-00:25 | Contract, dirty-worktree map, source and baseline gates | Baseline receipt and ranked issue queue |
| 00:25-01:05 | Browser dogfood of all three tabs and core journey | Reproducible findings with screenshots/video where applicable |
| 01:05-02:10 | Fix wave 1: data loss, correctness, broken workflows, trust blockers | Focused tests plus affected browser flows |
| 02:10-02:45 | Fix wave 2: responsive, accessibility, metadata, recovery UX | Desktop/mobile screenshots and accessibility checks |
| 02:45-03:00 | Full regression, static export serve check, receipt audit, handoff | Final gates and requirement-by-requirement ledger |

If a scheduled audit cycle finds a source change is required, fix it and begin a fresh verified cycle; do not preserve a stale source fingerprint merely to finish a timer.
