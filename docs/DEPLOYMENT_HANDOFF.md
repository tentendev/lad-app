# Web deployment handoff

## Pending 02A and membership changes (2026-11-12)

The current App working branch adds `/admin`, `/api/admin`, `/api/member`, and `sql/002_member_audit.sql`. Before deploying it, provision matching preview Clerk and database settings, run all schema migrations, assign the intended member administrator server-side, and verify the real user journeys. The project currently exposes only production-scoped environment configuration; no production settings or database were changed for this implementation. See [implementation and verification status](02A_MEMBERSHIP_IMPLEMENTATION.md). The original HTML site remains frozen except for separately requested schedule updates.

## Current Expo/API target (2026-10-08)

- Vercel scope: `tentenco`
- Project: `deep-space-ledger-app`
- Project ID: `prj_2O9QRjrN5IiXeoe2XqwS3OghyybU`
- Production API URL: `https://deep-space-ledger-app.vercel.app`
- Verified Web domain: `https://lad-app.tenten.co`
- Verified build: `f94f21158670`
- Deployment: `dpl_D9XmUGWNiwJooXW36XmghmbihDsX`
- Immutable URL: `https://deep-space-ledger-ooy74od5p-tentenco.vercel.app`

`lad-pocket.vercel.app` remains the Maggie HTML prototype. Do not deploy the Expo project there. The workspace now links to the independent Expo/API project through gitignored `.vercel/project.json`.

Production uses a Clerk production key and a fresh Neon database. Public routes and unauthenticated/invalid-token API boundaries pass. Apple credentials and the sign-in flag are configured. Clerk DNS, Email and SSL are verified, and the custom Web domain is live. Google sign-in is disabled for the Apple + Email first release; Email/password and cloud/account deletion QA passed; Apple native sign-in, Hide My Email, backup upload/download and re-login passed owner-assisted QA; automatic revocation awaits build-6 deletion QA; this deployment is preparation for App Store submission, not a completed authentication release. See `APP_STORE_SUBMISSION_STATUS.md`.

Build 6 is now externally available in the existing two-person TestFlight group (`Testing`, Beta Review `APPROVED`) and selected as the final App Review candidate. The authenticated UI resolved the upload API key's review-permission limits. The owner updated without uninstalling; a direct USB app query confirms build 6 and its account deep link launched successfully. Complete deletion cancellation and actual Apple revocation checks before the final submission. Workspace `4` / `p1` remains authenticated and agent-owned. Authorized login credentials and available TOTP codes should be retrieved from the ready Bitwarden CLI without asking the owner to supply them again.

## Build and deploy

Use the existing user authorization for the requested release. Vercel environment/OIDC files and local credential files must never enter source control or release artifacts.

```bash
vercel link --yes --project deep-space-ledger-app --scope tentenco
vercel pull --yes --environment=production --scope tentenco
npm run check
vercel build --prod --scope tentenco
npm run verify:web
npm run verify:vercel-prebuilt
npm run preflight:web-deploy
vercel deploy --prebuilt --prod --skip-domain --yes --scope tentenco
# Validate the staged API with authenticated vercel curl, then promote the exact verified deployment.
vercel promote DEPLOYMENT_ID --yes --scope tentenco
npm run verify:web-deployment -- https://deep-space-ledger-app.vercel.app
```

`verify:vercel-prebuilt` checks the static output and runs the compiled account, sync, member and admin handlers under Node to catch unresolved module imports before deployment. Then complete the browser and device journeys in `WEB_RELEASE_CHECKLIST.md`, including real sign-in, member isolation, administrator permissions and data deletion in the intended environment.

The fresh Neon project is `frosty-shape-90805190`, database `lad_app`. The old development database is separate. `scripts/smoke-cloud-sync.mjs` creates development-only Clerk sessions and is not a production authentication test.

## Historical preview

The August preview used `tentenco/lad-pocket`, with the protected alias `https://lad-pocket-auth-preview.vercel.app`. Those URLs are historical; the current release commands above target the independent project. Support/privacy/account-deletion information remains on `deep-space-ledger-support.vercel.app`.
