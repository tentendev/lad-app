const operatorName = process.env.EXPO_PUBLIC_LEGAL_ENTITY_NAME?.trim();
const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim();

export const PUBLIC_INFO = Object.freeze({
  operatorName: operatorName || "深空省省開發團隊",
  privacyUpdatedAt: "2026-08-14",
  supportEmail: supportEmail || null,
});
