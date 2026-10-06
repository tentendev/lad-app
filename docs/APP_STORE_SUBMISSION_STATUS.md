# App Store submission status — 2026-10-07

**Not submitted.** App Store Connect app `6812909987`, iOS version `1.0.0`, remains `PREPARE_FOR_SUBMISSION`. The version has no selected build. Review contact is present, but the required demo account credentials are empty. Content Rights is unset.

The existing TestFlight `1.0.0 (4)` is a development-auth testing build. It is not the production release candidate.

## Completed this session

- Created and deployed `tentenco/deep-space-ledger-app`, keeping the Maggie HTML prototype separate.
- Added Clerk production publishable key and the new API URL to EAS production.
- Stored Clerk production secret and a fresh Neon connection as sensitive Vercel production variables. Created the cloud snapshot schema in the new database.
- Added Clerk custom domain `lad-app.tenten.co`; DNS verification remains pending.
- Configured Clerk native iOS app: team `RTK85AV2H2`, bundle `com.tenten.deepspaceledger`, redirects `deep-space-ledger://sso-callback` and `com.tenten.deepspaceledger://callback`.
- Confirmed the Apple App ID already has `APPLE_ID_AUTH` with primary app consent.
- Fixed a production `/api/sync` crash caused by TypeScript aliases left in compiled Node code. Shared domain modules now use relative imports; the prebuilt verifier loads and invokes both unauthenticated API entry points.

## Verification

| Check | Result |
| --- | --- |
| ESLint / TypeScript | Passed |
| Script tests / Vitest | 9 + 119 passed |
| Web export / prebuilt verification | Passed; 89 static files and both Node API entry points |
| Deployed routes and headers | Passed; 307 root redirect, branded 404, CSP, frame policy, service worker and asset cache |
| Sync/account unauthenticated boundaries | Passed: 401 / 405 / 401 as applicable |
| Sync/account invalid token | Both 401 `token_invalid` |
| iOS Hermes export | Passed; 8.6 MiB and original-design background present |
| Production sign-in, sync round-trip, permanent deletion | Pending DNS/OAuth and real sign-in |
| App Store submission preflight | Blocked; no new iOS build or review submission started |

The development-session cloud smoke script cannot create a production Clerk session: Clerk returned `request_invalid_for_environment`. Its temporary user was removed. Production Clerk users and Neon snapshots were both checked at 0. This is not recorded as a passed authenticated production test.

Verified deployment: `dpl_2wREAib9HsTXGeK54z44TCLrjBan`, build `edc57a28dac0`, `https://deep-space-ledger-app.vercel.app`. Apple Team ID/native client ID were added to stored Vercel variables afterward; the next deployment will include them together with the remaining Apple configuration.

## Remaining work requiring access or facts

1. Complete Cloudflare two-factor verification (`service@tenten.co`), then install and verify the Clerk DNS records below.
2. Sign in to Apple Developer (`dev@tenten.co`) and Google Cloud (`service@tenten.co`). Complete production Google OAuth, Apple Services ID / private key / Clerk connection / token revocation configuration. The browser pages are open for the owner to authenticate.
3. Confirm the legal basis for the third-party game, character and activity content before answering Apple's Content Rights declaration. The user was asked; no declaration has been made on their behalf.
4. Resolve the `domain_not_owned` response before connecting `lad-app.tenten.co` to Vercel. The `.vercel.app` API endpoint is already deployed.
5. Resolve the old exposed development credentials and release attestation. The new production database and Clerk instance do not reuse them, but old credentials have not been revoked.
6. Finish actual production login, upload/download, conflict handling, sign-out/re-login and permanent deletion including Apple revocation. Create and verify a dedicated reviewer account; do not commit its password.
7. Recheck all App Store declarations, including EU DSA status, with the authenticated account. Build a new production iOS binary, upload it, select it for 1.0.0, populate review credentials/notes and submit App Review. User authorization to do this is already granted.

## Clerk DNS records

All records belong to the `tenten.co` zone and should use the DNS settings required by Clerk (DNS-only CNAMEs).

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `clerk.lad-app` | `frontend-api.clerk.services` |
| CNAME | `clkmail.lad-app` | `mail.oofd0jwvij0y.clerk.services` |
| CNAME | `clk._domainkey.lad-app` | `dkim1.oofd0jwvij0y.clerk.services` |
| CNAME | `clk2._domainkey.lad-app` | `dkim2.oofd0jwvij0y.clerk.services` |

Google's authorized redirect URI is `https://clerk.lad-app.tenten.co/v1/oauth_callback`.

No announcement was added for this infrastructure work.
