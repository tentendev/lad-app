# Production Dependency Security Review

Review date: 2026-10-07

## 2026-10-07 production release review

- Updated Expo and the SDK 57 packages to Expo Doctor's compatible patch versions.
- Updated `shell-quote` to 1.12.0, removing the critical [command-injection advisory](https://github.com/advisories/GHSA-pqg4-j6r4-53mv), and `source-map-js` to 1.2.2, removing [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).
- Updated the compatible Clerk JS dependency to 6.38.0. Its dependency graph no longer includes Solana, jayson or stream-json. All three stream-json advisories are absent, and the previous stream-json exposure exception was removed from the audit gate.
- Reviewed [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). There is no fixed `braces` release. `npm ls braces --omit=dev --all --json` reports only `expo → @expo/metro → metro-file-map → micromatch → braces`. Metro's watcher matches repository-controlled glob configuration; the App and API do not parse user-supplied glob patterns. The audit accepts this build-tool exposure only while that exact dependency path remains and App/API source has no braces, micromatch or metro-file-map imports. Untrusted build configuration remains prohibited. This is an exposure assessment, not an upstream fix.
- The current audit has 33 transitive findings, five reviewed root advisories, and zero critical findings. Existing image-size, uuid and node-forge limitations remain below. New advisories, critical findings, changed guarded dependency paths and invalid audit responses block release.

## 2026-10-03 synchronization review

- Updated SDK 57 compatible Expo packages to the versions reported by Expo Doctor.
- Updated compatible `brace-expansion` copies to remove the newly reported recursion and quadratic expansion denial-of-service advisories (`GHSA-q2hr-2g5m-vwhr`, `GHSA-qhr7-859c-m2p7`, `GHSA-6j4f-fj2g-mc7p`).
- Reviewed [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), node-forge RSA signature verification with extra nested ASN.1 elements. No patched version is available. `npm ls node-forge --omit=dev --json` confines every path to Expo → Expo CLI, directly or through its code-signing certificate helper. This app has no `expo-updates` client, takes no certificates or keys from users, and its app/API code does not import forge or Expo's certificate helper. The helper signs locally generated developer manifests and validates locally supplied signing material; native release signing uses Apple/EAS, and authentication uses Clerk/Jose rather than forge. The audit allows this tooling-only exposure only while those dependency and source conditions hold. This records exposure, not a fix to the upstream library; continue to use trusted build/signing inputs and remove the exception when upstream is fixed.

At that review, `npm audit --omit=dev` reported 30 affected dependency entries (0 critical). These transitive counts do not represent independent exploitable flaws; the current result is recorded above.

## Reviewed root advisories

1. `GHSA-w3rx-r6r6-pgpr` — `image-size` ICNS parser infinite loop.
2. `GHSA-5p2g-fcmc-qvqq` — `image-size` JXL／HEIF parser infinite loops.
3. `GHSA-w5hq-g745-h8pq` — `uuid <11.1.1` caller-supplied buffer bounds issue in v3／v5／v6.
4. `GHSA-528h-pc64-c93x` — unused stream-json path-filter APIs in Clerk’s optional wallet dependency; conditionally accepted as described below.

## Exposure and mitigation

- `image-size` is reached through Metro, the Expo／React Native build tool. The published App does not accept user-uploaded ICNS、JXL or HEIF files for Metro to inspect. All build images are repository-controlled PNG／WebP assets. There is no fixed `image-size` release compatible with Metro at review time.
- Affected `uuid` copies come from Expo's `xcode` build helper and Clerk's optional Solana wallet dependency. This App does not expose UUID v3／v5／v6 with a caller-supplied output buffer and does not implement crypto wallet features.
- `npm audit fix --force` proposes downgrading Expo／React Native／Clerk to incompatible releases. That would violate Expo SDK 57 compatibility and is not an acceptable remediation.
- Build inputs must remain trusted. Do not run Metro／prebuild against images or config supplied by an untrusted user.
- Recheck after every dependency update. Upgrade promptly when Expo／Metro／Clerk publish compatible fixed dependency ranges.

## Automated gate

`npm run security:audit` allows only the current reviewed advisory URLs (with dependency/import exposure guards for braces and node-forge) and fails on any new root advisory or critical finding. An allowlist is a review record, not a claim that the upstream issue is fixed.


## 2026-09-17 release review

- Updated to Expo 57.0.23 / React Native 0.86.3 and the SDK-matched patch versions; Expo Doctor passes 21/21 checks.
- Updated `@xmldom/xmldom` (0.8.15 / 0.9.12) and `js-yaml` (4.3.2), removing the newly reported XML/YAML advisories.
- Fixed [GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) in the URL decoding path used by Expo Router. Upstream 0.5.0 is ESM-only while query-string 7 uses CommonJS. `vendor/decode-uri-component` contains the upstream 0.5.0 decoder with its MIT license, a CommonJS export, and retained 0.2.x plus-to-space semantics. A regression test exercises Unicode, callbacks, repeated parameters, and 150 KB of malformed percent encoding under a child-process timeout. Remove the compatibility package when Expo Router's query-string dependency adopts the fixed upstream decoder.
- Reviewed [GHSA-528h-pc64-c93x](https://github.com/advisories/GHSA-528h-pc64-c93x): the affected APIs are stream-json path filters. The only dependency path is Clerk → optional Solana wallet → jayson. Its browser entry has no stream-json import; its Node helper only imports `StreamValues` and `Verifier`, not affected filters. The app does not offer Solana wallet features or import stream-json. The release audit now validates those specific imports and rejects the exception if app/API code starts importing stream-json. This is an exposure exception, not a claim that stream-json 1.9.1 is fixed. The fixed 3.5.0 has a different API/module layout and is not substituted into jayson's CommonJS 1.x integration.
- The existing image-size and uuid build/unused-wallet exceptions remain; no critical or unreviewed root advisories are accepted.
