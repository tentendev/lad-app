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

- The dedicated reviewer account exists with a unique secret stored outside Git. Only that account uses Clerk's supported per-user Client Trust exception. Its real Web UI login and backup flow passed on October 8. Later that day the authenticated App Store Connect UI saved the credentials and Review Notes; reload verification confirmed persistence.
- Native Sign in with Apple, Hide My Email and account deletion/token revocation remain pending. After the owner's October 8 upgrade, the iPhone 15 Pro reports iOS 26.7.1 with Developer Mode enabled, wired USB pairing and a connected tunnel. USB screen capture is available; interactive phone UI control still requires setup. Mac iPhone Mirroring shows iCloud signed out, while System Settings shows an unfinished Start Using iCloud step. A device-side app query confirms build 4 is still installed. Build 5 is now externally `Testing` for the existing Maggie & Erik group, enabling the required production installation; Core QA has zero testers. See the [TestFlight receipt](../2026-10-08-production/testflight-external-release.json) and [device access receipt](../2026-10-08-production/device-access.json).
- On October 8 the old exposed development credentials were revoked. The old Clerk key returned HTTP 401 and the old Neon password failed authentication. The replacements were verified and applied locally and to the matching legacy Vercel Preview environment. The rotation attestation is true; the native Apple QA attestation remains false. See the [verification receipt](../2026-10-08-production/verification.json).
- Production iOS build 5 completed. The IPA passes deep signature verification, matches version 1.0.0 (5), includes the signed Apple sign-in entitlement and embeds the expected production Clerk key/API URL. It uses iPhoneOS SDK 26.5 and targets iOS 17+. Apple validation and upload succeeded without errors (delivery `9778f835-2bfb-4130-bf03-da8749612aec`). Apple processed the build as `VALID` / internal `READY_FOR_BETA_TESTING`; Traditional Chinese TestFlight validation notes were saved. On October 8 the authenticated App Store Connect UI selected build 5, resolving the upload API key's HTTP 403 limitation. Actual App Review submission remains pending native Apple QA and submission preflight. See the [saved preparation receipt](../2026-10-08-production/app-store-preparation.json).
- The latest October 8 full submission preflight uses validated production Clerk and Neon values plus the existing Apple private key, stored only in a restricted ignored file. It reports one remaining blocker: native Apple sign-in QA. No missing server values remain in this run. See the [preflight receipt](../2026-10-08-production/submission-preflight.json).

No app announcement was added for release preparation.
