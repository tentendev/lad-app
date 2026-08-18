# Comparable-product research

Recorded: `2026-08-19 CST`

## Selection method

The comparison set favors active, feature-rich companion tools that solve the same jobs as 深空省省: tracking pulls, turning resources into a target, planning across future events, and preserving personal data. “Leading” here means a mature breadth of relevant workflows or a direct Love and Deepspace specialization; it is not a claim about revenue or absolute market rank.

## Current product patterns

| Product | Current evidence | Relevant pattern | Decision for 深空省省 |
|---|---|---|---|
| [Paimon.moe](https://paimon.moe/) | Current home exposes wish counter, calculators, todo list, reminders, calendar, rerun timeline, and data settings. Its [Wish Counter](https://paimon.moe/wish) tracks lifetime pulls and pity per banner and warns that browser data needs backup/sync. | One companion connects calculators, future timing, history, progress, and backup rather than leaving isolated tools. | Adopt connected workflows and explicit data continuity. Manual wish history is a follow-up; no game credential collection in this wave. |
| [Star Rail Station](https://starrailstation.com/en) | Current navigation centers Warp Tracker, Ascension Planner, and Achievements. | Separate “tracker” and “planner” jobs, both based on persistent targets. | Adopt a persistent planner object. Achievement/catalog expansion is outside the app's current spending-control job. |
| [Genshin Center](https://www.genshin-center.com/) | Current product describes customizable current-to-target planning and aggregated requirements. | Users define several targets and see one combined requirement instead of recalculating each item independently. | Adopt a list of event goals and one chronological resource forecast. |
| [Love and Deepspace Wish Tracker](https://lads.moe/) | Direct same-game product currently advertises wish tracking, memory collection, pity counters, statistics, and JSON/CSV data controls in [Settings](https://lads.moe/settings). | Same-game users value pity visibility, collection filtering, statistics, and portable history. | Adopt manual pity/history plus an explicit tracker-to-calculator target handoff. Reject auth-token import for now because it expands credential/security risk and is not needed for the planning moat. |
| [Love and Deepspace Wish Budget](https://www.reddit.com/r/LoveAndDeepspace/comments/1oy0wkz/wish_budgeting_pull_planning_event_forecasting/) | The maintained same-game planner describes monthly cost estimates, projected diamond balance across events, LI toggles, start/end dates, daily resource pace, affordability warnings, and per-event pack comparisons. | The key decision is not a single “how much does this banner cost?” result; it is “which future banners can my current resources and monthly income survive?” | Adopt now: multi-event goals, monthly diamond income, chronological projected balance, calm shortfall warning, and schedule-to-plan handoff. |
| [Official limited-pool rules](https://loveanddeepspace.infoldgames.com/en-EN/news/17) and [official rerun rules](https://loveanddeepspace.infoldgames.com/en-EN/news/18) | Current official rules state that Limited Wish Pools share their pity line and Rerun Wish Pools share a separate pity line; obtaining a non-event 5-star makes the next 5-star on that line event-limited. The current same-game community references consistently document a 70-wish five-star ceiling. | A useful manual tracker must keep new limited and rerun counts separate, derive the next-UP guarantee from the latest marked result, and stay conservative when history is incomplete. | Adopt separate counters, manual guarantee correction, a 70-wish disclosed estimate, and worst-case two-round target when guarantee is unknown. Do not attempt Precise Wish modeling in this wave. |

## Ranked feature decisions

1. **Accepted now — structured multi-event pull plan.** This is supported by the direct same-game budgeting workflow, the mature planner pattern, and the repository's original product direction that names the structured plan object as the moat.
2. **Accepted now — schedule-to-plan handoff.** Re-entering an event name, pool type, and deadline is avoidable discontinuity between two existing functions.
3. **Accepted now — backup/cloud continuity for plans.** A planning feature that disappears from exported or cloud snapshots would violate the current local-first trust contract.
4. **Accepted after the planner — manual wish/pity history with CSV export.** The implemented tracker keeps official pity lines separate, derives next-UP guarantee only from the latest applicable marked record, and never requests a game token.
5. **Accepted after the planner — resource progress check-ins.** The same-game budget pattern explicitly calls for daily resource pace. Check-ins make the forecast correctable over time and can reapply the latest actual balance to the calculator.
6. **Accepted supporting optimization — wallet insight and recurring budget continuity.** Category share, six-month trend, prior-month comparison, month-end projection, and copying the prior budget turn the existing ledger into an actionable feedback loop.
7. **Rejected for this run — game authorization-token import.** It introduces a sensitive credential workflow, expiry handling, game-server coupling, and new disclosure requirements. Manual entry preserves the value without that risk.
8. **Deferred — collection database and achievement checklist.** These are successful companion-tool patterns but do not improve the app's primary pull-planning and spending-control outcome as directly as forecasting.
9. **Accepted supporting portability — schedule calendar export.** Mature companion calendars reduce reminder re-entry. Standard `.ics` keeps the feature provider-neutral and avoids requesting calendar permissions on Web; native shares the same portable event file.
10. **Accepted after runtime comparison — per-event pack shortfall.** Each short goal now exposes a pack-tier/cost estimate that starts from its already-calculated deficit, avoiding a second application of free-ticket rewards. The estimate can be handed to Wallet and is explicitly independent of earlier goal estimates.
11. **Accepted connected workflow — tracker target handoff.** The manual counter now provides a disclosed next-five-star and conservative event-five-star target, preserves separate limited/rerun lines, and hands the target through Calculator into the Planner form without collecting credentials.
12. **Accepted observed-vs-required pace.** Resource check-ins now compare actual equivalent-diamond growth per day with the next short goal's required pace instead of showing a historical delta without a decision.
13. **Accepted retained filters and scoped statistics.** The same-game references make lead toggles and collection filtering part of repeated planning work. Schedule now remembers lead visibility, while Tracker can isolate statistics, history, and export to one official pity line.
14. **Accepted native local recovery parity.** Comparable tools emphasize backup because browser/device-local history is fragile. The native app now offers the same portable JSON lifecycle and a raw recovery escape hatch as Web, without requiring sign-in or cloud upload.
15. **Accepted actionable purchase ceilings.** A limited store cycle is still useful when it cannot close the full gap. Recommendations now disclose the maximum purchasable pulls/cost and the exact unresolved remainder instead of treating the whole result as unavailable.
16. **Accepted budget pace, not projection alone.** A month-end estimate becomes a decision only when users can see the remaining daily flexible amount and projected variance. The calculation excludes historical months and accounts for already-entered future commitments.
17. **Accepted scoped bulk calendar export.** Mature calendar workflows should not require one download per row. The app now packages the current lead-filtered month or selected day into one portable calendar on both platforms.

## Functional acceptance for the selected wave

- Create, edit, reorder chronologically, and remove more than one event goal.
- Use current diamonds/tickets once, then add configurable monthly diamond income up to each event deadline.
- Account for event-specific official free tickets without letting one resource fund two goals.
- Show projected balance or shortfall after every goal and a calm daily-saving pace when short.
- Add a schedule event to the planner without retyping its title, type, or date.
- Preserve plans in local storage, JSON backup/restore, raw recovery, and Clerk/Neon private snapshots.
- Preserve the visual language while adding one clearly labeled tracker tab for the independent pity/history job.
- Record, update by date, remove, restore, and reapply resource check-ins without double-counting a day.
- Keep limited-new, rerun, and permanent pity lines separate; provide edit/delete/undo, statistics, and CSV portability without collecting game credentials.
- Summarize ledger category share, prior-month change, recent trend, and current-month projection from existing local data.
- Pause and resume goals for side-by-side planning scenarios without deleting their details.
- Export schedule entries as portable all-day calendar events on Web and native.
