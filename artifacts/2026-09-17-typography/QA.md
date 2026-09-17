# Native typography QA — 2026-09-17

The typography audit is scoped to native UI, not production authentication or complete accessibility certification.

## Verified interactions

- iPhone 17e, standard iOS text size: readable titles, supporting text, form labels, calendar bars, tab labels and account entry.
- Date selection changes calendar to the complete event list, including full name, status and date range. Month/list toggles retain the underlying filter model.
- Wallet: entered and saved a NT$3,000 test budget; it remained after app restart and subsequent tab navigation. Numeric software keyboard leaves the active field visible.
- Calculator: a 70-pull target returned NT$1,295 and 55 paid-pack pulls; applying it selected 16 packs. Handoff populated wallet amount 1295 and pack details without silently adding an expense.
- iPhone accessibility-large text: header wraps, schedule defaults to list, metric cards stack, NT$1,295 is readable, button heights grow, all five tabs remain reachable.
- Date modal at accessibility-large: title, Cancel and Done remain separate and visible. Cancelling an unset goal deadline left it unset.
- Account: visible email/password labels, registration/sign-in selector, return action and supporting copy inspected at standard size. No real sign-in or user credentials were submitted.
- iPad Pro 13-inch: bounded content width, larger readable calendar bars and complete page structure inspected.
- A new isolated iPhone 17e simulator was created for first-use QA. After the runtime font fix, the welcome panel was captured at standard size (`iphone-onboarding.png`), live enlargement preserved readable wrapping, and the Start Planning accessibility action opened the schedule. Pointer-driven scrolling on the enlarged welcome page could not be verified through the desktop automation session.

The screenshots outside `final-build/` and `intermediate-build/` use a locally embedded Hermes bundle in the previous EAS simulator binary. They are iteration evidence, not proof of the final full native build. The final build receipt and separate screenshots will identify the downloaded, unmodified EAS artifact.

## Measured contrast

`contrast.json` records WCAG sRGB luminance calculations for primary supporting color pairs and every pixel in the app background composited with its 75% scrim. Minimum measured supporting-text contrast is 5.25:1 across the listed pairs; event-bar text also passes, with the lowest event color pair at 4.82:1. This is a targeted color check, not a full WCAG audit.

## Release blocker

The user explicitly confirmed on 2026-09-17 that this release is for internal UI testing and must use the existing test environment. `testflight-ui` → `preview` is the approved build/environment pairing. Production authentication and cloud setup are outside this internal release's completion criteria; missing Apple signing credentials remain the immediate blocker.

A signed TestFlight build was attempted using the `testflight-ui` profile. EAS incremented the remote build number to 2, then failed because this app has no configured distribution signing credentials. A credential setup attempt reached the Apple ID password prompt for dev@tenten.co; there is no available cached Apple session or local valid signing identity. No password was requested in chat, no IPA was generated, and nothing was uploaded to TestFlight.

The user has been asked to complete Apple login and credential setup through `npx eas-cli credentials --platform ios`. Existing production service and App Review prerequisites remain unchanged.

## Runtime font-size regression

The full native build at source e2e41fb reproduced React Native 0.86's stale text measurement issue after changing system font size while the app remained alive (https://github.com/react/react-native/issues/57512). Its screenshots are under `intermediate-build/`; it is superseded.

Source 3258d4f adds leaf-level text/control remounting on font-scale changes without remounting screens or forms. Locally embedded release QA verified standard → accessibility-large → standard reflow without restarting the process. A 70-pull input and NT$1,295 result remained intact. The complete validation command passed again after this fix.

## Final full native build

Build `d7e1be8d-f37b-4922-acff-920be856eaf0`, source `e688e2043b3eadc46e2f9f2e0ccd4ca9830a7e25`, finished successfully at 2026-09-17 02:50:56 UTC. The downloaded archive was extracted without modification and installed on the isolated iPhone 17e. Its installed Hermes bundle hash matches the archive. Startup, live standard → accessibility-large → standard reflow, and calendar date → full list were visually verified. See `final-build/receipt.json` and the three screenshots.

The simulator binary reports version 1.0.0, build 1; EAS metadata reports the remote build counter 2. This simulator artifact is not an IPA and cannot be uploaded to TestFlight. No TestFlight release was created.

## Signing blocker resolved through Ego Lite

On the user's request to retry through Ego Lite, the authenticated Apple browser session was used to create an Apple Distribution certificate, an App Store profile scoped to this app, and a dedicated Developer-role upload API key. Matching certificate/profile and App Store entitlements were checked locally; Apple API access to this app returned HTTP 200. Build credentials and the upload key are now assigned to this EAS project. Private signing material remains outside the repository, and `credentials.json` is ignored. See `signing-setup.json`. The previously recorded credential failure is historical; the signed TestFlight build and upload are the remaining steps.
