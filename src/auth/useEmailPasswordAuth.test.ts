import { describe, expect, it } from "vitest";

import { emailAuthErrorMessage } from "./emailAuthErrors";

describe("emailAuthErrorMessage", () => {
  it("translates common account and password errors", () => {
    expect(emailAuthErrorMessage({ code: "form_identifier_exists" })).toContain("已經註冊");
    expect(emailAuthErrorMessage({ code: "form_identifier_not_found" })).toContain("找不到");
    expect(emailAuthErrorMessage({ code: "form_password_incorrect" })).toContain("密碼不正確");
  });

  it("translates verification and leaked-password errors", () => {
    expect(emailAuthErrorMessage({ code: "form_code_incorrect" })).toContain("驗證碼不正確");
    expect(emailAuthErrorMessage({ code: "verification_expired" })).toContain("已過期");
    expect(emailAuthErrorMessage({ code: "form_password_pwned" })).toContain("外洩資料");
  });

  it("prefers Clerk's detailed message for unknown codes", () => {
    expect(emailAuthErrorMessage({ code: "custom", longMessage: "詳細錯誤" })).toBe("詳細錯誤");
  });

  it("uses a safe fallback for malformed values", () => {
    expect(emailAuthErrorMessage(null)).toBe("驗證沒有完成，請稍後再試一次。");
  });
});
