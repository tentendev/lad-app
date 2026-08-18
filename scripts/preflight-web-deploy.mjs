import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const expected = {
  project: "lad-pocket",
  scope: "tentenco",
  productionUrl: "https://lad-pocket.vercel.app",
};

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${output}`);
  }
  return output;
}

const vercelExecutable = process.platform === "win32" ? "vercel.cmd" : "vercel";
const projectFile = path.join(process.cwd(), ".vercel", "project.json");
const vercelConfigFile = path.join(process.cwd(), "vercel.json");

await access(projectFile).catch(() => {
  throw new Error(
    `This workspace is not linked. Run: vercel link --project ${expected.project} --scope ${expected.scope} --yes`,
  );
});

const project = JSON.parse(await readFile(projectFile, "utf8"));
if (project.projectName !== expected.project) {
  throw new Error(`Refusing deployment preflight for linked project ${project.projectName ?? "unknown"}; expected ${expected.project}.`);
}

const vercelConfig = JSON.parse(await readFile(vercelConfigFile, "utf8"));
if (vercelConfig.buildCommand !== "npm run export:web" || vercelConfig.outputDirectory !== "dist") {
  throw new Error("vercel.json must build with npm run export:web and publish dist/.");
}

run(process.execPath, ["scripts/verify-web-export.mjs"]);
run(process.execPath, ["scripts/verify-vercel-prebuilt.mjs"]);

const account = run(vercelExecutable, ["whoami"])
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => line && !line.startsWith("Vercel CLI"));
if (!account) throw new Error("Vercel CLI did not return an authenticated account.");

const projectInspection = run(vercelExecutable, ["project", "inspect", expected.project, "--scope", expected.scope]);
if (!projectInspection.includes(`Name\t\t\t${expected.project}`) || !projectInspection.includes("Owner\t\t\ttenten Vercel Pro")) {
  throw new Error(`Vercel project inspection did not resolve ${expected.scope}/${expected.project}.`);
}

const deploymentInspection = run(vercelExecutable, ["inspect", expected.productionUrl, "--scope", expected.scope]);
if (!deploymentInspection.includes(`name\t${expected.project}`) || !deploymentInspection.includes("target\tproduction") || !deploymentInspection.includes("status\t● Ready")) {
  throw new Error(`Production alias ${expected.productionUrl} is not a ready ${expected.project} deployment.`);
}

const response = await fetch(expected.productionUrl, { method: "HEAD", redirect: "follow" });
if (!response.ok) throw new Error(`${expected.productionUrl} returned HTTP ${response.status}.`);

console.log(`Web deploy preflight passed for ${expected.scope}/${expected.project}.`);
console.log(`Authenticated Vercel account: ${account}.`);
console.log(`Existing production alias is healthy: ${expected.productionUrl} (${response.status}).`);
console.log("No deployment was created. The verified .vercel/output is ready for an owner-approved prebuilt preview.");
