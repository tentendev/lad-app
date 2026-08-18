import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const distDirectory = path.join(root, "dist");
const outputDirectory = path.join(root, ".vercel", "output");
const staticDirectory = path.join(outputDirectory, "static");
const functionsDirectory = path.join(outputDirectory, "functions");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }))).flat();
}

function digest(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

const config = JSON.parse(await readFile(path.join(outputDirectory, "config.json"), "utf8"));
if (config.version !== 3) throw new Error("Vercel prebuilt output must use Build Output API version 3.");

const routes = config.routes ?? [];
const rootRedirect = routes.find((route) => route.src === "^/$");
if (rootRedirect?.status !== 307 || rootRedirect.headers?.Location !== "/schedule") {
  throw new Error("Vercel prebuilt output lost the temporary root redirect to /schedule.");
}
const globalHeaders = routes.find((route) => route.src === "^(?:/(.*))$")?.headers ?? {};
if (globalHeaders["X-Frame-Options"] !== "DENY" || !globalHeaders["Content-Security-Policy"]?.includes("frame-ancestors 'none'")) {
  throw new Error("Vercel prebuilt output lost its global frame and CSP protections.");
}
const serviceWorkerHeaders = routes.find((route) => route.src === "^/sw\\.js$")?.headers ?? {};
const staticHeaders = routes.find((route) => route.src === "^/_expo/static(?:/(.*))$")?.headers ?? {};
if (serviceWorkerHeaders["Cache-Control"] !== "public, max-age=0, must-revalidate") {
  throw new Error("Vercel prebuilt output must revalidate the service worker.");
}
if (staticHeaders["Cache-Control"] !== "public, max-age=31536000, immutable") {
  throw new Error("Vercel prebuilt output must keep hashed Expo assets immutable.");
}
if (!routes.some((route) => route.status === 404 && route.dest === "/404")) {
  throw new Error("Vercel prebuilt output lost the branded 404 fallback.");
}

const [distFiles, staticFiles] = await Promise.all([walk(distDirectory), walk(staticDirectory)]);
const relativeDistFiles = distFiles.map((file) => path.relative(distDirectory, file)).sort();
const relativeStaticFiles = staticFiles.map((file) => path.relative(staticDirectory, file)).sort();
if (JSON.stringify(relativeDistFiles) !== JSON.stringify(relativeStaticFiles)) {
  throw new Error("Vercel prebuilt static file set does not exactly match dist/.");
}

for (const relativeFile of relativeDistFiles) {
  const [distContents, staticContents] = await Promise.all([
    readFile(path.join(distDirectory, relativeFile)),
    readFile(path.join(staticDirectory, relativeFile)),
  ]);
  if (digest(distContents) !== digest(staticContents)) {
    throw new Error(`Vercel prebuilt artifact differs from dist/: ${relativeFile}`);
  }
  if (/\.(?:css|html|js|json|svg|txt|webmanifest)$/.test(relativeFile)) {
    const text = staticContents.toString("utf8");
    if (text.includes("VERCEL_OIDC_TOKEN") || /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(text)) {
      throw new Error(`Vercel prebuilt artifact contains credential-like text: ${relativeFile}`);
    }
  }
}

for (const [route, handler] of [["account", "api/account.js"], ["sync", "api/sync.js"]]) {
  const functionDirectory = path.join(functionsDirectory, "api", `${route}.func`);
  const functionConfig = JSON.parse(await readFile(path.join(functionDirectory, ".vc-config.json"), "utf8"));
  if (functionConfig.handler !== handler || !String(functionConfig.runtime).startsWith("nodejs")) {
    throw new Error(`Vercel prebuilt output is missing the Node function for /api/${route}.`);
  }
  const files = await walk(functionDirectory);
  for (const file of files.filter((entry) => entry.startsWith(path.join(functionDirectory, "api") + path.sep) && entry.endsWith(".js"))) {
    const text = await readFile(file, "utf8");
    if (/sk_(?:test|live)_[A-Za-z0-9_-]{12,}/.test(text) || /postgres(?:ql)?:\/\/[^\s"']+@/.test(text)) {
      throw new Error(`Vercel function artifact contains an embedded credential: ${path.relative(outputDirectory, file)}`);
    }
  }
}

const precache = JSON.parse(await readFile(path.join(staticDirectory, "precache-manifest.json"), "utf8"));
console.log(`Vercel prebuilt verified: ${relativeStaticFiles.length} static files and sync/account Node functions are release-safe (build ${precache.version}).`);
