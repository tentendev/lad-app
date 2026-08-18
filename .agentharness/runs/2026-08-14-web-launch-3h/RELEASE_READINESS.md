# Release readiness

Updated: 2026-08-14 04:52 CST

## Decision

The local Web MVP and its Vercel Build Output API artifact are release-ready for an owner-approved preview deployment. It is not represented as deployed, production-domain certified, legally approved, or submitted to the App Store.

## Web gates passed

- Original-design contract: 520px centered single column, lavender star background, purple glass surfaces, fixed three-tab navigation, five lead accents, eight activity colors, dashed prediction bars, and matching white-line icon language.
- Core journey: NT$3,000 budget → NT$170 expense → 40-pull calculation → NT$525 recommendation handoff → refresh = NT$2,305 remaining and two records.
- Data safety: legacy normalization, field validation, storage failure guidance, Undo, transactional restore rollback, malformed-JSON write protection, validated backup, and raw recovery copy.
- Quality: ESLint with zero warnings, strict TypeScript, 8 test files / 37 tests, Expo Doctor 20/20, deterministic static export verifier.
- Artifact: 11 static routes, 20 hashed precache bundles, 4.5 MiB total, versioned service worker, four primary routes available offline.
- Browser: 320px / 390px / 520px / 1280px width checks, zero horizontal overflow, async navigation, clean page/console state.
- Accessibility: Lighthouse Accessibility 100 on schedule, wallet, calculator, and About; manual visible-focus and keyboard disclosure flow verified.
- Discovery/safety: Lighthouse Best Practices and SEO 100 on all four routes; 404 status/noindex, robots rules, CSP hashes, frame denial, cache policies, and root redirect configuration verified.
- Reproducibility: a clean isolated `npm ci` installation rebuilt 1,015 packages and passed the complete release gate.
- Vercel target: local project link resolves only to `tentenco/lad-pocket`; the prebuilt output contains 63 static files that exactly match `dist/`, preserves redirect/404/security/cache rules, and passes a credential-text scan.
- Promotion safety: a remote verifier now requires the deployed build ID, four routes, 307 redirect, branded 404, CSP, frame policy, service worker, and immutable cache headers to match before promotion.

## iOS foundation passed

- Shared native renderers use the same color tokens, icons, schedule bars, filters, storage behavior, and 520px tablet content cap.
- Hermes iOS export passes at 6.1 MiB with the original-design background.
- Isolated prebuild verified icon, lavender splash, dark appearance, privacy manifest, no collected data/tracking declarations, and non-exempt encryption set to false.
- EAS profiles exist for `ios-simulator`, internal `preview`, and App Store `production`; the official EAS schema validates, committed source is required, and production build numbers use the recommended remote auto-increment strategy.

## Required external gates

- Explicit authorization to create a Vercel preview; preview browser QA and remote verifier; production promotion, canonical URL, and social preview URL.
- Owner confirmation of product/legal wording and the public support/privacy URLs.
- Real iOS bundle identifier, Expo account/project login, Apple Developer Team, App Store Connect record, signing credentials, Simulator runtime/device QA, TestFlight, store metadata/screenshots, and submission.

## Explicitly deferred product phases

- Supabase account/sync and RLS verification.
- Public plan sharing and dynamic OG rendering.
- Analytics, ads, tracking, or remote error reporting (none are currently present).

## Residual dependency risk

`npm audit --omit=dev` reports 0 critical, 17 high, and 8 moderate dependency-path findings. Root advisories are the Metro build-time `image-size` parser denial-of-service paths and `uuid` through Xcode tooling. npm's proposed automatic fixes require incompatible Expo/Reanimated changes, so no breaking forced fix was applied.
