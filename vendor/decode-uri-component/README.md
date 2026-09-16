Based on the MIT-licensed decode-uri-component 0.5.0 npm release (Sam Verschueren). Retains the upstream linear malformed UTF-8 decoder. Only two compatibility changes: CommonJS export; the 0.2.x plus-to-space behavior used by query-string 7. Remove this override once Expo Router upgrades query-string to a dependency that uses the fixed decoder.

Upstream: https://github.com/SamVerschueren/decode-uri-component/releases/tag/v0.5.0
Advisory: https://github.com/advisories/GHSA-vcc3-ghjq-m6fr
