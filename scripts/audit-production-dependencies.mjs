import { spawnSync } from "node:child_process";

const acceptedAdvisories = new Set([
  "https://github.com/advisories/GHSA-w3rx-r6r6-pgpr",
  "https://github.com/advisories/GHSA-5p2g-fcmc-qvqq",
  "https://github.com/advisories/GHSA-w5hq-g745-h8pq",
]);

const audit = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
  cwd: process.cwd(),
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error("Production dependency audit did not return valid JSON.");
  if (audit.stderr) console.error(audit.stderr.trim());
  process.exit(1);
}

const advisories = new Set();
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const cause of vulnerability.via ?? []) {
    if (typeof cause === "object" && cause?.url) advisories.add(cause.url);
  }
}

const unknown = [...advisories].filter((url) => !acceptedAdvisories.has(url));
const critical = report.metadata?.vulnerabilities?.critical ?? 0;
if (critical > 0 || unknown.length > 0) {
  console.error("Production dependency audit found a new release blocker.");
  if (critical > 0) console.error(`- Critical advisories: ${critical}`);
  for (const url of unknown) console.error(`- Unreviewed advisory: ${url}`);
  process.exit(1);
}

const counts = report.metadata?.vulnerabilities ?? {};
console.log(`Production dependency audit reviewed: ${counts.total ?? 0} transitive findings, ${advisories.size} accepted root advisories, 0 critical.`);
console.log("Accepted advisories and mitigations are documented in docs/DEPENDENCY_SECURITY_REVIEW.md.");
