import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { Buffer } from "node:buffer";

const root = new URL("../", import.meta.url);
const [app, eas, metadata, packageJson, clerkProvider, nativeAccount, reviewPackage, privacyInventory] = await Promise.all([
  readFile(new URL("app.json", root), "utf8").then(JSON.parse),
  readFile(new URL("eas.json", root), "utf8").then(JSON.parse),
  readFile(new URL("store.config.json", root), "utf8").then(JSON.parse),
  readFile(new URL("package.json", root), "utf8").then(JSON.parse),
  readFile(new URL("src/auth/ClerkAppProvider.tsx", root), "utf8"),
  readFile(new URL("src/app/account.tsx", root), "utf8"),
  readFile(new URL("docs/APP_STORE_REVIEW_PACKAGE.md", root), "utf8"),
  readFile(new URL("docs/PRIVACY_DATA_INVENTORY.md", root), "utf8"),
]);

const icon = await readFile(new URL(app.expo.icon, root));
const issues = [];
const notes = [];

function requireCondition(condition, message) {
  if (!condition) issues.push(message);
}

function publicValue(name) {
  return process.env[name]?.trim() ?? "";
}

const base = spawnSync(process.execPath, ["scripts/preflight-ios-build.mjs"], {
  cwd: new URL(".", root),
  encoding: "utf8",
  env: process.env,
});
if (base.status !== 0) {
  issues.push(`基礎 iOS build preflight 未通過：${(base.stderr || base.stdout).trim()}`);
}

const expo = app.expo ?? {};
const bundleIdentifier = expo.ios?.bundleIdentifier ?? "";
const projectId = expo.extra?.eas?.projectId ?? "";
const ascAppId = eas.submit?.production?.ios?.ascAppId ?? "";
const info = metadata.apple?.info?.["zh-Hant"] ?? {};
const iosPlugins = new Set((expo.plugins ?? []).map((plugin) => Array.isArray(plugin) ? plugin[0] : plugin));

requireCondition(/^\d+$/.test(String(ascAppId)), "建立 App Store Connect app record 後，把數字 Apple ID 寫入 eas.submit.production.ios.ascAppId。");
requireCondition(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId), "尚未連結 Expo EAS project；登入 Expo 後執行 eas init。");
requireCondition(/^pk_live_/.test(publicValue("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY")), "production build 必須使用 Clerk production publishable key（pk_live_），不可沿用 test instance。");
requireCondition(publicValue("EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN") === "true", "保留 Google 登入時，production 必須啟用 Apple 登入並完成 Clerk／Apple 設定。");
requireCondition(expo.ios?.usesAppleSignIn === true, "app.json 必須啟用 ios.usesAppleSignIn。");
requireCondition(iosPlugins.has("expo-apple-authentication"), "app.json 必須包含 expo-apple-authentication plugin。");
for (const dependency of ["@clerk/expo", "expo-apple-authentication", "expo-crypto", "expo-secure-store"]) {
  requireCondition(Boolean(packageJson.dependencies?.[dependency]), `缺少 production authentication dependency：${dependency}。`);
}
requireCondition(clerkProvider.includes("telemetry={false}"), "ClerkProvider 必須明確關閉 SDK telemetry，維持目前的隱私揭露。");
requireCondition(nativeAccount.includes("AppleAuthentication.AppleAuthenticationButton"), "iOS 必須使用 Apple 官方原生登入按鈕，避免品牌規範漂移。");
requireCondition(Boolean(publicValue("EXPO_PUBLIC_LEGAL_ENTITY_NAME")), "請設定公開的 EXPO_PUBLIC_LEGAL_ENTITY_NAME，供隱私政策標示營運者。");
requireCondition(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(publicValue("EXPO_PUBLIC_SUPPORT_EMAIL")), "請設定有效的公開 EXPO_PUBLIC_SUPPORT_EMAIL。");
requireCondition(/^sk_live_/.test(publicValue("CLERK_SECRET_KEY")), "Vercel production 必須使用 Clerk production secret key（sk_live_）。");
requireCondition(/^postgres(ql)?:\/\//.test(publicValue("DATABASE_URL")), "請提供輪替後的 Neon production DATABASE_URL 供 server preflight 驗證。");
requireCondition(publicValue("PRODUCTION_SECRETS_ROTATED") === "true", "先輪替曾暴露的 Clerk／Neon credentials，再設定 PRODUCTION_SECRETS_ROTATED=true。");
requireCondition(publicValue("CLERK_NATIVE_APP_CONFIGURED") === "true", "完成 Clerk production Native application（Team ID／Bundle ID／redirect allowlist）後再確認旗標。");
requireCondition(publicValue("CLERK_GOOGLE_OAUTH_CONFIGURED") === "true", "完成 Clerk production Google OAuth 與實機測試後再確認旗標。");
requireCondition(publicValue("CLERK_APPLE_OAUTH_CONFIGURED") === "true", "完成 Clerk production Sign in with Apple 與實機測試後再確認旗標。");
requireCondition(/^[A-Z0-9]{10}$/.test(publicValue("APPLE_TEAM_ID")), "Vercel production 缺少有效 APPLE_TEAM_ID。");
requireCondition(/^[A-Z0-9]{10}$/.test(publicValue("APPLE_KEY_ID")), "Vercel production 缺少有效 APPLE_KEY_ID。");
requireCondition(publicValue("APPLE_PRIVATE_KEY").includes("BEGIN PRIVATE KEY"), "Vercel production 缺少 Sign in with Apple .p8 private key。");
requireCondition(publicValue("APPLE_NATIVE_CLIENT_ID") === bundleIdentifier, "APPLE_NATIVE_CLIENT_ID 必須與 iOS bundle identifier 相同。");
requireCondition(Boolean(publicValue("APPLE_WEB_CLIENT_ID")), "Web 同時提供 Apple 登入時，必須設定 APPLE_WEB_CLIENT_ID（Services ID）。");
requireCondition(["licensed", "removed"].includes(publicValue("APPLE_CONTENT_RIGHTS_STATUS")), "第三方遊戲／角色／活動內容必須有上架授權（licensed）或自送審版移除（removed）。");
requireCondition(metadata.apple?.version === expo.version, "store.config.json 的 Apple version 必須與 app.json version 一致。");
requireCondition(info.title === expo.name, "App Store 繁中 title 必須與安裝名稱一致。");
requireCondition(typeof info.title === "string" && [...info.title].length <= 30, "App Store title 不可超過 30 個字元。");
requireCondition(typeof info.subtitle === "string" && [...info.subtitle].length <= 30, "App Store subtitle 不可超過 30 個字元。");
requireCondition(typeof info.promotionalText === "string" && [...info.promotionalText].length <= 170, "App Store promotional text 必須為 1–170 個字元。");
const keywords = Array.isArray(info.keywords) ? info.keywords.join(",") : String(info.keywords ?? "");
requireCondition(Buffer.byteLength(keywords, "utf8") <= 100, "App Store keyword field 不可超過 100 bytes。");
requireCondition(typeof info.description === "string" && info.description.length > 0 && [...info.description].length <= 4000, "App Store description 必須為 1–4,000 個字元。");
for (const [label, value] of [
  ["supportUrl", info.supportUrl],
  ["privacyPolicyUrl", info.privacyPolicyUrl],
  ["privacyChoicesUrl", info.privacyChoicesUrl],
]) {
  requireCondition(typeof value === "string" && value.startsWith("https://"), `store.config.json 缺少 HTTPS ${label}。`);
}

const pngSignature = "89504e470d0a1a0a";
requireCondition(icon.subarray(0, 8).toString("hex") === pngSignature, "app.json 指定的 App icon 不是有效 PNG。");
if (icon.length >= 24) {
  requireCondition(icon.readUInt32BE(16) === 1024 && icon.readUInt32BE(20) === 1024, "App icon 必須是 1024 × 1024 PNG。");
}
requireCondition(reviewPackage.includes("永久刪除") && reviewPackage.includes("Review Notes"), "App Review 套件必須說明登入與 App 內帳號刪除路徑。");
for (const dataType of ["Name", "Email Address", "User ID", "Device ID", "Other Diagnostic Data", "Other Financial Info", "Other User Content", "Customer Support"]) {
  requireCondition(privacyInventory.includes(`| ${dataType} |`), `Privacy data inventory 缺少 ${dataType}。`);
}

if (expo.ios?.supportsTablet) {
  notes.push("iPad 支援目前開啟：送審前需要 13 吋 iPad 截圖與 iPad UI 驗收。");
} else {
  notes.push("iPad 支援目前關閉：只需完成 iPhone 商店素材與驗收。");
}
notes.push(`目前 bundle identifier：${bundleIdentifier || "未設定"}。請確認與已註冊的 Apple App ID 一致。`);

if (!process.argv.includes("--skip-network")) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const syncOrigin = publicValue("EXPO_PUBLIC_SYNC_API_URL") || "https://lad-pocket.vercel.app";
    const syncUrl = `${syncOrigin.replace(/\/$/, "")}/api/sync`;
    const accountApiUrl = `${syncOrigin.replace(/\/$/, "")}/api/account`;
    const checks = [
      ["公開支援頁", info.supportUrl, 200, "GET"],
      ["公開隱私政策", info.privacyPolicyUrl, 200, "GET"],
      ["公開資料控制頁", info.privacyChoicesUrl, 200, "GET"],
      ["雲端同步驗證邊界", syncUrl, 401, "GET"],
      ["帳號刪除 method 邊界", accountApiUrl, 405, "GET"],
      ["帳號刪除驗證邊界", accountApiUrl, 401, "DELETE"],
    ];
    for (const [label, url, expectedStatus, method] of checks) {
      if (typeof url !== "string" || !url.startsWith("https://")) continue;
      try {
        const response = await fetch(url, { method, redirect: "follow", signal: controller.signal });
        requireCondition(response.status === expectedStatus, `${label} ${url} 回傳 HTTP ${response.status}，預期 ${expectedStatus}。`);
      } catch {
        issues.push(`${label} ${url} 無法連線。`);
      }
    }
  } finally {
    clearTimeout(timeout);
  }
}

console.log("iOS submission readiness");
for (const note of notes) console.log(`- ${note}`);
if (issues.length > 0) {
  console.error(`\n尚有 ${issues.length} 項阻擋：`);
  for (const issue of issues) console.error(`- ${issue}`);
  console.error("\n沒有啟動 EAS build、TestFlight 上傳或 App Store 提交。");
  process.exit(1);
}

console.log("\nSubmission preflight passed. No build or submission was started.");
