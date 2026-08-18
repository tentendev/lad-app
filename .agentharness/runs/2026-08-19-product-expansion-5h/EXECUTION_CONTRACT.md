# AgentHarness execution contract

- Run: `2026-08-19-product-expansion-5h`
- Started: `2026-08-19 02:56:39 CST`
- Timebox ends: `2026-08-19 07:56:39 CST`
- Completed: `2026-08-19 07:56:55 CST` (timebox plus 16-second closeout verification)
- Status: `complete` — 30 fixed findings, 2 explicit P3 deferrals, 0 unresolved P1/P2 findings.
- Primary target: expand and improve the product's useful functions by comparing the current app with leading gacha planning, wish-history, and budget-forecasting tools; begin UI/UX work only after the functional queue is exhausted or verified.
- Mutation scope: local source, tests, documentation, and verification artifacts in this repository.
- Excluded without separate authorization: commit, push, deploy, production configuration, credentials, paid services, App Store actions, or publication.

## Authority order

1. The user's five-hour feature-first request and FIFO task policy.
2. Current repository handoffs, product decisions, and design system.
3. Current source, tests, and runtime evidence.
4. Fresh primary product pages and current competitor interfaces used as research evidence.
5. Legacy app files only as behavior and visual baselines.

## Product-improvement definition

The run is successful only when it leaves verified product improvements, not merely an audit. Candidate features must:

- support the app's core job of planning pulls, resources, events, or discretionary spending;
- be grounded in a demonstrated user workflow or a leading comparable product pattern;
- preserve local-first data safety and the existing cloud snapshot contract;
- work across Web and native renderers when the underlying workflow is shared;
- include focused domain or persistence regression tests;
- pass the relevant interaction smoke test and the complete local release gates before closeout.

Feature work has priority over UI/UX. UI/UX work begins only after the selected feature wave is functional and regression-tested.

## Five-hour cadence

| Window | Work | Exit evidence |
|---|---|---|
| 00:00-00:35 | Rules, handoffs, dirty-worktree map, baseline gates, product inventory | Baseline receipt and ranked queue |
| 00:35-01:15 | Current competitor research and feature-gap validation | Source-linked research matrix and accepted/rejected candidates |
| 01:15-03:15 | Feature wave 1: highest-value planning workflow | Focused tests and browser/native parity evidence |
| 03:15-04:05 | Feature wave 2: supporting workflow, persistence, backup/cloud continuity | Focused tests and migration evidence |
| 04:05-04:40 | UI/UX pass on the newly expanded workflow | Mobile/desktop interaction and accessibility evidence |
| 04:40-05:00 | Full regression, export/runtime checks, receipt and ledger audit | Final gates and requirement-by-requirement closeout |

If a cycle exposes a correctness or data-safety defect, that defect takes priority over the cadence. A source change invalidates earlier build evidence and requires fresh verification.

## Closeout

- Final Web artifact: `ae48e6ce2e29`.
- Web and iOS release gates pass against the same final source; no deployment, signed build, submission, commit, or push was started.
- Final artifact checksums, route/UI receipts, competitor research, dogfood, and the owner/external handoff are linked from `FINAL_REPORT.md`.
