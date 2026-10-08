# App Store submission status — 2026-10-08

**Not submitted.** App Store Connect app `6812909987`, iOS version `1.0.0`, remains `PREPARE_FOR_SUBMISSION`. Production build **6** is selected and externally available in the existing two-person TestFlight group; Apple shows **Testing** and Beta Review **APPROVED**. The dedicated reviewer credentials remain saved for final review and were also saved and verified for Beta Review. Native Apple sign-in, Hide My Email, backup upload/download and sign-out/re-login passed assisted build-5 QA. The automatic revocation fix is deployed and included in build 6; its deletion/revocation device QA remains pending. Content Rights is saved as `DOES_NOT_USE_THIRD_PARTY_CONTENT`, following the owner’s confirmation and release asset review. Manual release remains selected.

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
- After the owner's next reconnection, both device details and installed-app queries succeeded. The iPhone 15 Pro now reports **iOS 27.0.1 (24A446)**, Developer Mode **enabled**, wired USB, pairing **paired** and tunnel **connected**. The app remains **1.0.0 (4)**; iPhone Mirroring still reports `iCloud Signed Out`. The earlier device-unavailable issue is resolved, while build-5 installation and interactive UI/native QA remain pending.
- The owner then updated TestFlight, and a direct installed-app query confirmed **1.0.0 (5)**. Launched the actual installed build through `deep-space-ledger://account` and verified the signed-out 會員中心 using a scoped USB screenshot. Production Clerk baseline contains the dedicated reviewer only (one user, zero Apple-linked users); identifiers are kept in a restricted ignored QA file. The owner reported the requested Apple-sheet cancellation check complete; a backend check confirms zero new users and the reviewer remains present. Post-cancellation USB capture was black, so independent visual confirmation is unavailable. Subsequent Apple sign-in and Hide My Email passed. The owner confirmed upload/download, sign-out/re-login and retained local records; backend checks show one QA snapshot (revision 1), one active session and the reviewer still present. Clerk returns `oauth_missing_refresh_token` for the new native Apple user, confirming the automatic revocation defect. The QA account is retained while a fresh-authorization deletion fix and replacement build are prepared; no revocation pass is inferred.

## Verification

| Check | Result |
| --- | --- |
| ESLint / TypeScript | Passed |
| Script tests / Vitest | 15 + 160 passed after native deletion fix |
| Web export / prebuilt verification | Passed; 89 static files and both Node API entry points |
| Deployed routes and headers | Passed; 307 root redirect, branded 404, CSP, frame policy, service worker and asset cache |
| Sync/account unauthenticated boundaries | Passed: 401 / 405 / 401 as applicable |
| Sync/account invalid token | Both 401 `token_invalid` |
| iOS Hermes export | Passed; 8.6 MiB and original-design background present |
| Production Email/password, sync and deletion | Passed: real password + emailed Client Trust code, upload/download, stale revision 409, sign-out/re-login, cloud-only deletion and permanent account deletion. Clerk user is gone and its Neon row count is 0 |
| Dedicated reviewer account on current Web deployment | Passed: password login, upload/download, sign-out and re-login without an inaccessible verification-code challenge |
| Old development credential revocation | Passed: old Clerk key HTTP 401, old database password rejected; both replacements verified |
| Dependency / SDK verification | Expo Doctor 21/21; 0 critical and 5 reviewed root advisories; see dependency security review |
| App Store Connect release preparation | Passed: build 6 selected, reviewer credentials and updated Review Notes verified through API; manual release, final review pending native QA |
| Production build 5 external TestFlight access | Passed: existing Maggie & Erik group, two testers, Apple status `Testing` |
| Production build 6 external TestFlight access | Passed: same two testers, automatic notification, Apple `Testing` / `IN_BETA_TESTING`, Beta Review `APPROVED` |
| Physical device access and build-5 launch | Passed: iPhone 15 Pro / iOS 27.0.1, Developer Mode enabled, wired/paired/connected; device query confirms 1.0.0 (5), account deep link and signed-out member screen verified over USB. Mirroring remains iCloud Signed Out; interactive agent control and Apple QA pending |
| Production server values for local preflight | Passed: intended production Clerk key validated, Neon `lad_app` / `lad_app_owner` connection validated, existing Apple private key provided; restricted local storage |
| App Store submission preflight | One remaining blocker: native Apple QA attestation remains false. No missing server values remain in the latest run. App Review not submitted |

The development-session cloud smoke script cannot create a production Clerk session: Clerk returned `request_invalid_for_environment`. Its temporary user was removed. Before the later Email/password QA account was created, production Clerk users and Neon snapshots were both checked at 0. This is not recorded as a passed authenticated production test.

Verified deployment: `dpl_D9XmUGWNiwJooXW36XmghmbihDsX`, build `f94f21158670`, `https://deep-space-ledger-app.vercel.app`. The deployment includes the Apple server credentials and enabled sign-in build flag. A clean bundle inspection confirmed the production Clerk key and enabled Apple flag. The downloaded private key has a restricted local backup under the gitignored credentials directory and is not part of this document or Git history.

## Replacement build and server fix (2026-10-08)

Production native **1.0.0 (6)** completed in EAS (`9d8bd94a-b1bd-4a3e-9ff0-2a3dfc4328dd`) from commit `86a9406`. IPA inspection confirms its signature, bundle/version/build, Apple entitlement, production publishable key/API, fresh deletion code and device credential-state check. Decoded Hermes string entries contain no server credential patterns or configured server values. Apple archive validation and upload passed (delivery `df3d8be6-295b-4b4c-a634-9f2bf94d9fe4`), and processing is **VALID**. Build-6 Traditional Chinese test notes are saved. The upload API key returned HTTP 403 for Beta Review submission and beta-review credential updates; the authenticated App Store Connect UI resolved those limits. The dedicated beta reviewer credentials and notes were saved and verified, then build 6 was added to the existing Maggie & Erik group with automatic notification. Apple now reports **Testing**, `IN_BETA_TESTING` and Beta Review **APPROVED**. No testers were added. No device deletion/revocation pass is recorded.

Server commit `f24e0db` changes the JWT library to native dynamic import for Vercel's CommonJS launcher. The first deployment failed with `ERR_REQUIRE_ESM` and was promptly rolled back. Strengthened prebuilt validation isolates traced dependencies and disables local require(ESM); the fixed staged deployment passed API boundaries and build identity, was promoted, then passed the complete public deployment verifier. Current deployment: `dpl_D9XmUGWNiwJooXW36XmghmbihDsX`, build `f94f21158670`. Native code is unchanged by this server-only follow-up, so build 6 contains the complete native fix.

App Store Connect is authenticated in the existing Ego Lite workspace `4`, page `p1`, and agent control is restored. Bitwarden CLI reports unlocked/ready. The owner explicitly authorizes retrieving matching account names, passwords and available TOTP codes for authorized logins without asking again; this preference is saved in the global instructions. No password retrieval was needed for the resumed authenticated session. API-key limitations are retained as history and do not block the completed UI steps.

## Remaining work

1. Build 6 is installed and launched; complete actual deletion cancellation, deletion and Apple authorization-revocation QA. The server fix and replacement build are complete. Apple sign-in, Hide My Email, upload/download and sign-out/re-login already passed assisted build-5 QA; preserve the QA account until build-6 deletion testing. Interactive actions remain owner-assisted, with backend and USB checks. Google sign-in is outside this release.
2. After native QA, confirm the saved Review Notes still match the tested behavior. The verified reviewer credentials are already saved. Only the reviewer account has a supported per-user Client Trust exception; normal users retain Client Trust. Its unique password is stored in a restricted, gitignored local file.
3. Complete submission preflight with the actual production server values and native QA evidence, then submit build 6 to final App Review. Build 6 is already selected, processing is `VALID`, external TestFlight is `Testing` for the existing two testers and reviewer credentials remain verified. User authorization to upload, submit and release is already granted.
4. Follow Apple's review result and publish the approved version, then confirm its public App Store availability. The owner's goal is a downloadable release, not only a TestFlight upload or an App Review submission.

Ego Lite workspace `4`, page `p1`, is authenticated and agent-owned. Build 6 is selected for final review and available to existing external testers. The owner updated TestFlight, and the latest USB query confirms installed build **6**; the account deep link launched successfully. Before deletion, the retained Apple QA user has one active session and one cloud snapshot (revision 1), and the dedicated reviewer remains present. The owner completed cancellation, Apple sign-in, Hide My Email, upload/download and re-login on build 5. The replacement's deletion/revocation runtime checks remain required, so the native QA attestation remains false. Mac iPhone Mirroring still reports iCloud Signed Out; phone actions remain owner-assisted. See the [native progress receipt](../artifacts/2026-10-08-production/native-qa-progress.json), [build-6 external TestFlight receipt](../artifacts/2026-10-08-production/build6-testflight-release.json), [native QA steps](../artifacts/2026-10-08-production/NATIVE_QA.md) and [IPA verification](../artifacts/2026-10-08-production/build6-ipa-verification.json).

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
