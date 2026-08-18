export type ProfileNameInput = {
  firstName: string;
  lastName: string;
};

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
};

export function validateProfileName({ firstName, lastName }: ProfileNameInput): string | null {
  if (!firstName.trim()) return "請輸入名字。";
  if (firstName.trim().length > 64 || lastName.trim().length > 64) return "名字與姓氏各自不可超過 64 個字。";
  return null;
}

export function validatePasswordChange({ currentPassword, newPassword, confirmation }: PasswordChangeInput): string | null {
  if (!currentPassword) return "請輸入目前密碼。";
  if (newPassword.length < 15) return "新密碼至少需要 15 碼。";
  if (newPassword === currentPassword) return "新密碼不可與目前密碼相同。";
  if (newPassword !== confirmation) return "兩次輸入的新密碼不一致。";
  return null;
}

export function signInMethodLabel(provider: string): string {
  const normalized = provider.toLowerCase();
  if (normalized.includes("google")) return "Google";
  if (normalized.includes("apple")) return "Apple";
  return provider;
}
