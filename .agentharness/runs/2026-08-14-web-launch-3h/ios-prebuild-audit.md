# iOS prebuild audit

Date: 2026-08-14 CST

The audit ran `expo prebuild --platform ios --no-install --clean` in an isolated temporary copy so no generated native project or placeholder signing identifier entered the working tree.

## Confirmed output

- Display name: `深空省省`
- Marketing version: `1.0`
- Build version: `1`
- Device family: iPhone and iPad (`1,2`)
- Orientation: portrait on iPhone; portrait and landscape on iPad
- URL scheme: `deep-space-ledger`
- Minimum system value emitted by Expo: iOS 12.0
- Encryption declaration: `ITSAppUsesNonExemptEncryption=false`
- App privacy manifest: no collected data, tracking false, no tracking domains
- App icon: generated 1024×1024 asset
- Launch screen: original lavender `#7765a7`, neutral white diamond, 132pt display width, transparent 1x/2x/3x assets
- Appearance: dark (`UIUserInterfaceStyle=Dark`)
- Final standalone Hermes export: 6.1 MiB

## External blocker confirmed

Because the owner has not supplied an identifier, Expo correctly fell back to `com.anonymous.deep-space-ledger` in the temporary audit. That value is not release-safe and was not added to `app.json`. A signed archive must wait for the real bundle identifier and Apple team.

Xcode 26.6 and the iOS 26.5 SDK are installed, but `simctl` reports no available runtime/device and CocoaPods is not installed. The bundle is export-verified, not simulator- or device-certified.
