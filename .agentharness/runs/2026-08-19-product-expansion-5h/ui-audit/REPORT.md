# UI audit — four primary product screens

Scope: Wallet, Schedule, Calculator/Planner, Wish Tracker, shared Web CSS, native counterparts, and tab navigation.

**Ship verdict: READY** — 0 release blockers, 0 fix-this-sprint findings, 0 backlog findings, 0 unknowns.

## Remediation completed during the audit

- Added a planner write mutex and pending labels so rapid submissions cannot overlap.
- Added layout-matching local-data skeletons on Web and native instead of flashing empty or zero-value dashboards.
- Associated form errors with their controls, moved focus back to invalid fields, and separated the native tracker's pity/create/edit error channels.
- Added a retry action to Web storage failures and status/alert live-region semantics to dynamic feedback.
- Raised mobile controls to 44px targets where space permits, changed pity cards to one column below 430px, and enforced 16px mobile input text.
- Added route and schedule-handoff focus management, semantic list/listitem roles, and reduced-motion-safe skeleton animation.
- Added a persisted Tracker correction action and kept all three quick controls at 44px on 320px screens.
- Raised footer links, the budget disclosure, pity inputs, account mode/recovery actions, policy links, and back navigation to 44px touch targets.
- Corrected the ended-event badge contrast exposed by the expanded Schedule fixture.

## Runtime evidence

- 320px, 390px, 520px, and 1024px: zero horizontal overflow on all four screens.
- 320px, 390px, and 520px: form inputs render at 16px; primary mobile controls render at 44px.
- 390px: Wallet, Schedule, Calculator, and Tracker each report zero axe violations. Image-backed color contrast remains axe-incomplete, not a reported violation.
- 320px: root, Wallet, Schedule, Calculator, Tracker, Account, About, Privacy, and Support each report zero stable-state axe violations.
- Account, About, Privacy, and Support also have zero horizontal overflow at 320px, 390px, and 1024px.
- Runtime target inspection at 320px reports no visible action below 44px across all eight audited routes; the hidden 1×1 backup file input is activated by a separate 44px control.
- Invalid Wallet, Tracker, and Planner submissions focus the matching invalid control and expose `aria-invalid` plus `aria-describedby`.
- Static-rendered Wallet, Calculator, and Tracker HTML contains the loading skeleton before device storage hydrates.

## Deferred to specialized checks

- Image-backed contrast: manual visual review in addition to axe.
- Native announcement order: VoiceOver/TalkBack device pass.

## Post-audit specialized check

- `agent-browser vitals` on the local production Schedule build: TTFB 4.1ms, FCP 84ms, LCP 84ms, CLS 0 in a warm local session.
- Final artifact Lighthouse desktop: performance 0.99, accessibility 1.00, FCP 0.29s, LCP 0.95s, TBT 47ms, CLS 0.0002.
- Final artifact simulated mobile: performance 0.70, accessibility 1.00, FCP 1.05s, LCP 5.18s, TBT 452ms, CLS 0.001. Comparable late simulations ranged 0.63–0.72; the remaining shared Expo/React/Clerk JavaScript requires separate auth/session architecture work.
- The final 320px production matrix has zero overflow and zero axe violations across nine public routes. Schedule also passes at the first animation frame after replacing its text-opacity tween with transform-only motion.
- With reduced motion enabled, Schedule creates no GSAP transform/opacity/visibility inline styles, retains opacity 1 for activity labels, and has zero axe violations.
- Full 320px Schedule keyboard traversal covered 58 focusable elements. Every one remained visible; none of the 54 non-navigation targets was obscured by the fixed tab bar, and the final four targets were the tab-bar links themselves.
- Calendar dates remain individually tabbable. Roving arrow-key focus is a documented P3 follow-up because it needs calendar- and native-screen-reader-specific interaction coverage.
- The final cached Account offline card fits entirely within 320×740, keeps its local-first recovery message above the legal footer, has zero overflow/axe violations, and returns to the login form after connectivity recovery.
- If connectivity changes after the login form is already loaded, the form remains mounted: the final production test preserves both credential drafts, disables only network actions while offline, and re-enables them on reconnect.
- Account is now a release-enforced app-shell route. A fully cleared cache installed from Schedule alone opens Account correctly on its first offline navigation, so the local-first card no longer depends on a previous Account visit.

Audit self-check: 24 rules planned, 24 rules run, every result recorded, no suppressions.
