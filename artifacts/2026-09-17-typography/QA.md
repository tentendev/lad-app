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
- A new isolated iPhone 17e simulator was created for first-use QA. The initial welcome panel and Start Planning action were visually inspected. Screenshot capture was interrupted when all simulators were shut down; no saved onboarding screenshot is claimed for that attempt.

The screenshots outside `final-build/` and `intermediate-build/` use a locally embedded Hermes bundle in the previous EAS simulator binary. They are iteration evidence, not proof of the final full native build. The final build receipt and separate screenshots will identify the downloaded, unmodified EAS artifact.

## Measured contrast

`contrast.json` records WCAG sRGB luminance calculations for primary supporting color pairs and every pixel in the app background composited with its 75% scrim. Minimum measured supporting-text contrast is 5.25:1 across the listed pairs; event-bar text also passes, with the lowest event color pair at 4.82:1. This is a targeted color check, not a full WCAG audit.

## Release blocker

A signed TestFlight build was attempted using the `testflight-ui` profile. EAS incremented the remote build number to 2, then failed because this app has no configured distribution signing credentials. A credential setup attempt reached the Apple ID password prompt for dev@tenten.co; there is no available cached Apple session or local valid signing identity. No password was requested in chat, no IPA was generated, and nothing was uploaded to TestFlight.

The user has been asked to complete Apple login and credential setup through `npx eas-cli credentials --platform ios`. Existing production service and App Review prerequisites remain unchanged.

## Runtime font-size regression

The full native build at source e2e41fb reproduced React Native 0.86's stale text measurement issue after changing system font size while the app remained alive (https://github.com/react/react-native/issues/57512). Its screenshots are under `intermediate-build/`; it is superseded.

Source 3258d4f adds leaf-level text/control remounting on font-scale changes without remounting screens or forms. Locally embedded release QA verified standard → accessibility-large → standard reflow without restarting the process. A 70-pull input and NT$1,295 result remained intact. The complete validation command passed again after this fix.
