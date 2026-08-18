import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const app = JSON.parse(await readFile(new URL("../app.json", import.meta.url), "utf8"));
const eas = JSON.parse(await readFile(new URL("../eas.json", import.meta.url), "utf8"));
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const expo = app.expo ?? {};
const ios = expo.ios ?? {};

function fail(message) {
  console.error(`iOS build preflight blocked: ${message}`);
  process.exit(1);
}

const bundleIdentifier = ios.bundleIdentifier?.trim();
if (!bundleIdentifier) {
  fail("owner input required; add the approved ios.bundleIdentifier to app.json before an EAS build.");
}
if (!/^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z0-9-]+)+$/.test(bundleIdentifier) || bundleIdentifier.startsWith("com.anonymous.")) {
  fail(`invalid or placeholder iOS bundle identifier: ${bundleIdentifier}`);
}
if (ios.infoPlist?.ITSAppUsesNonExemptEncryption !== false) {
  fail("iOS export-compliance declaration must remain explicitly false.");
}
const collectedTypes = new Set((ios.privacyManifests?.NSPrivacyCollectedDataTypes ?? []).map((entry) => entry.NSPrivacyCollectedDataType));
for (const requiredType of [
  "NSPrivacyCollectedDataTypeName",
  "NSPrivacyCollectedDataTypeEmailAddress",
  "NSPrivacyCollectedDataTypeUserID",
  "NSPrivacyCollectedDataTypeDeviceID",
  "NSPrivacyCollectedDataTypeOtherDiagnosticData",
  "NSPrivacyCollectedDataTypeCustomerSupport",
  "NSPrivacyCollectedDataTypeOtherFinancialInfo",
  "NSPrivacyCollectedDataTypeOtherUserContent",
]) {
  if (!collectedTypes.has(requiredType)) fail(`privacy manifest is missing Clerk account data declaration: ${requiredType}.`);
}
if (ios.privacyManifests?.NSPrivacyTracking !== false) {
  fail("the app must keep its no-tracking declaration.");
}
if (ios.usesAppleSignIn !== true) {
  fail("Sign in with Apple entitlement must remain enabled while Google sign-in is offered.");
}
const plugins = new Set((expo.plugins ?? []).map((plugin) => Array.isArray(plugin) ? plugin[0] : plugin));
if (!plugins.has("expo-apple-authentication")) {
  fail("expo-apple-authentication plugin is required for native Sign in with Apple.");
}
for (const dependency of ["@clerk/expo", "expo-apple-authentication", "expo-crypto", "expo-secure-store"]) {
  if (!packageJson.dependencies?.[dependency]) fail(`required authentication dependency is missing: ${dependency}.`);
}
if (eas.cli?.appVersionSource !== "remote" || eas.cli?.requireCommit !== true || eas.build?.production?.autoIncrement !== true) {
  fail("EAS production must require committed source and use remote versions with automatic build-number increments.");
}
if (eas.build?.["ios-simulator"]?.ios?.simulator !== true || eas.build?.preview?.distribution !== "internal") {
  fail("EAS profiles must retain an iOS Simulator build and an internal preview build.");
}
for (const profile of ["ios-simulator", "preview", "production"]) {
  if (eas.build?.[profile]?.ios?.image !== "sdk-57") {
    fail(`EAS ${profile} must use the SDK 57 image so the iOS 26 SDK requirement is explicit.`);
  }
}

const npxExecutable = process.platform === "win32" ? "npx.cmd" : "npx";
const config = spawnSync(npxExecutable, ["expo", "config", "--type", "public", "--json"], {
  cwd: process.cwd(),
  encoding: "utf8",
});
if (config.status !== 0) fail(`Expo config resolution failed:\n${config.stderr}`);
const resolved = JSON.parse(config.stdout);
if (resolved.ios?.bundleIdentifier !== bundleIdentifier) {
  fail("resolved Expo config does not contain the approved iOS bundle identifier.");
}

console.log(`iOS build preflight passed for ${bundleIdentifier}.`);
console.log("Profiles available: ios-simulator, preview, production. No build or submission was started.");
