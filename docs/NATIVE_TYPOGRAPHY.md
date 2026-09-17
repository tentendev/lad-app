# Native typography and readable UI — 2026-09-17

Scope: all native iOS/Android routes and shared native UI. The user requested a Google-informed mobile readability pass and TestFlight upload. Web has a separate renderer and is covered by its existing export checks.

## Type system

Follow [Material 3 typography](https://developer.android.com/develop/ui/compose/designsystems/material3#typography) and [Google accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/apps). Use the platform system sans serif and native Chinese fallback, with regular/semibold weights.

| Role | Size / line height | Use |
| --- | --- | --- |
| label | 14 / 20 | Supporting metadata, status, calendar bars, navigation |
| body | 16 / 24 | Reading, forms, button labels, errors |
| title-sm | 18 / 26 | Brand and compact values |
| title | 22 / 28 | Section titles |
| headline | 28 / 36 | Page titles |
| display | 36 / 44 | Primary budget/cost values |

`src/native.css` owns the roles. Use `type-*` utilities: HeroUI's class merger can mistake custom `text-*` roles for colors and remove their sizes when a text color follows. Do not reintroduce 9–12pt text or local line heights. Supporting text has a 14pt floor for Traditional Chinese; this is a product choice above Material's smallest label sizes.

Body and input text support unlimited system scaling, without shrink-to-fit. Five-tab navigation scales up to 2× so every destination remains visible and tappable; tab height follows that scale. Larger system text or screens below 360pt default to the schedule list and stack metric cards.

## Layout and controls

- NativeInput sets 16/24 font metrics and a 56pt minimum height while preserving focus/blur refs and native keyboard behavior.
- HeroUI small controls have a 48×48pt minimum touch area; main controls have a 56pt minimum height. Heights grow with content.
- Persistent field labels, errors, and selected accessibility states remain intact. NativeLink supplies a minimum 48pt target for policy/support navigation.
- Text uses solid light colors on opaque purple cards. Background imagery is dimmed behind uncontained copy.
- Calendar bars increase from 9pt/14pt-high to 14pt with scaled line height and padding. Week height depends on occupied lanes. Days have at least 48pt width; narrow screens can scroll the calendar horizontally.
- Calendar bars are an overview and may ellipsize. Selecting a date opens the list with complete event names, status, date range, and actions. Screen readers use labeled dates and complete event rows, without duplicate decorative bar announcements.
- NativeMetricGrid stacks numeric summaries for large fonts. Dates keep their heading separate from Cancel/Done. First-use and missing-route pages use the same readable roles.

## Builds and boundaries

User-confirmed release scope (2026-09-17): internal UI testing, using the existing test environment. Build with `testflight-ui` and EAS environment `preview`; do not wait for production login/cloud setup to complete this internal release. The original authorization to package and upload to TestFlight remains in effect. Apple distribution signing and App Store Connect authentication are still required.

`testflight-ui` extends production signing/version settings but uses the existing preview environment for internal UI testing. It is a store-distribution binary for TestFlight, distinct from EAS's ad-hoc `preview` profile. It is not evidence that production authentication/cloud services or App Review prerequisites are complete. Existing production submission gates stay unchanged; do not set confirmation flags to skip them.

Commands after Apple credentials have been configured:

```sh
npm run release:ios:validate
npx eas-cli build --platform ios --profile testflight-ui
npx eas-cli submit --platform ios --profile production --id BUILD_ID
```

Only distribute this preview-backed build to internal UI testers. Production service configuration, real-device OAuth/cloud tests and App Review remain separate outstanding work recorded in `IOS_RELEASE_PREPARATION.md`.

## Runtime Dynamic Type

React Native 0.86 Fabric retains stale text measurements when iOS text size changes while the process is running (https://github.com/react/react-native/issues/57512). Native screens import `Typography` and `Button` through `NativeComponents`; only text/control leaves remount when `fontScale` changes. The same treatment applies to `NativeInput` and tab labels. Screen state, navigation and date-modal state stay mounted, and controlled input values remain intact. This avoids resetting the whole application or limiting the user's requested text size. A focused input may lose focus during a system font-size change.

Verified in the simulator without restarting: standard → accessibility-large → standard, including a 70-pull input and its calculated result.
