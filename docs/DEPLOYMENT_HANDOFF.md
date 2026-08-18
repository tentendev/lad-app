# Web deployment handoff

## Confirmed target

- Vercel scope: `tentenco`
- Project: `lad-pocket`
- Existing production alias: `https://lad-pocket.vercel.app`
- Local release build: `59fd4733ce87`
- Stable verified preview: `https://lad-pocket-auth-preview.vercel.app`
- Immutable deployment: `https://lad-pocket-7y6eezg5g-tentenco.vercel.app`

The workspace is linked through gitignored `.vercel/project.json`. Vercel environment and OIDC files are local credentials: never commit them, paste them into issues, or include them in release artifacts.

The verified preview is currently protected by Vercel Team SSO. Members with `tentenco` access can open it after signing in. Making it anonymous-public requires an explicit deployment-protection decision and is not implied by creating a preview.

Preview environment contains the Expo Clerk publishable key plus sensitive Clerk server and Neon variables. Production environment and `https://lad-pocket.vercel.app` were not changed. The preview includes Email／密碼註冊、Email verification、Google sign-in 與 `api/sync`; browser QA completed password sign-in, Client Trust verification and sign-out, with all temporary Clerk users and Neon rows removed afterward.

## Reproducible preview path

```bash
npm run release:web
vercel build --yes --scope tentenco
npm run verify:vercel-prebuilt
npm run preflight:web-deploy
vercel deploy --prebuilt --archive=tgz --scope tentenco
```

The first four commands are local/read-only gates. The fifth creates an external preview deployment and therefore requires explicit owner approval.

After receiving the preview URL:

```bash
npm run verify:web-deployment -- https://PREVIEW_URL
```

Then perform the browser journey and width checks in `docs/WEB_RELEASE_CHECKLIST.md`. Do not promote a preview if its build ID differs from the local receipt or any automated/manual gate fails.

## Production promotion

Production promotion changes the public reference site and requires a separate owner decision:

```bash
vercel promote https://VERIFIED_PREVIEW_URL --scope tentenco
npm run verify:web-deployment -- https://lad-pocket.vercel.app
```

Confirm canonical/social URLs and legal wording before promotion. Keep the previous production deployment ID available for rollback.
