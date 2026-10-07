# App Store submission status — 2026-10-07

**Not submitted.** App Store Connect app `6812909987`, iOS version `1.0.0`, remains `PREPARE_FOR_SUBMISSION`. The version has no selected build. Review contact is present, but the required demo account credentials are empty. Content Rights is saved as `DOES_NOT_USE_THIRD_PARTY_CONTENT`, following the owner’s confirmation and the release asset review.

The existing TestFlight `1.0.0 (4)` is a development-auth testing build. It is not the production release candidate.

## Completed this session

- Created and deployed `tentenco/deep-space-ledger-app`, keeping the Maggie HTML prototype separate.
- Added Clerk production publishable key and the new API URL to EAS production.
- Stored Clerk production secret and a fresh Neon connection as sensitive Vercel production variables. Created the cloud snapshot schema in the new database.
- Added and verified Clerk custom domain `lad-app.tenten.co`: Frontend API, all three email records and SSL are verified/issued. The production Frontend API responds over HTTPS.
- Added the four Clerk DNS-only CNAMEs. Preserved per-record flattening for all 90 existing DNS-only CNAMEs, verified that all 202 existing DNS records retained their names, values, TTLs and proxy settings, then disabled zone-wide CNAME flattening. Existing 16 proxied CNAMEs were unchanged. Backups and the verification receipt remain local. The temporary scoped Cloudflare token was revoked and its secret file removed after setup.
- Removed the unused, unverified `lad-pocket.vercel.app` proxy domain from Clerk after the custom domain became verified. Only the verified primary domain remains; this did not modify the Maggie HTML deployment.
- The owner confirmed the first release uses Apple and Email/password only (including Gmail addresses). Removed Google sign-in from Web/native UI and disabled its Clerk production connection. No Google Cloud project is required.
- Configured Clerk native iOS app: team `RTK85AV2H2`, bundle `com.tenten.deepspaceledger`, redirects `deep-space-ledger://sso-callback` and `com.tenten.deepspaceledger://callback`.
- Confirmed the Apple App ID already has `APPLE_ID_AUTH` with primary app consent.
- After the owner signed in to Apple Developer, created Sign in with Apple key `32FPF2MRV9` and Services ID `com.tenten.deepspaceledger.web`. Bound the Services ID to the existing primary App ID and Clerk callback. Clerk now shows Apple as **Used for sign-in**.
- Registered Apple private relay email source `bounces+116179987@clkmail.lad-app.tenten.co` and reran SPF verification after DNS propagated.
- Stored all Apple server credentials in Vercel production and enabled the Apple sign-in build flag in Vercel/EAS production. The Web/API deployment includes these changes; a new iOS build and actual Apple sign-in/revocation QA are still pending.
- Fixed stale Expo export caching that retained the disabled Apple flag after the environment changed. Web and iOS verification exports now clear the bundler cache.
- Fixed Web API origin selection: the custom Web domain now calls its own `/api` paths, while native clients retain the configured absolute API URL. Added regression tests for Web and native endpoint selection.
- Fixed a production `/api/sync` crash caused by TypeScript aliases left in compiled Node code. Shared domain modules now use relative imports; the prebuilt verifier loads and invokes both unauthenticated API entry points.

## Verification

| Check | Result |
| --- | --- |
| ESLint / TypeScript | Passed |
| Script tests / Vitest | 9 + 122 passed |
| Web export / prebuilt verification | Passed; 89 static files and both Node API entry points |
| Deployed routes and headers | Passed; 307 root redirect, branded 404, CSP, frame policy, service worker and asset cache |
| Sync/account unauthenticated boundaries | Passed: 401 / 405 / 401 as applicable |
| Sync/account invalid token | Both 401 `token_invalid` |
| iOS Hermes export | Passed; 8.6 MiB and original-design background present |
| Production Email/password, sync and deletion | Passed: real password + emailed Client Trust code, upload/download, stale revision 409, sign-out/re-login, cloud-only deletion and permanent account deletion. Clerk user is gone and its Neon row count is 0 |
| Dependency / SDK verification | Expo Doctor 21/21; 0 critical and 5 reviewed root advisories; see dependency security review |
| App Store submission preflight | Blocked; no new iOS build or review submission started |

The development-session cloud smoke script cannot create a production Clerk session: Clerk returned `request_invalid_for_environment`. Its temporary user was removed. Before the later Email/password QA account was created, production Clerk users and Neon snapshots were both checked at 0. This is not recorded as a passed authenticated production test.

Verified deployment: `dpl_EDG8HfXHVnYPaLLyQNRY7Tpowqaf`, build `d7224ede0fed`, `https://deep-space-ledger-app.vercel.app`. The deployment includes the Apple server credentials and enabled sign-in build flag. A clean bundle inspection confirmed the production Clerk key and enabled Apple flag. The downloaded private key has a restricted local backup under the gitignored credentials directory and is not part of this document or Git history.

## Remaining work requiring access or facts

1. Apple native sign-in and revocation need final device QA. Google sign-in is outside this release.
2. Web Email/password and the complete data-control flow passed on the deployed production App. The disposable QA account was permanently deleted, confirmed by Clerk 404 and zero matching Neon snapshots. Apple sign-in and token revocation still need device QA.
3. A dedicated verified production reviewer account has been created. Only this account has the supported per-user Client Trust exception so reviewers do not need access to the owner’s mailbox. Its unique password is stored in a restricted, gitignored local file. Actual demo login verification and entry into App Store Connect are pending. Normal users retain Client Trust.
4. Resolve old exposed development credentials and the release attestation. The new production database and Clerk instance do not reuse them, but old credentials have not been revoked.
5. Apple Business confirms the Free Apps Agreement is active. DSA is completed as non-trader following the owner’s explicit confirmation that this is a personal noncommercial work. Apple shows all current regulatory requirements complete. No Paid Apps Agreement is required for this free app without purchases.
6. Build a new production iOS binary, upload it, select it for 1.0.0, populate review credentials/notes and submit App Review. User authorization to do this is already granted.

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
