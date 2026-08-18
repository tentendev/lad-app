# Dogfood Report: 深空省省 — 產品擴充

| Field | Value |
|---|---|
| **Date** | 2026-08-19 |
| **App URL** | http://127.0.0.1:4173 and isolated production rebuilds on loopback |
| **Session** | calcqa / calcshare2（隔離新分頁；專用 session 啟動逾時） |
| **Scope** | 排期加入規劃與行事曆、多活動預測與情境切換、資源進度、錢包洞察、五星追蹤、持久化、備份與 320/390px 響應式驗證 |

## Summary

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 1 |
| Medium | 0 |
| Low | 1 |
| **Total** | **2** |

## Issues

### ISSUE-001: 已結束的活動仍顯示「加入規劃」

| Field | Value |
|---|---|
| **Severity** | low |
| **Category** | ux |
| **URL** | http://127.0.0.1:4173/schedule |
| **Repro Video** | N/A（載入即可看見） |

**Description**

在 2026-08-19 開啟 8 月排期時，已於 8 月 14 日結束的「夏以晝月卡」仍提供「加入規劃」。規劃本身會把過期活動排除於未來資源扣款，但讓使用者先加入再看到「已結束」是沒有價值的死路。預期只有尚未結束的抽卡活動可加入規劃。

**Repro Steps**

1. 以 390×844 開啟 `/schedule` 並捲到 8 月排期清單。
2. 觀察「夏以晝月卡」顯示「已結束」，同一列仍有「加入規劃」。

瀏覽器暫存截圖：`/Users/ekc-m5max/.agent-browser/tmp/screenshots/screenshot-1787080336890.png`

---

### Resolution notes

- ISSUE-001 accepted: only pull events whose end date is today or later now expose 「加入規劃」 on Web and native.
- The manual goal form no longer defaults its deadline to today; a deliberate valid date is required. Schedule handoff still pre-fills the event deadline.

### ISSUE-002: 五星紀錄重新整理後無法載入

| Field | Value |
|---|---|
| **Severity** | high |
| **Category** | functional |
| **URL** | http://127.0.0.1:4173/tracker |

**Description**

新增五星紀錄後，畫面與統計都正確更新，但重新整理會進入寫入保護並顯示空清單。實際 `lad_wish_tracker` 原始資料仍在，問題是資料驗證器錯把使用時間戳產生的 record ID 套用 999 上限。預期合法的正整數 ID 可重新載入，抽數才受 1–999 範圍限制。

**Repro Steps**

1. 在 `/tracker` 新增一筆五星紀錄。
2. 確認統計與歷史出現該筆資料。
3. 重新整理頁面；紀錄消失並顯示資料格式異常。

**Resolution**

- ID 改用獨立的正安全整數驗證，不再套用抽數上限。
- 新增真實毫秒時間戳 ID 的儲存／重載回歸測試。

## Additional verified journeys

- Wallet: inserted prior/current month records, verified the exact month-over-month delta, month-end projection, category share, six-month bars, and reload persistence at 390px.
- Tracker: added a record, reloaded, recovered the timestamp-ID record, edited 63 to 62 pulls, and confirmed independent pity counts and current guarantee copy.
- Resource check-ins: created two dates, updated the same date without duplication, verified equivalent-diamond change and one-click calculator application, then reloaded.
- Scenario comparison: loaded legacy goals without an `enabled` field, confirmed automatic migration, paused the first goal, and observed the second goal shortfall change from 1,438 to 88 diamonds; the toggle survived reload.
- Calendar export: downloaded `exported-event.ics` from the production Web build and inspected CRLF formatting, stable UID, `text/calendar` content, and the exclusive multi-day end date.
- Accessibility/responsive: schedule and tracker report zero axe WCAG A/AA violations; calculator, schedule, wallet, and tracker remain within their 390px viewport without horizontal overflow. Axe marks nav contrast as incomplete because a pseudo-element prevents automated background-color resolution.
- Tracker quick count: used `+1` then `+10`, reloaded, and observed the limited line persist at 11. At 390px the revised single-column cards expose two 152×44px quick actions per line without horizontal overflow.
- Wallet CSV: downloaded a BOM-prefixed CSV with the expected stable header and date-sorted rows; Planner share produced the exact deterministic Traditional Chinese summary and announced completion.
- PWA offline: activated cache `deep-space-ledger-6da82efde082`, switched Chromium offline, and loaded `/tracker` with the persisted pity count and navigation shell intact.
- UI audit follow-up: at 320/390/520/1024px all four primary screens remain within the viewport. Wallet, Schedule, Calculator, and Tracker each report zero axe violations. Invalid Wallet, Tracker, and Planner submissions move focus to the invalid field and expose the associated error through `aria-describedby`.
- Guarantee correction: selected a manual limited guarantee, reloaded it, added a known UP result, and verified that the override returned to automatic while the effective status changed to non-guaranteed.
- Per-event shortfall: the October mixed goal converts an 88-diamond deficit into NT$15 / 1 pull / tier one without applying official tickets twice; its action opens Wallet with amount, category, and contextual note prefilled, then consumes the one-time handoff.
- Tracker target chain: a non-guaranteed 0-pity limited line produced 140 pulls in Calculator; the rerun line produced 140 pulls and selected the rerun pool. The Calculator target then populated 140 pulls and the rerun pool in Planner while focusing the goal title.
- Pace assessment: current check-ins produce +275 equivalent diamonds/day. The first display used the goal's +2/day extra-over-plan figure; the corrected display below compares it with the full 100/day resource-growth requirement.
- Final accessibility: fresh Lighthouse JSON for Calculator and Tracker records 1.00 with no failed audits after fixing the new low-contrast tracker detail labels and the shared account-link accessible name.
- Schedule preference: removed 沈星回 from the lead filter, reloaded `/schedule`, and verified both `aria-pressed="false"` and the normalized four-lead `lad_schedule_preferences` payload. The 390px document has zero horizontal overflow.
- Tracker analysis range: selected 常駐池 and observed zero records / em-dash averages with the line-specific empty state; the history list and CSV source used the same filtered collection. The 320px document has zero horizontal overflow.
- Whole-plan status: the same two-goal scenario now reports `全程差 88 鑽` even though later income can change the final balance. The check-in panel compares observed +275 diamonds/day with the total 100/day the plan needs, rather than the former extra-only 2/day value.
- Schedule deduplication: injected a second handoff with source key `qa`; Calculator kept exactly two stored goals, opened the original 50-pull target in edit mode, announced the reuse, and removed the pending payload.
- Wallet category range: selected 抽卡禮包 and observed one matching row, one-record count, scoped CSV availability, and zero overflow at 320px.
- Initial mobile performance: Lighthouse Schedule scored 0.59 (FCP 1.1s, LCP 7.3s, TBT 660ms, CLS 0.001). That receipt exposed shared Expo/React, Clerk, and internal Debug JavaScript; the final production-gated measurement below supersedes this baseline.
- Overflow purchase ceiling: a 667-pull rerun target states that one store cycle covers 306 pulls for NT$11,450 and leaves 361 pulls; the 320px Calculator remains within its viewport and axe reports zero violations.
- Wallet budget pace: with a NT$1,000 budget and NT$800 already spent, the current-month card reports NT$15/day of flexible spend and a NT$305 projected overage across the remaining 13 days. The 320px page has zero overflow and zero axe violations.
- Bulk Schedule calendar: the lead-filtered August production view exported one 1,513-byte calendar with six VEVENTs, six UIDs, 54 CRLF pairs, no lone LF, and a valid terminator. The ended-event badge contrast regression exposed by this state was corrected; the stable page reports zero axe violations.
- Tracker correction: +10, +1, then −1 persisted as 10 after reload. At 320px each quick action is 76×44px and the page reports zero axe violations.
- Expanded UI matrix: Wallet, Schedule, Calculator, and Tracker each have zero horizontal overflow at 320, 390, 520, and 1024px. Runtime inspection found no sub-44px primary control after raising footer links, the budget disclosure, and pity inputs.
- Unsafe monetary input: Web rejected `1e100`, focused `wallet-expense-amount`, set `aria-invalid=true`, displayed the safe-range error, and left the stored expense collection unchanged. Shared JSON/cloud and native paths use the same upper bound.
- Month return actions: Schedule moved September back to August and Wallet moved July back to August using context-only 44px controls; both stayed within 320px and reported zero axe violations. Wallet's year/month label remains one line.
- Production chrome: the internal Debug launcher no longer renders in production, so Wallet's previous-month button passes a real pointer click instead of being covered. The route artifact shrank and `verify:web` now rejects a future production build that renders the launcher.
- Release-candidate performance before the final offline-auth fix: desktop Lighthouse was 0.99/1.00 performance/accessibility (0.29s FCP, 0.94s LCP, 31ms TBT, 0.0002 CLS). Simulated mobile was 0.72/1.00 (1.1s FCP, 5.16s LCP, 391ms TBT, 0.001 CLS); its trace observed LCP at 92ms, while late repeat simulation ranged 0.63–0.72.
- Release-candidate offline proof: an uncached probe failed with `TypeError`, but `/tracker` loaded from `deep-space-ledger-fc0985736a97` with the persisted count 10 in both storage and the visible input, and no Debug launcher.
- Release-candidate gates: `npm run release:web` passed 102 tests, Doctor 21/21, dependency audit, 17 routes, 29 precached bundles, 22 release-file checks, and the 5.4 MiB `fc0985736a97` artifact. `npm run release:ios:validate` passed the same source gates, exported an 8.3 MiB Hermes bundle, and completed the unsigned build preflight without starting a build or submission.
- Backup round trip: the production About screen first downloaded a 1,963-byte version-3 JSON backup. Tracker was deliberately changed from 10 to 99, the downloaded file was selected and confirmed, the screen announced `備份已還原`, and a fresh Tracker navigation read 10 again. That pre-extension artifact is retained as `final-browser-backup.json`.
- Final version-4 preference continuity: build `904d0feed540` downloaded a 2,106-byte backup containing exactly the active four-lead Schedule preference. Storage was deliberately changed to only 沈星回; importing the v4 file disclosed the preference overwrite and restored 黎深、祁煜、秦徹、夏以晝. Legacy v1–v3/cloud payload tests prove a missing field preserves the destination's current preference. A post-change About scan reports zero axe violations.
- Unsafe cloud revision: exact non-negative safe integers remain valid, while negative, fractional, string and `1e100` values are rejected by the shared client/server boundary before a request or bigint comparison.
- Animation-time contrast: an immediate scan caught seven Schedule strips at only 1.64–1.94 contrast during the former opacity tween. The transform-only GSAP revision preserves motion and now returns zero violations both immediately and after settling; the final 320px page also has zero overflow.
- Reduced motion: with `prefers-reduced-motion: reduce`, Schedule produced zero GSAP opacity/transform/visibility inline styles, kept activity opacity at 1, had zero overflow, and returned zero axe violations.
- Offline backup round trip: while Chromium was offline, the cached About page exported a valid v4 JSON with Tracker count 10 and all six allowed data domains. Tracker was changed to 99, then the real file input restored the offline artifact to 10 and announced completion without a network request.
- Static delivery integrity: 22 HTML files contain 311 internal href/src references across 29 unique targets with no broken target. Both manifest icons and all four PWA shortcuts resolve; the final 83-file artifact contains no server environment names, database URL, private key, source map, or `.env` file.
- Corrupt-storage repair: production local storage was set to the literal `{broken-json`. Normal backup creation surfaced the expected corruption message, a 506-byte raw rescue file preserved the malformed string exactly, and importing a healthy v4 backup restored Tracker to 10. The repository now snapshots raw strings so rollback can also preserve corruption byte-for-byte if a later write fails.
- Combined final recovery: on `fc0985736a97`, an uncached fetch failed with `TypeError`, the cached About page remained active, `lad_wish_tracker` was replaced with malformed JSON, and the real offline file input still restored the healthy v4 artifact to count 10.
- Keyboard traversal: all 58 focusable Schedule targets at 320px remained visible. The 54 content/action targets did not overlap the fixed tab bar; the last four targets were the tab-bar links themselves.
- Offline account truthfulness: Email/password and Google SSO were invoked with `navigator.onLine=false` and network emulation offline. Both stayed on `/account` and rendered `目前處於離線狀態。請連上網路後再登入或驗證；本機功能仍可繼續使用。` instead of reporting extra verification. A cached cold route that initially reproduced indefinite Clerk loading switched to the dedicated offline card in 200ms, scored axe 0, and returned to the login form after network recovery triggered one reload.
- Final route matrix: `/`, Calculator, Schedule, Tracker, Wallet, Account, About, Privacy, and Support were each scanned at 320×740 on `ae48e6ce2e29`; all nine report zero axe violations, zero horizontal overflow, and no production Debug launcher.
- Final releases: Web passed 18 test files / 104 tests, Doctor 21/21, dependency audit, 17 routes, 29 precached bundles, 22 release-file checks, and a 5.5 MiB artifact. iOS passed the same source gates, exported an 8.3 MiB Hermes bundle, and completed unsigned preflight without starting build or submission.
- Final performance on `ae48e6ce2e29`: desktop Lighthouse 0.99 performance / 1.00 accessibility (0.29s FCP, 0.95s LCP, 47ms TBT, 0.0002 CLS); simulated mobile 0.70 / 1.00 (1.05s FCP, 5.18s LCP, 452ms TBT, 0.001 CLS).
- Exact-final combined recovery: cache `deep-space-ledger-ae48e6ce2e29` rejected `/uncached-final-ae48` with `TypeError`; cached About then replaced literal `{broken-json` through the real v4 file input, announced `備份已還原`, and retained Tracker count 10.
- Exact-final portable export: cached About downloaded a 709-byte version-4 JSON containing all six allowed data domains, Tracker count 10, and all five normalized Schedule leads while network emulation remained offline.
- Exact-final cache inventory: `deep-space-ledger-ae48e6ce2e29` held 44 responses and all 12 required app-shell routes/assets. After clearing all caches and visiting only Schedule, Account was already present; its first offline navigation rendered the correct Account title and local-first state with axe 0 instead of falling back to Schedule.
- Loaded-form connectivity transition: a filled Email and 20-character password survived offline and online events byte-for-byte. Offline added the local-first card, disabled submission, retained the form, had zero axe violations/overflow, then reconnect removed the card and re-enabled submission without a reload.

## Visual evidence

- `screenshots/screenshot-1787080387159.png` — corrected schedule actions.
- `calculator-checkin-viewport-390.png` — revised resource check-in layout and three-column status strip.
- `exported-event.ics` — browser-downloaded calendar artifact.
- `ui-audit/screenshots/tracker-390-after.png` — single-column Tracker layout with 44px quick actions.
- `ui-audit/final.json` — 24-rule audit receipt with `READY` verdict.
- `planner-gap-390.png` — per-event pack estimate in the forecast card.
- `tracker-target-handoff-390.png` — tracker 70/140 targets and handoff actions.
- `planner-pace-390.png` — observed-vs-required pace in the check-in workflow.
- `lighthouse-calculator-final.json` / `lighthouse-tracker-final.json` — final accessibility 1.00 receipts.
- `schedule-filter-persist-390.png` — the retained four-lead Schedule filter after reload.
- `tracker-filter-320.png` — final 320px Tracker layout used for the range-filter overflow check.
- `planner-total-pace-390.png` / `planner-total-pace-checkin-390.png` — peak whole-plan gap and corrected total daily pace.
- `planner-dedup-320.png` — repeated Schedule handoff opening the original Planner goal.
- `wallet-filter-320.png` — category-scoped Wallet history and export at the narrowest audited width.
- `lighthouse-schedule-performance.json` — production Lighthouse performance receipt and framework/auth follow-up evidence.
- `calculator-overflow-320.png` — actionable partial-cycle recommendation at the narrowest width.
- `wallet-pace-320.png` — daily flexible spend and projected variance in the Wallet insight hierarchy.
- `schedule-bulk-export-320.png` / `schedule-visible-2026-08.ics` — scoped bulk export action and downloaded six-event artifact.
- `tracker-adjustment-320.png` — three-way quick correction controls at 44px target height.
- `lighthouse-schedule-final.json` / `lighthouse-schedule-mobile-final.json` — final desktop and comparable simulated-mobile performance/accessibility receipts.
- `a11y-wallet-return-month.json` / `a11y-schedule-return-month.json` — context-only month-return actions with zero WCAG A/AA violations.
- `final-browser-backup.json` — browser-downloaded pre-extension v3 backup used for the 10 → 99 → 10 transactional restore proof.
- `final-browser-backup-v4.json` — final browser-downloaded v4 backup used for the one-lead → four-lead Schedule preference restore proof.
- `final-browser-backup-v4-904d.json` — final-build v4 export after adding explicit overwrite disclosure.
- `final-browser-backup-v4-4a3b.json` — final-artifact v4 schema export, including all five default leads in a fresh profile.
- `lighthouse-schedule-desktop-fc09.json` / `lighthouse-schedule-mobile-fc09.json` — earlier release-candidate desktop/mobile performance and accessibility receipts.
- `offline-backup-v4-4a3b.json` — backup exported and transactionally restored while Chromium was offline.
- `corrupt-raw-recovery-fc09.json` — raw rescue artifact that preserves the deliberately malformed wish-tracker string.
- `lighthouse-schedule-desktop-ae48.json` / `lighthouse-schedule-mobile-ae48.json` — final release-candidate desktop/mobile performance and accessibility receipts.
- `ui-audit/a11y-final-ae48.json` — final nine-route, offline-auth lifecycle, motion, and keyboard verification summary.
- `ui-audit/screenshots/account-offline-320-final.png` — final cached Account offline state at 320×740, with the local-first explanation fully visible and no overflow or fixed-navigation collision.
- `final-browser-backup-v4-ae48.json` — exact-final offline JSON export with the full v4 schema and normalized Schedule preference.
