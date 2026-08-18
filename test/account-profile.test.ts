import { describe, expect, it } from "vitest";

import { signInMethodLabel, validatePasswordChange, validateProfileName } from "@/features/account/accountProfile";

describe("account profile validation", () => {
  it("requires a first name", () => {
    expect(validateProfileName({ firstName: " ", lastName: "" })).toBe("請輸入名字。");
  });

  it("accepts a normal profile name", () => {
    expect(validateProfileName({ firstName: "Maggie", lastName: "Chen" })).toBeNull();
  });

  it("requires a secure, confirmed password change", () => {
    expect(validatePasswordChange({ currentPassword: "old", newPassword: "short", confirmation: "short" })).toBe("新密碼至少需要 15 碼。");
    expect(validatePasswordChange({ currentPassword: "old-password-123", newPassword: "new-password-123", confirmation: "different-password" })).toBe("兩次輸入的新密碼不一致。");
  });

  it("labels social sign-in providers", () => {
    expect(signInMethodLabel("oauth_google")).toBe("Google");
    expect(signInMethodLabel("apple")).toBe("Apple");
  });
});
