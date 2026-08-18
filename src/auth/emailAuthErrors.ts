type ClerkFlowError = {
  code?: string;
  longMessage?: string;
  message?: string;
};

const DEFAULT_ERROR = "驗證沒有完成，請稍後再試一次。";

export function emailAuthErrorMessage(error: unknown, fallback = DEFAULT_ERROR): string {
  if (!error || typeof error !== "object") return fallback;
  const clerkError = error as ClerkFlowError;

  switch (clerkError.code) {
    case "form_identifier_exists":
    case "identifier_already_exists":
      return "這個 Email 已經註冊，請改用登入。";
    case "form_identifier_not_found":
      return "找不到這個會員，請先註冊。";
    case "form_password_incorrect":
      return "密碼不正確，請再試一次。";
    case "form_code_incorrect":
    case "verification_failed":
      return "驗證碼不正確，請重新輸入。";
    case "verification_expired":
      return "驗證碼已過期，請重新寄送。";
    case "form_password_pwned":
      return "這組密碼曾出現在外洩資料中，請換一組更安全的密碼。";
    case "form_password_length_too_short":
      return "密碼至少需要 15 碼。";
    case "too_many_requests":
      return "嘗試次數太多，請稍後再試。";
    default:
      return clerkError.longMessage ?? clerkError.message ?? fallback;
  }
}

