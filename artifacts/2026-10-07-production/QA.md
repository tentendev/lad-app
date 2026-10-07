# 2026-10-07 production release validation

Source: `28f4fdee63e320a7cb6b11a5e9e0c720fe899b99`.

## Automated and deployment checks

- ESLint, TypeScript, 15 Node tests and 122 Vitest tests passed.
- Expo Doctor: 21/21. Dependency gate: zero critical findings and five reviewed root advisories; see `docs/DEPENDENCY_SECURITY_REVIEW.md` for remaining upstream limitations.
- Clean iOS Hermes export: 8.6 MiB. iOS build preflight passed.
- Clean Web export: 22 release files, 31 bundles, 5.8 MiB. Prebuilt verification checked 89 static files and loaded both Node API handlers.
- Production Web build `834b812e1f56` is deployed to both `lad-app.tenten.co` and `deep-space-ledger-app.vercel.app`. Route, redirect, error page, CSP, cache and API authentication checks passed on both domains.

## Real production Email/password validation

The owner supplied the actual emailed Client Trust code for a disposable QA account; normal-user Client Trust was retained.

On the preceding production Web deployment containing the same account and endpoint changes, the following passed:

- Password sign-in and Client Trust verification.
- Authenticated backup creation, read-back and stale-revision conflict rejection (HTTP 409).
- UI cloud download and upload, including the revision increment.
- Sign-out and password re-login on the trusted device.
- Cloud-only deletion while retaining the account, then a fresh upload.
- Permanent account deletion through the App. Backend verification returned Clerk user 404 and zero Neon snapshots for that user.

This QA found a Web origin-selection bug: the custom domain attempted to call the separate Vercel origin. Web now uses same-origin API paths; native still uses the configured absolute API URL. Three regression tests cover these cases. On October 8 the dedicated reviewer account passed password login, upload, download, sign-out and re-login on the current deployment after the Clerk dependency update.

## Remaining release validation

- The dedicated reviewer account exists with a unique secret stored outside Git. Only that account uses Clerk's supported per-user Client Trust exception. Its real Web UI login and backup flow passed on October 8; entering the credentials into App Store Connect still requires Apple authentication.
- Native Sign in with Apple, Hide My Email and account deletion/token revocation need a connected physical device or the new TestFlight build. The owner's iPhone was unavailable to the Mac during this run.
- On October 8 the old exposed development credentials were revoked. The old Clerk key returned HTTP 401 and the old Neon password failed authentication. The replacements were verified and applied locally and to the matching legacy Vercel Preview environment. The rotation attestation is true; the native Apple QA attestation remains false. See the [verification receipt](../2026-10-08-production/verification.json).
- Production iOS build 5 completed. The IPA passes deep signature verification, matches version 1.0.0 (5), includes the signed Apple sign-in entitlement and embeds the expected production Clerk key/API URL. It uses iPhoneOS SDK 26.5 and targets iOS 17+. Apple validation and upload succeeded without errors (delivery `9778f835-2bfb-4130-bf03-da8749612aec`). Apple processed the build as `VALID` / internal `READY_FOR_BETA_TESTING`; Traditional Chinese TestFlight validation notes were saved. Final build selection and actual App Review submission remain pending: the existing upload API key returned HTTP 403 for build selection, requiring the authenticated App Store Connect UI.

No app announcement was added for release preparation.
