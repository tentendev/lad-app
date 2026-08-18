# Final local release receipt

Generated: 2026-08-14 04:10 CST

Timebox ended: 2026-08-14 04:34:47 CST  
Closeout recorded: 2026-08-14 04:34:52 CST

## Artifact identity

- Service-worker build ID: `b492826fe5d3`
- Export: 63 files, 20 hashed precache bundles, verifier total 4.5 MiB
- `precache-manifest.json`: `2c0edd5e8559786686d7323b9a99b9f255a7d73547f9572942fac85b3c297aa8`
- `sw.js`: `2da56fefa2e15bed391d9e82278a79336472b4cc6269b2ffddc3b8e654540f90`
- `schedule.html`: `7b4455e80aec85c25692b93b1647cd539f2edb92d2878900404e0cf738c75c70`
- `wallet.html`: `820d67d98b55a8d8074dca0a3735734717fae91df1d0c0ff65c6a456e1927364`
- `calculator.html`: `272ae3e9bb70575568ad2520084f006fe3481e90c808da558e43df62b2dd6250`
- `about.html`: `bf7e5b2722914d431c440897d96adeecd1247d96d8fb728a6449dca754da3977`
- `package-lock.json`: `e833e862477ce98413649c26ddfeee44f2d40fa53b493519f66cb378c6ff5fb5`

## Final commands

- `npm run release:web`: pass
  - ESLint: zero warnings
  - strict TypeScript: pass
  - Vitest: 8 files / 37 tests
  - Expo Doctor: 20/20
  - static routes: 11
  - precache bundles: 20
  - export verifier: 4.5 MiB, metadata/design/CSP/redirect/cache checks pass
- `npm run verify:ios-bundle`: pass, 6.1 MiB Hermes export
- `npm audit --omit=dev`: 0 critical, 8 moderate, 17 high dependency-path findings

## Runtime smoke

- Fresh service worker cache: only `deep-space-ledger-b492826fe5d3`
- 320px document/client width: schedule 320/320, wallet 320/320, calculator 320/320, About 320/320
- 390px calculator: reserve input and unit switch remain on one line
- 520px: app and navigation exactly 520px
- 1280px: app and navigation remain 520px and centered at x=380
- Final console errors: none
- Final page errors: none
- Final 390px visual receipts: `screenshots/schedule-390-release.png`, `screenshots/wallet-390-final.png`, and `screenshots/calculator-390-final.png`

## Lighthouse receipts

- Accessibility: 100 on schedule, wallet, calculator, and About
- Best Practices: 100 on all four routes
- SEO: 100 on all four routes
- Fresh post-fix 320px calculator audit: Accessibility 100, Best Practices 100, SEO 100
- Representative throttled schedule paint: FCP 0.90s, LCP 1.81s, CLS 0
- Performance total is not used as a final deterministic gate on this shared high-CPU machine; an earlier uncontended identical architecture scored 97, while the final contended run recorded TBT noise with stable paint metrics.

This receipt identifies a local artifact only. No commit, push, deployment, production-domain verification, signing, or store submission was performed.

## Post-timebox deployment preflight — 04:52 CST

- Linked the gitignored local Vercel metadata to the user-designated `tentenco/lad-pocket` project; no deployment or hosted setting was changed.
- Removed the Vercel-downloaded top-level OIDC environment file after proving it changed Expo's output fingerprint. A clean rebuild returned to the receipt build `b492826fe5d3`; no credential-like text is present in the release/prebuilt artifact.
- `vercel build --yes --scope tentenco` passed locally and created Build Output API version 3 output. All 63 static files exactly match `dist/`; root redirect, branded 404, CSP/frame policy, service-worker revalidation, and immutable Expo asset caching are preserved.
- `npm run preflight:web-deploy` passes for authenticated account `tentendev`, scope `tentenco`, project `lad-pocket`, and the healthy existing production alias. It does not deploy.
- `npm run verify:web-deployment -- https://lad-pocket.vercel.app` correctly fails against the current original production site (`200` at `/` instead of the new release's `307 -> /schedule`), proving the new build is not yet live.
- Added EAS `ios-simulator`, `preview`, and `production` profiles. The latest official EAS JSON schema validates; EAS CLI 21.8.0 is available through `npx`, but remote config remains gated on Expo login and an owner-approved iOS bundle identifier.

## Authorized Vercel preview — 05:02 CST

- Created preview deployment `dpl_85gGeozyhrqeAaxa92V2yf6meLp1` from the verified prebuilt artifact: `https://lad-pocket-723hs0uaf-tentenco.vercel.app`.
- Authenticated remote verification passed build ID `b492826fe5d3`, four routes, 307 root redirect, branded 404, CSP/frame headers, versioned service worker, and immutable asset caching.
- Vercel Team SSO remains enabled for preview access. Production was not promoted and `https://lad-pocket.vercel.app` remains on its previous deployment.
