# Production Dependency Security Review

Review date: 2026-08-19

`npm audit --omit=dev` currently expands three reviewed advisory URLs through the Expo／React Native／Clerk dependency graph and reports 40 affected dependency entries (18 moderate, 22 high, 0 critical). The count does not represent 40 independent exploitable flaws.

## Reviewed root advisories

1. `GHSA-w3rx-r6r6-pgpr` — `image-size` ICNS parser infinite loop.
2. `GHSA-5p2g-fcmc-qvqq` — `image-size` JXL／HEIF parser infinite loops.
3. `GHSA-w5hq-g745-h8pq` — `uuid <11.1.1` caller-supplied buffer bounds issue in v3／v5／v6.

## Exposure and mitigation

- `image-size` is reached through Metro, the Expo／React Native build tool. The published App does not accept user-uploaded ICNS、JXL or HEIF files for Metro to inspect. All build images are repository-controlled PNG／WebP assets. There is no fixed `image-size` release compatible with Metro at review time.
- Affected `uuid` copies come from Expo's `xcode` build helper and Clerk's optional Solana wallet dependency. This App does not expose UUID v3／v5／v6 with a caller-supplied output buffer and does not implement crypto wallet features.
- `npm audit fix --force` proposes downgrading Expo／React Native／Clerk to incompatible releases. That would violate Expo SDK 57 compatibility and is not an acceptable remediation.
- Build inputs must remain trusted. Do not run Metro／prebuild against images or config supplied by an untrusted user.
- Recheck after every dependency update. Upgrade promptly when Expo／Metro／Clerk publish compatible fixed dependency ranges.

## Automated gate

`npm run security:audit` allows only the three reviewed advisory URLs above and fails on any new root advisory or critical finding. An allowlist is a review record, not a claim that the upstream issue is fixed.


## 2026-09-17 release review

- Updated to Expo 57.0.23 / React Native 0.86.3 and the SDK-matched patch versions; Expo Doctor passes 21/21 checks.
- Updated `@xmldom/xmldom` (0.8.15 / 0.9.12) and `js-yaml` (4.3.2), removing the newly reported XML/YAML advisories.
- Fixed [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) in the URL decoding path used by Expo Router. Upstream 0.5.0 is ESM-only while query-string 7 uses CommonJS. `vendor/decode-uri-component` contains the upstream 0.5.0 decoder with its MIT license, a CommonJS export, and retained 0.2.x plus-to-space semantics. A regression test exercises Unicode, callbacks, repeated parameters, and 150 KB of malformed percent encoding under a child-process timeout. Remove the compatibility package when Expo Router's query-string dependency adopts the fixed upstream decoder.
- Reviewed [GHSA-528h-pc64-c93x](https://github.com/advisories/GHSA-528h-pc64-c93x): the affected APIs are stream-json path filters. The only dependency path is Clerk → optional Solana wallet → jayson. Its browser entry has no stream-json import; its Node helper only imports `StreamValues` and `Verifier`, not affected filters. The app does not offer Solana wallet features or import stream-json. The release audit now validates those specific imports and rejects the exception if app/API code starts importing stream-json. This is an exposure exception, not a claim that stream-json 1.9.1 is fixed. The fixed 3.5.0 has a different API/module layout and is not substituted into jayson's CommonJS 1.x integration.
- The existing image-size and uuid build/unused-wallet exceptions remain; no critical or unreviewed root advisories are accepted.
