# App Store submission status — 2026-10-07

**Not submitted.** App Store Connect app `6812909987`, iOS version `1.0.0`, remains `PREPARE_FOR_SUBMISSION`. The version has no selected build. Review contact is present, but the required demo account credentials are empty. Content Rights is unset.

The existing TestFlight `1.0.0 (4)` is a development-auth testing build. It is not the production release candidate.

## Completed this session

- Created and deployed `tentenco/deep-space-ledger-app`, keeping the Maggie HTML prototype separate.
- Added Clerk production publishable key and the new API URL to EAS production.
- Stored Clerk production secret and a fresh Neon connection as sensitive Vercel production variables. Created the cloud snapshot schema in the new database.
- Added Clerk custom domain `lad-app.tenten.co`; DNS verification remains pending.
- Cloudflare authentication is complete. Added all four Clerk CNAMEs below as DNS-only records in the existing `tenten.co` zone. Clerk verification identified an existing zone-wide CNAME flattening setting that prevents direct CNAME answers. That setting has not been changed.
- Configured Clerk native iOS app: team `RTK85AV2H2`, bundle `com.tenten.deepspaceledger`, redirects `deep-space-ledger://sso-callback` and `com.tenten.deepspaceledger://callback`.
- Confirmed the Apple App ID already has `APPLE_ID_AUTH` with primary app consent.
- After the owner signed in to Apple Developer, created Sign in with Apple key `32FPF2MRV9` and Services ID `com.tenten.deepspaceledger.web`. Bound the Services ID to the existing primary App ID and Clerk callback. Clerk now shows Apple as **Used for sign-in**.
- Registered Apple private relay email source `bounces+116179987@clkmail.lad-app.tenten.co`; SPF verification still awaits the Clerk DNS records.
- Stored all Apple server credentials in Vercel production and enabled the Apple sign-in build flag in Vercel/EAS production. The Web/API deployment includes these changes; a new iOS build and actual Apple sign-in/revocation QA are still pending.
- Fixed stale Expo export caching that retained the disabled Apple flag after the environment changed. Web and iOS verification exports now clear the bundler cache.
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

Verified deployment: `dpl_6iXEtj2fVFsjcBBBpzbqmFABoVuf`, build `79bf378dae33`, `https://deep-space-ledger-app.vercel.app`. The deployment includes the Apple server credentials and enabled sign-in build flag. A clean bundle inspection confirmed the production Clerk key and enabled Apple flag. The downloaded private key has a restricted local backup under the gitignored credentials directory and is not part of this document or Git history.

## Remaining work requiring access or facts

1. Resolve Cloudflare's existing `flatten_all_cnames` setting, then verify Clerk DNS and SSL. The four App records are installed. The zone contains 106 other CNAME records, including 90 DNS-only records, so preserve their existing resolution behavior when introducing exceptions for the App. A DNS export was saved locally; no global setting or existing DNS record has been modified.
2. Apple Developer and Cloudflare authentication are complete. Sign in to Google Cloud (`service@tenten.co`) to finish production Google OAuth. After DNS is verified, recheck Apple relay SPF and test Apple sign-in/revocation. The browser remains with the owner after they took control.
3. Confirm the legal basis for the third-party game, character and activity content before answering Apple's Content Rights declaration. The user was asked; no declaration has been made on their behalf.
4. Resolve the `domain_not_owned` response before connecting `lad-app.tenten.co` to Vercel. The `.vercel.app` API endpoint is already deployed.
5. Resolve the old exposed development credentials and release attestation. The new production database and Clerk instance do not reuse them, but old credentials have not been revoked.
6. Finish actual production login, upload/download, conflict handling, sign-out/re-login and permanent deletion including Apple revocation. Create and verify a dedicated reviewer account; do not commit its password.
7. Recheck all App Store declarations, including EU DSA status, with the authenticated account. Build a new production iOS binary, upload it, select it for 1.0.0, populate review credentials/notes and submit App Review. User authorization to do this is already granted.

## Clerk DNS records

All four records were added to the `tenten.co` zone as DNS-only CNAMEs. Verification is still blocked by zone-wide CNAME flattening. Cloudflare documents that this global setting cannot be overridden per record; see [CNAME flattening setup](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/). Do not treat successful record creation as successful Clerk verification.

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `clerk.lad-app` | `frontend-api.clerk.services` |
| CNAME | `clkmail.lad-app` | `mail.oofd0jwvij0y.clerk.services` |
| CNAME | `clk._domainkey.lad-app` | `dkim1.oofd0jwvij0y.clerk.services` |
| CNAME | `clk2._domainkey.lad-app` | `dkim2.oofd0jwvij0y.clerk.services` |

Google's authorized redirect URI is `https://clerk.lad-app.tenten.co/v1/oauth_callback`.

No announcement was added for this infrastructure work.
