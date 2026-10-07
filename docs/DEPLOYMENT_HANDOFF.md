# Web deployment handoff

## Current Expo/API target (2026-10-07)

- Vercel scope: `tentenco`
- Project: `deep-space-ledger-app`
- Project ID: `prj_2O9QRjrN5IiXeoe2XqwS3OghyybU`
- Production API URL: `https://deep-space-ledger-app.vercel.app`
- Verified Web domain: `https://lad-app.tenten.co`
- Verified build: `d7224ede0fed`
- Deployment: `dpl_EDG8HfXHVnYPaLLyQNRY7Tpowqaf`
- Immutable URL: `https://deep-space-ledger-9go0su9vd-tentenco.vercel.app`

`lad-pocket.vercel.app` remains the Maggie HTML prototype. Do not deploy the Expo project there. The workspace now links to the independent Expo/API project through gitignored `.vercel/project.json`.

Production uses a Clerk production key and a fresh Neon database. Public routes and unauthenticated/invalid-token API boundaries pass. Apple credentials and the sign-in flag are configured. Clerk DNS, Email and SSL are verified, and the custom Web domain is live. Google sign-in is disabled for the Apple + Email first release; Email/password and cloud/account deletion QA passed; Apple native QA is pending; this deployment is preparation for App Store submission, not a completed authentication release. See `APP_STORE_SUBMISSION_STATUS.md`.

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
vercel deploy --prebuilt --prod --yes --scope tentenco
npm run verify:web-deployment -- https://deep-space-ledger-app.vercel.app
```

`verify:vercel-prebuilt` checks the static output and runs both compiled API handlers under Node to catch unresolved module imports before deployment. Then complete the browser and device journeys in `WEB_RELEASE_CHECKLIST.md`, including real production sign-in and data deletion.

The fresh Neon project is `frosty-shape-90805190`, database `lad_app`. The old development database is separate. `scripts/smoke-cloud-sync.mjs` creates development-only Clerk sessions and is not a production authentication test.

## Historical preview

The August preview used `tentenco/lad-pocket`, with the protected alias `https://lad-pocket-auth-preview.vercel.app`. Those URLs are historical; the current release commands above target the independent project. Support/privacy/account-deletion information remains on `deep-space-ledger-support.vercel.app`.
