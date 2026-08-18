# Vercel preview receipt

Recorded: 2026-08-14 05:02 CST

## Deployment

- Project: `tentenco/lad-pocket`
- Deployment ID: `dpl_85gGeozyhrqeAaxa92V2yf6meLp1`
- Target: preview
- State: READY
- URL: `https://lad-pocket-723hs0uaf-tentenco.vercel.app`
- Local/prebuilt build ID: `b492826fe5d3`

The deployment was created with `vercel deploy --prebuilt --archive=tgz --scope tentenco`, so Vercel uploaded the already verified `.vercel/output` instead of rebuilding source remotely.

## Remote verification

The preview is protected by Vercel Team SSO. Anonymous HTTP receives a Vercel login redirect; authenticated `vercel curl --deployment` was used to verify the actual application response without disabling protection.

- `/`: 307 to `/schedule`
- `/schedule`, `/wallet`, `/calculator`, `/about`: 200 with the expected route titles
- Missing route: branded 404 with `noindex`
- `precache-manifest.json`: build `b492826fe5d3`, 20 assets
- `sw.js`: matching versioned cache and `public, max-age=0, must-revalidate`
- Representative hashed Expo asset: `public, max-age=31536000, immutable`
- CSP, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`: pass

## Production boundary

No production promotion occurred. `https://lad-pocket.vercel.app` still resolves to deployment `dpl_2ztr28exf8sy3BPXYP5T2Ye8UsU3`, created 2026-08-13 18:58 CST.
