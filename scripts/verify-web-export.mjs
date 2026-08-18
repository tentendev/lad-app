import { access, readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDirectory = fileURLToPath(new URL("../dist", import.meta.url));
const requiredFiles = [
  "schedule.html",
  "wallet.html",
  "calculator.html",
  "tracker.html",
  "about.html",
  "privacy.html",
  "support.html",
  "account.html",
  "sso-callback.html",
  "404.html",
  "manifest.webmanifest",
  "robots.txt",
  "precache-manifest.json",
  "sw.js",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "roadmap.html",
  "urls.html",
  "changelog.html",
  "internal.css",
  "ux-research.html",
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }))).flat();
}

await Promise.all(requiredFiles.map((file) => access(path.join(distDirectory, file))));

const precache = JSON.parse(await readFile(path.join(distDirectory, "precache-manifest.json"), "utf8"));
if (!/^[a-f0-9]{12}$/.test(precache.version) || !Array.isArray(precache.assets) || precache.assets.length === 0) {
  throw new Error("precache-manifest.json is missing a valid build version or asset list.");
}
await Promise.all(precache.assets.map((asset) => access(path.join(distDirectory, asset.replace(/^\//, "")))));

const webManifest = JSON.parse(await readFile(path.join(distDirectory, "manifest.webmanifest"), "utf8"));
if (webManifest.id !== "/" || webManifest.start_url !== "/schedule" || webManifest.scope !== "/" || webManifest.icons?.length < 2) {
  throw new Error("PWA manifest is missing its stable identity, start route, scope, or install icons.");
}

const serviceWorker = await readFile(path.join(distDirectory, "sw.js"), "utf8");
if (serviceWorker.includes("__BUILD_ID__") || !serviceWorker.includes(`deep-space-ledger-${precache.version}`)) {
  throw new Error("Service worker cache version does not match the exported precache manifest.");
}
for (const primaryRoute of ["/schedule", "/wallet", "/calculator", "/tracker", "/about", "/account"]) {
  if (!serviceWorker.includes(`"${primaryRoute}"`)) {
    throw new Error(`Service worker app shell is missing primary route: ${primaryRoute}.`);
  }
}
if (!webManifest.shortcuts?.some((shortcut) => shortcut.url === "/tracker")) {
  throw new Error("PWA manifest is missing the tracker shortcut.");
}

const routeMetadata = {
  schedule: {
    title: "排期｜深空省省",
    description: "把官方公告與預測排期放在同一個月曆裡。",
  },
  wallet: {
    title: "錢包｜深空省省",
    description: "把每次心動都留下紀錄，也讓預算提醒在真正需要時出現。資料只儲存在你的裝置。",
  },
  calculator: {
    title: "換算｜深空省省",
    description: "把鑽石、金券、官方返券與預留資源一起算清楚，再依卡池階梯給出可執行的禮包建議。",
  },
  tracker: {
    title: "追蹤｜深空省省",
    description: "手動保存各計數線目前累計與五星紀錄，不需要遊戲帳號或授權 Token。",
  },
  about: {
    title: "關於深空省省｜深空省省",
    description: "服務定位、資料保存方式與隱私說明。",
  },
  account: {
    title: "會員中心｜深空省省",
    description: "管理個人資料、登入安全性與私人雲端備份。",
  },
  privacy: {
    title: "隱私政策｜深空省省",
    description: "深空省省如何保存、使用與刪除資料。",
  },
  support: {
    title: "支援中心｜深空省省",
    description: "深空省省的使用說明與聯絡方式。",
  },
};

for (const [route, metadata] of Object.entries(routeMetadata)) {
  const html = await readFile(path.join(distDirectory, `${route}.html`), "utf8");
  if (!/<html\s+[^>]*lang="zh-Hant"/.test(html) || !html.includes("manifest.webmanifest")) {
    throw new Error(`${route}.html is missing Traditional Chinese language or PWA metadata.`);
  }
  if (!html.includes(`>${metadata.title}</title>`) || !html.includes(`name="description" content="${metadata.description}"`)) {
    throw new Error(`${route}.html is missing its route-specific title or description.`);
  }
}

const privacyPage = await readFile(path.join(distDirectory, "privacy.html"), "utf8");
for (const requiredDisclosure of ["Apple 登入授權", "服務供應商與跨境處理", "永久刪除帳號"]) {
  if (!privacyPage.includes(requiredDisclosure)) {
    throw new Error(`privacy.html is missing required disclosure: ${requiredDisclosure}.`);
  }
}

const notFound = await readFile(path.join(distDirectory, "404.html"), "utf8");
if (!notFound.includes('name="robots" content="noindex"')) {
  throw new Error("404.html must remain excluded from search indexing.");
}

const vercelConfig = JSON.parse(await readFile(path.join(distDirectory, "..", "vercel.json"), "utf8"));
const rootRedirect = vercelConfig.redirects?.find((entry) => entry.source === "/");
if (rootRedirect?.destination !== "/schedule" || rootRedirect.permanent !== false) {
  throw new Error("Vercel config must keep the temporary root redirect to /schedule.");
}
const serviceWorkerHeaders = vercelConfig.headers?.find((entry) => entry.source === "/sw.js")?.headers ?? [];
const staticAssetHeaders = vercelConfig.headers?.find((entry) => entry.source === "/_expo/static/(.*)")?.headers ?? [];
const serviceWorkerCacheControl = serviceWorkerHeaders.find((header) => header.key === "Cache-Control")?.value;
const staticAssetCacheControl = staticAssetHeaders.find((header) => header.key === "Cache-Control")?.value;
if (serviceWorkerCacheControl !== "public, max-age=0, must-revalidate") {
  throw new Error("Service worker must revalidate on every deployment.");
}
if (staticAssetCacheControl !== "public, max-age=31536000, immutable") {
  throw new Error("Hashed Expo assets must retain immutable one-year caching.");
}
const globalHeaders = vercelConfig.headers?.find((entry) => entry.source === "/(.*)")?.headers ?? [];
const headerMap = Object.fromEntries(globalHeaders.map((header) => [header.key, header.value]));
const contentSecurityPolicy = headerMap["Content-Security-Policy"] ?? "";
if (!contentSecurityPolicy.includes("frame-ancestors 'none'") || !contentSecurityPolicy.includes("'unsafe-eval'") || !contentSecurityPolicy.includes("https://select-asp-53.clerk.accounts.dev") || headerMap["X-Frame-Options"] !== "DENY") {
  throw new Error("Vercel security headers are missing the CSP frame boundary or DENY frame policy.");
}

const representativeHtml = await readFile(path.join(distDirectory, "schedule.html"), "utf8");
if (representativeHtml.includes("debug-tools-panel") || representativeHtml.includes("debug-launcher")) {
  throw new Error("Production export must not render the internal Debug launcher.");
}
const inlineScripts = [...representativeHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter(Boolean);
for (const script of inlineScripts) {
  const digest = createHash("sha256").update(script).digest("base64");
  if (!contentSecurityPolicy.includes(`'sha256-${digest}'`)) {
    throw new Error("CSP is missing the hash for an exported inline script.");
  }
}

for (const internalPage of ["roadmap.html", "urls.html", "changelog.html"]) {
  const html = await readFile(path.join(distDirectory, internalPage), "utf8");
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .filter(Boolean);
  if (!html.includes('href="internal.css"') || scripts.length === 0) {
    throw new Error(`${internalPage} is missing its shared stylesheet or interactive script.`);
  }
  for (const script of scripts) {
    const digest = createHash("sha256").update(script).digest("base64");
    if (!contentSecurityPolicy.includes(`'sha256-${digest}'`)) {
      throw new Error(`CSP is missing the inline script hash for ${internalPage}.`);
    }
  }
}

const files = await walk(distDirectory);
const webStylesheet = files.find((file) => /[/\\]web-[a-f0-9]+\.css$/.test(file));
if (!webStylesheet) throw new Error("Export is missing the Web design stylesheet.");
const webCss = (await readFile(webStylesheet, "utf8")).toLowerCase();
const originalPalette = {
  "--lead-xavier": "#a78bfa",
  "--lead-zayne": "#59b8ff",
  "--lead-rafayel": "#ff88bf",
  "--lead-sylus": "#ff6675",
  "--lead-caleb": "#ffad5c",
  "--c-merch": "#49b8ff",
  "--c-daily": "#ff78b7",
  "--c-monthly": "#9b8cff",
  "--c-mixed": "#ffd166",
  "--c-birthday": "#ff9f68",
  "--c-rerun": "#65d6c4",
  "--c-pass": "#ffd34d",
  "--c-story": "#66b5ff",
};
for (const [variable, color] of Object.entries(originalPalette)) {
  if (!webCss.includes(`${variable}:${color}`) && !webCss.includes(`${variable}: ${color}`)) {
    throw new Error(`Web stylesheet is missing the original ${variable} color ${color}.`);
  }
}

const normalizedWebCss = webCss.replaceAll(" ", "");
const requiredDesktopScrollRules = [
  ["hover-capable input", ["any-hover:hover"]],
  ["fine pointer input", ["any-pointer:fine"]],
  ["dynamic viewport height", ["height:100dvh"]],
  ["vertical overflow", ["overflow-y:auto"]],
];
for (const [label, acceptedRules] of requiredDesktopScrollRules) {
  if (!acceptedRules.some((rule) => normalizedWebCss.includes(rule))) {
    throw new Error(`Web stylesheet is missing the desktop scroll contract: ${label}.`);
  }
}
if (normalizedWebCss.includes("scrollbar-gutter:stable")) {
  throw new Error("Desktop scroll must not reserve a gutter that offsets fixed app chrome from page content.");
}

const totalBytes = (await Promise.all(files.map(async (file) => (await stat(file)).size)))
  .reduce((total, size) => total + size, 0);
const maximumBytes = 7 * 1024 * 1024;
if (totalBytes > maximumBytes) {
  throw new Error(`Web export is ${Math.ceil(totalBytes / 1024)} KiB, above the 7 MiB regression budget.`);
}

console.log(`Web export verified: ${requiredFiles.length} release files, ${precache.assets.length} precached bundles, ${(totalBytes / 1024 / 1024).toFixed(1)} MiB total.`);
