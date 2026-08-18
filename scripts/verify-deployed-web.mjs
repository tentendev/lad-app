import { readFile } from "node:fs/promises";

const targetInput = process.argv[2] ?? process.env.DEPLOYMENT_URL;
if (!targetInput) {
  console.error("Usage: npm run verify:web-deployment -- https://preview.example.vercel.app");
  process.exit(1);
}

const target = new URL(targetInput);
if (target.protocol !== "https:") throw new Error("Deployment verification requires an HTTPS URL.");
target.pathname = "/";
target.search = "";
target.hash = "";

const localPrecache = JSON.parse(await readFile(new URL("../dist/precache-manifest.json", import.meta.url), "utf8"));

async function request(pathname, options = {}) {
  const url = new URL(pathname, target);
  const response = await fetch(url, { redirect: "manual", ...options });
  return { url, response };
}

const root = await request("/");
if (root.response.status !== 307 || root.response.headers.get("location") !== "/schedule") {
  throw new Error(`Root must return 307 -> /schedule; received ${root.response.status} -> ${root.response.headers.get("location") ?? "none"}.`);
}

const routeTitles = {
  "/schedule": "排期｜深空省省",
  "/wallet": "錢包｜深空省省",
  "/calculator": "換算｜深空省省",
  "/about": "關於深空省省｜深空省省",
  "/account": "會員中心｜深空省省",
  "/privacy": "隱私政策｜深空省省",
  "/support": "支援中心｜深空省省",
};
for (const [pathname, title] of Object.entries(routeTitles)) {
  const { response } = await request(pathname);
  const html = await response.text();
  if (response.status !== 200 || !html.includes(`>${title}</title>`)) {
    throw new Error(`${pathname} did not return the expected release page (${response.status}).`);
  }
  if (response.headers.get("x-frame-options") !== "DENY" || response.headers.get("x-content-type-options") !== "nosniff") {
    throw new Error(`${pathname} is missing required security headers.`);
  }
  const csp = response.headers.get("content-security-policy") ?? "";
  if (!csp.includes("frame-ancestors 'none'") || !csp.includes("object-src 'none'")) {
    throw new Error(`${pathname} is missing required CSP boundaries.`);
  }
}

const syncBoundary = await request("/api/sync");
if (syncBoundary.response.status !== 401 || syncBoundary.response.headers.get("cache-control") !== "private, no-store") {
  throw new Error("Cloud sync API did not enforce its unauthenticated no-store boundary.");
}
const accountMethodBoundary = await request("/api/account");
if (accountMethodBoundary.response.status !== 405 || accountMethodBoundary.response.headers.get("allow") !== "DELETE") {
  throw new Error("Account deletion API did not enforce its DELETE-only boundary.");
}
const accountAuthBoundary = await request("/api/account", { method: "DELETE" });
if (accountAuthBoundary.response.status !== 401 || accountAuthBoundary.response.headers.get("cache-control") !== "private, no-store") {
  throw new Error("Account deletion API did not enforce its unauthenticated no-store boundary.");
}

const remotePrecacheResponse = await request("/precache-manifest.json");
if (remotePrecacheResponse.response.status !== 200) throw new Error("Deployed precache manifest is unavailable.");
const remotePrecache = await remotePrecacheResponse.response.json();
if (remotePrecache.version !== localPrecache.version) {
  throw new Error(`Deployment build ${remotePrecache.version ?? "unknown"} does not match local build ${localPrecache.version}.`);
}

const serviceWorker = await request("/sw.js");
const serviceWorkerText = await serviceWorker.response.text();
if (serviceWorker.response.status !== 200 || !serviceWorkerText.includes(`deep-space-ledger-${localPrecache.version}`)) {
  throw new Error("Deployed service worker does not match the local release build.");
}
if (serviceWorker.response.headers.get("cache-control") !== "public, max-age=0, must-revalidate") {
  throw new Error("Deployed service worker does not have the required revalidation policy.");
}

const representativeAsset = localPrecache.assets.find((asset) => asset.startsWith("/_expo/static/"));
if (!representativeAsset) throw new Error("Local precache manifest has no hashed Expo asset.");
const asset = await request(representativeAsset);
if (asset.response.status !== 200 || asset.response.headers.get("cache-control") !== "public, max-age=31536000, immutable") {
  throw new Error("Deployed hashed asset does not have the required immutable cache policy.");
}

const missing = await request("/__release_verifier_missing_route__");
const missingHtml = await missing.response.text();
if (missing.response.status !== 404 || !missingHtml.includes('name="robots" content="noindex"')) {
  throw new Error("Deployment does not return the branded noindex 404 response.");
}

console.log(`Deployed Web verified: ${target.origin} matches build ${localPrecache.version}.`);
console.log("Routes, sync/account auth boundaries, 307 redirect, 404, CSP, frame policy, service worker, and immutable assets passed.");
