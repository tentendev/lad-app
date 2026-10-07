import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const auditScript = fileURLToPath(new URL("./audit-production-dependencies.mjs", import.meta.url));
const bracesAdvisory = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
const streamAdvisory = "https://github.com/advisories/GHSA-528h-pc64-c93x";
function dependencyChain(names) {
  return names.reduceRight((child, name) => ({ dependencies: { [name]: child } }), {});
}

function runGate({ source = "", alternatePath = false, critical = 0, advisory = bracesAdvisory, invalid = false } = {}) {
  const directory = mkdtempSync(path.join(tmpdir(), "lad-audit-gate-"));
  try {
    for (const name of ["bin", "src", "api"]) mkdirSync(path.join(directory, name));
    writeFileSync(path.join(directory, "package.json"), JSON.stringify({ dependencies: {} }));
    writeFileSync(path.join(directory, "src", "app.ts"), source);
    const fixture = {
      braces: dependencyChain(alternatePath ? ["runtime-package", "braces"] : ["expo", "@expo/metro", "metro-file-map", "micromatch", "braces"]),
      forge: dependencyChain(["expo", "@expo/cli", "node-forge"]),
      audit: invalid ? { error: { code: "NETWORK_ERROR" } } : {
        metadata: { vulnerabilities: { critical, total: 1 } },
        vulnerabilities: { braces: { via: [{ url: advisory }] } },
      },
    };
    writeFileSync(path.join(directory, "fixture.json"), JSON.stringify(fixture));
    const npm = path.join(directory, "bin", "npm");
    writeFileSync(npm, `#!/usr/bin/env node
const fs = require("node:fs");
const data = JSON.parse(fs.readFileSync("fixture.json", "utf8"));
const key = process.argv[2] === "audit" ? "audit" : process.argv[3] === "braces" ? "braces" : "forge";
process.stdout.write(JSON.stringify(data[key]));
`);
    chmodSync(npm, 0o755);
    return spawnSync(process.execPath, [auditScript], {
      cwd: directory,
      env: { ...process.env, PATH: `${path.join(directory, "bin")}${path.delimiter}${process.env.PATH}` },
      encoding: "utf8",
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("reviewed Metro-only braces exposure passes without the removed wallet dependency", () => {
  const result = runGate();
  assert.equal(result.status, 0, result.stderr);
});

for (const [label, options, message] of [
  ["runtime glob import", { source: 'import braces from "braces";' }, "Unreviewed advisory"],
  ["new braces dependency path", { alternatePath: true }, "Unreviewed advisory"],
  ["critical finding", { critical: 1 }, "Critical advisories"],
  ["removed stream-json exception", { advisory: streamAdvisory }, "Unreviewed advisory"],
  ["incomplete audit response", { invalid: true }, "did not return valid JSON"],
]) {
  test(`release audit rejects ${label}`, () => {
    const result = runGate(options);
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(message), result.stderr);
  });
}
