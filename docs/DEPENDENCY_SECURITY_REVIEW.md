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
