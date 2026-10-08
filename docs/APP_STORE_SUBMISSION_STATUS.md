# App Store submission status — 2026-10-08

**Not submitted.** App Store Connect app `6812909987`, iOS version `1.0.0`, remains `PREPARE_FOR_SUBMISSION`. Production build **5** is now selected, the dedicated reviewer credentials are saved, and Review Notes describe the production account and cloud flows. These values persisted after reloading the authenticated App Store Connect page. Native Apple sign-in, Hide My Email and deletion/token revocation QA remain pending. Content Rights is saved as `DOES_NOT_USE_THIRD_PARTY_CONTENT`, following the owner’s confirmation and the release asset review.

The existing TestFlight `1.0.0 (4)` is a development-auth testing build. It is not the production release candidate.

## Completed this session

- Created and deployed `tentenco/deep-space-ledger-app`, keeping the Maggie HTML prototype separate.
- Added Clerk production publishable key and the new API URL to EAS production.
- Stored Clerk production secret and a fresh Neon connection as sensitive Vercel production variables. Created the cloud snapshot schema in the new database.
- Added and verified Clerk custom domain `lad-app.tenten.co`: Frontend API, all three email records and SSL are verified/issued. The production Frontend API responds over HTTPS.
- Added the four Clerk DNS-only CNAMEs. Preserved per-record flattening for all 90 existing DNS-only CNAMEs, verified that all 202 existing DNS records retained their names, values, TTLs and proxy settings, then disabled zone-wide CNAME flattening. Existing 16 proxied CNAMEs were unchanged. Backups and the verification receipt remain local. The temporary scoped Cloudflare token was revoked and its secret file removed after setup.
- Removed the unused, unverified `lad-pocket.vercel.app` proxy domain from Clerk after the custom domain became verified. Only the verified primary domain remains; this did not modify the Maggie HTML deployment.
- Saved DSA non-trader status following the owner’s confirmation that this is a personal noncommercial work. Apple shows all current regulatory requirements complete; the Free Apps Agreement is active.
- The owner confirmed the first release uses Apple and Email/password only (including Gmail addresses). Removed Google sign-in from Web/native UI and disabled its Clerk production connection. No Google Cloud project is required.
- Configured Clerk native iOS app: team `RTK85AV2H2`, bundle `com.tenten.deepspaceledger`, redirects `deep-space-ledger://sso-callback` and `com.tenten.deepspaceledger://callback`.
- Confirmed the Apple App ID already has `APPLE_ID_AUTH` with primary app consent.
- After the owner signed in to Apple Developer, created Sign in with Apple key `32FPF2MRV9` and Services ID `com.tenten.deepspaceledger.web`. Bound the Services ID to the existing primary App ID and Clerk callback. Clerk now shows Apple as **Used for sign-in**.
- Registered Apple private relay email source `bounces+116179987@clkmail.lad-app.tenten.co` and reran SPF verification after DNS propagated.
- Stored all Apple server credentials in Vercel production and enabled the Apple sign-in build flag in Vercel/EAS production. The Web/API deployment and production iOS build 5 include these changes; actual Apple sign-in/revocation QA is still pending.
- Fixed stale Expo export caching that retained the disabled Apple flag after the environment changed. Web and iOS verification exports now clear the bundler cache.
- Fixed Web API origin selection: the custom Web domain now calls its own `/api` paths, while native clients retain the configured absolute API URL. Added regression tests for Web and native endpoint selection.
- Fixed a production `/api/sync` crash caused by TypeScript aliases left in compiled Node code. Shared domain modules now use relative imports; the prebuilt verifier loads and invokes both unauthenticated API entry points.
- Verified the dedicated reviewer account on the current production Web deployment: password login, cloud upload, cloud download, sign-out and password re-login passed. The account remains available for Apple review; its password is stored only in the restricted, gitignored credentials directory.
- Revoked the exposed development Clerk key and reset the old Neon role password with the owner's authorization. The old Clerk key now returns HTTP 401 and the old database password fails authentication; the replacement key returns HTTP 200 and the replacement database connection passes `SELECT 1`.
- Updated local development credentials and the matching `lad-pocket` Vercel Preview environment. No original HTML production deployment was triggered. Production credentials remain separate. The rotation release attestation is now true.
- Resumed the release in Ego Lite workspace `4` after the earlier workspace was no longer available, using the existing replacement-workspace authorization. App Store Connect authenticated successfully without a new password or 2FA challenge.
- Selected production build `5` (`9778f835-2bfb-4130-bf03-da8749612aec`) through the supported App Store Connect UI, resolving the upload API key's build-selection permission limit.
- Saved the dedicated reviewer Email/password and enabled Sign-in Information for member/cloud review. Updated Review Notes with actual account, backup and deletion paths; the notes do not claim native Apple QA has passed. Reload verification confirmed build, credentials and notes persisted. Manual release remains selected.
- After the owner's upgrade, confirmed the connected iPhone 15 Pro runs **iOS 26.7.1 (23H30)** with Developer Mode **enabled**, USB transport **wired**, pairing **paired** and tunnel **connected**. Device-side app inspection still reports 深空省省 **1.0.0 (4)**. USB screen capture is available, but interactive phone UI control has not been established. Mac iPhone Mirroring displays `iCloud Signed Out`; System Settings shows an unfinished **Start Using iCloud** step. No global Mac account setting was changed.
- Found that Core QA has **zero testers**, while the owner's existing external tester installation is build 4. Added build 5 to the already-authorized Maggie & Erik group, preserved its two testers, and completed the TestFlight Beta Review flow with automatic notification enabled. Apple immediately shows **Testing** for build 5 in that group. This is TestFlight availability, not a native QA pass or the final App Store Review submission.
- Retrieved the existing production Clerk secret from the intended production instance and verified it can read the dedicated reviewer account. Retrieved the existing production Neon connection from the intended project/branch/database/role and passed a read-only connection check. Stored these and the existing Apple private key in a restricted, gitignored local preflight file; no secret values were printed. The full submission preflight now reports only the pending native Apple QA attestation.
- At the final device refresh, CoreDevice returned error **4016** for installed-app inspection, and the device list showed **unavailable**. The earlier successful upgrade, pairing, capture and build-4 observations remain recorded; device access must be rechecked before native QA.

## Verification

| Check | Result |
| --- | --- |
| ESLint / TypeScript | Passed |
| Script tests / Vitest | 15 + 122 passed |
| Web export / prebuilt verification | Passed; 89 static files and both Node API entry points |
| Deployed routes and headers | Passed; 307 root redirect, branded 404, CSP, frame policy, service worker and asset cache |
| Sync/account unauthenticated boundaries | Passed: 401 / 405 / 401 as applicable |
| Sync/account invalid token | Both 401 `token_invalid` |
| iOS Hermes export | Passed; 8.6 MiB and original-design background present |
| Production Email/password, sync and deletion | Passed: real password + emailed Client Trust code, upload/download, stale revision 409, sign-out/re-login, cloud-only deletion and permanent account deletion. Clerk user is gone and its Neon row count is 0 |
| Dedicated reviewer account on current Web deployment | Passed: password login, upload/download, sign-out and re-login without an inaccessible verification-code challenge |
| Old development credential revocation | Passed: old Clerk key HTTP 401, old database password rejected; both replacements verified |
| Dependency / SDK verification | Expo Doctor 21/21; 0 critical and 5 reviewed root advisories; see dependency security review |
| App Store Connect release preparation | Passed: build 5 selected, reviewer credentials and Review Notes saved and verified after reload; manual release |
| Production build 5 external TestFlight access | Passed: existing Maggie & Erik group, two testers, Apple status `Testing` |
| Physical device access | Last successful check: iPhone 15 Pro / iOS 26.7.1, Developer Mode enabled, wired/paired/connected, installed build 4, USB capture available. Final refresh: CoreDevice 4016 and device unavailable; interactive UI control and Apple QA pending |
| Production server values for local preflight | Passed: intended production Clerk key validated, Neon `lad_app` / `lad_app_owner` connection validated, existing Apple private key provided; restricted local storage |
| App Store submission preflight | One remaining blocker: native Apple QA attestation remains false. No missing server values remain in the latest run. App Review not submitted |

The development-session cloud smoke script cannot create a production Clerk session: Clerk returned `request_invalid_for_environment`. Its temporary user was removed. Before the later Email/password QA account was created, production Clerk users and Neon snapshots were both checked at 0. This is not recorded as a passed authenticated production test.

Verified deployment: `dpl_CzHvzhsxDrKUxgftQNAFFJHZniU6`, build `834b812e1f56`, `https://deep-space-ledger-app.vercel.app`. The deployment includes the Apple server credentials and enabled sign-in build flag. A clean bundle inspection confirmed the production Clerk key and enabled Apple flag. The downloaded private key has a restricted local backup under the gitignored credentials directory and is not part of this document or Git history.

## Remaining work

1. Update the owner's iPhone from the old development-auth build 4 to production TestFlight build 5, now available in the existing external group. A direct installed-app query confirms build 4 remains installed after the iOS upgrade. Complete native Sign in with Apple, Hide My Email and deletion/token revocation QA. USB pairing and Developer Mode are ready; for agent UI control, the owner must finish iPhone Mirroring with the same Apple Account on Mac and iPhone, or perform the actual phone tests and provide their results. USB screen capture can assist scoped verification. Google sign-in is outside this release.
2. After native QA, confirm the saved Review Notes still match the tested behavior. The verified reviewer credentials are already saved. Only the reviewer account has a supported per-user Client Trust exception; normal users retain Client Trust. Its unique password is stored in a restricted, gitignored local file.
3. Complete submission preflight with the actual production server values, then submit the already-selected build 5 to App Review. Apple processing is complete (`VALID`) and external TestFlight is now `Testing` for the existing two testers. Core QA also contains the build but has zero testers. Traditional Chinese TestFlight validation notes are saved. The authenticated App Store Connect UI resolved the upload API key's HTTP 403 build-selection limitation. Production iOS `1.0.0 (5)` was built in EAS (`26bd8bd2-8db0-49c2-b9b5-8ac04f8f1212`) from commit `28f4fde`, passed IPA signature/entitlement and Apple validation checks, and was successfully uploaded. Delivery ID: `9778f835-2bfb-4130-bf03-da8749612aec`. User authorization to upload, submit and release is already granted.
4. Follow Apple's review result and publish the approved version, then confirm its public App Store availability. The owner's goal is a downloadable release, not only a TestFlight upload or an App Review submission.

The browser authentication prerequisite is resolved. Ego Lite workspace `4`, page `p1`, is agent-owned and returned to the existing external TestFlight group. `Erik-iPhone15` successfully connected over USB with Developer Mode enabled and screen capture available, but the final refresh reports the device unavailable. The owner has been asked to update the installed app to build 5; recheck the connection afterward. For interactive agent UI, Mac iPhone Mirroring setup still needs to be completed, or the owner can provide actual build-5 native QA results. These are UI-access/testing prerequisites, not outstanding submission permission. The native QA attestation remains false. See the [latest submission preflight](../artifacts/2026-10-08-production/submission-preflight.json), [external TestFlight release receipt](../artifacts/2026-10-08-production/testflight-external-release.json), [device access receipt](../artifacts/2026-10-08-production/device-access.json), [saved App Store preparation receipt](../artifacts/2026-10-08-production/app-store-preparation.json), [native QA steps](../artifacts/2026-10-08-production/NATIVE_QA.md), [October 8 verification receipt](../artifacts/2026-10-08-production/verification.json), [QA record](../artifacts/2026-10-07-production/QA.md) and [build/upload receipt](../artifacts/2026-10-07-production/release-receipt.json).

The earlier October 8 local export omitted three sensitive server values and produced four preflight issues. Those local credential gaps are now resolved using the actual production values, stored in `credentials/production-preflight.json` (0600, gitignored). The latest full preflight reports only `CLERK_APPLE_OAUTH_CONFIGURED=false`. Keep this attestation false until the required native tests pass; do not substitute development credentials or declare QA complete to make the command pass.

## Content rights and Web domain

On 2026-10-07 the owner confirmed that no game character or event assets are used. The actual release icon, header mark, onboarding image and generic star-field backgrounds were reviewed; see [asset review](APP_ASSET_REVIEW.md). App Store Connect now saves “No, this app does not contain, show, or access third-party content”; a subsequent API read confirmed `DOES_NOT_USE_THIRD_PARTY_CONTENT`. The public API’s attempted update returned 409, so the supported App Store Connect UI was used and saved successfully.

`lad-app.tenten.co` was attached to `deep-space-ledger-app` through Vercel’s project-domain flow, with the required `_vercel.tenten.co` TXT ownership challenge. Vercel confirms `verified: true` and `misconfigured: false`. The DNS-only CNAME points to the project’s recommended `70e4c0399b104308.vercel-dns-016.com`; HTTPS serves the membership page and Clerk loads successfully. The native API URL remains the independently deployed `.vercel.app` endpoint.

## Clerk DNS records

All four records are DNS-only, answer as CNAMEs and are verified by Clerk. The existing zone-wide flattening behavior was preserved per record for other DNS-only CNAMEs before changing the global setting; see [CNAME flattening setup](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/).

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `clerk.lad-app` | `frontend-api.clerk.services` |
| CNAME | `clkmail.lad-app` | `mail.oofd0jwvij0y.clerk.services` |
| CNAME | `clk._domainkey.lad-app` | `dkim1.oofd0jwvij0y.clerk.services` |
| CNAME | `clk2._domainkey.lad-app` | `dkim2.oofd0jwvij0y.clerk.services` |

Apple’s Clerk callback is `https://clerk.lad-app.tenten.co/v1/oauth_callback`.

No announcement was added for this infrastructure work.
