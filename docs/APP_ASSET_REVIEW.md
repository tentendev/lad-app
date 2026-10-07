# App Store release asset review — 2026-10-07

The owner confirmed that the app does not use game character or event assets. This review records the release files and that factual confirmation; it does not assert a third-party licence.

| Release asset | Use | Review |
| --- | --- | --- |
| `assets/generated/ios-launch/icon-1024.png` | `app.json` icon and splash | Original pearl star and lavender pocket; no character, event artwork or recognizable game logo |
| `assets/generated/ios-launch/brand-mark.png` | Native header | Smaller derivative of the same original icon |
| `assets/generated/ios-launch/onboarding.jpg` | Welcome screen | Original star/pocket artwork; no character or event artwork |
| `public/mobile-bg.webp` | Native page background | Generic purple/blue star field |
| `public/lad-bg.webp` | Web background | Generic purple/blue star field |

The generated artwork's provenance and derivatives are recorded in `assets/generated/ios-launch/generation-receipt.json`. Source references in `app.json`, `src/ui/NativePage.tsx` and `src/ui/WelcomeScreen.tsx` match the files above. The account screen can show the signed-in user's own profile image. Google and Apple sign-in marks identify the authentication providers.

The app contains text labels and dates used for the player's schedule and planning. The owner's statement concerns character/event assets; it is not evidence of an official affiliation. Store copy continues to identify the product as an independent player tool.

App Store Connect Content Rights was saved through its UI as “No, this app does not contain, show, or access third-party content.” A subsequent read of app `6812909987` confirmed `DOES_NOT_USE_THIRD_PARTY_CONTENT`. Local release attestation is `APPLE_CONTENT_RIGHTS_STATUS=not_used`, not `licensed` or `removed`.

Recheck this inventory and declaration if release assets or the way third-party content is accessed change.
