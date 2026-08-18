import { useSignIn, useSignUp } from "@clerk/expo";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform } from "react-native";

import { emailAuthErrorMessage } from "./emailAuthErrors";
import { isCurrentWebAuthOffline, OFFLINE_AUTH_MESSAGE } from "./networkAvailability";

export type EmailAuthMode = "sign-in" | "sign-up";
export type EmailAuthStep =
  | "form"
  | "verify-sign-up"
  | "verify-client-trust"
  | "reset-code"
  | "reset-password";

type SignUpInput = {
  emailAddress: string;
  firstName?: string;
  password: string;
};

function firstError(errors: readonly unknown[] | null | undefined, fallback?: string): string {
  return emailAuthErrorMessage(errors?.[0], fallback);
}

export function useEmailPasswordAuth() {
  const { errors: signInErrors, fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { errors: signUpErrors, fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const router = useRouter();
  const [mode, setModeState] = useState<EmailAuthMode>("sign-in");
  const [step, setStep] = useState<EmailAuthStep>("form");
  const [emailAddress, setEmailAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submitting = signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  function stopWhenOffline() {
    if (!isCurrentWebAuthOffline(Platform.OS)) return false;
    setError(OFFLINE_AUTH_MESSAGE);
    setNotice(null);
    return true;
  }

  async function resetAttempts() {
    await Promise.all([signIn.reset(), signUp.reset()]);
  }

  async function setMode(nextMode: EmailAuthMode) {
    if (submitting || nextMode === mode) return;
    await resetAttempts();
    setModeState(nextMode);
    setStep("form");
    setEmailAddress("");
    clearMessages();
  }

  async function finalize(
    resource: Pick<typeof signIn, "finalize"> | Pick<typeof signUp, "finalize">,
  ) {
    let hasPendingTask = false;
    const { error: finalizeError } = await resource.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session.currentTask) {
          hasPendingTask = true;
          return;
        }

        const destination = decorateUrl("/account");
        if (Platform.OS === "web" && destination.startsWith("http")) {
          window.location.assign(destination);
          return;
        }
        router.replace("/account" as Href);
      },
    });

    if (finalizeError) {
      setError(emailAuthErrorMessage(finalizeError));
      return false;
    }
    if (hasPendingTask) {
      setError("帳號還有一個安全設定需要完成，請稍後再試或聯絡支援。");
      return false;
    }
    return true;
  }

  async function startSignUp(input: SignUpInput) {
    clearMessages();
    setEmailAddress(input.emailAddress);
    if (stopWhenOffline()) return;

    try {
      const { error: passwordError } = await signUp.password({
        emailAddress: input.emailAddress,
        firstName: input.firstName || undefined,
        locale: "zh-TW",
        password: input.password,
      });
      if (passwordError) {
        setError(emailAuthErrorMessage(passwordError, firstError(signUpErrors.raw)));
        return;
      }

      if (signUp.status === "complete") {
        await finalize(signUp);
        return;
      }

      if (signUp.unverifiedFields.includes("email_address")) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          setError(emailAuthErrorMessage(sendError, firstError(signUpErrors.raw)));
          return;
        }
        setStep("verify-sign-up");
        setNotice(`驗證碼已寄到 ${input.emailAddress}`);
        return;
      }

      setError("帳號資料尚未完整，請確認欄位後再試一次。");
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function verifySignUp(code: string) {
    clearMessages();
    if (stopWhenOffline()) return;
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setError(emailAuthErrorMessage(verifyError, firstError(signUpErrors.raw)));
        return;
      }
      if (signUp.status !== "complete") {
        setError("Email 已驗證，但帳號仍有未完成的欄位。");
        return;
      }
      await finalize(signUp);
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function startSignIn(email: string, password: string) {
    clearMessages();
    setEmailAddress(email);
    if (stopWhenOffline()) return;

    try {
      const { error: passwordError } = await signIn.password({ emailAddress: email, password });
      if (passwordError) {
        setError(emailAuthErrorMessage(passwordError, firstError(signInErrors.raw)));
        return;
      }

      if (signIn.status === "complete") {
        await finalize(signIn);
        return;
      }

      if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        const supportsEmailCode = signIn.supportedSecondFactors.some((factor) => factor.strategy === "email_code");
        if (!supportsEmailCode) {
          setError("這個帳號需要目前畫面尚未支援的雙重驗證方式。");
          return;
        }
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setError(emailAuthErrorMessage(sendError, firstError(signInErrors.raw)));
          return;
        }
        setStep("verify-client-trust");
        setNotice(`新裝置驗證碼已寄到 ${email}`);
        return;
      }

      setError("登入還需要額外驗證，請稍後再試。");
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function verifyClientTrust(code: string) {
    clearMessages();
    if (stopWhenOffline()) return;
    try {
      const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });
      if (verifyError) {
        setError(emailAuthErrorMessage(verifyError, firstError(signInErrors.raw)));
        return;
      }
      if (signIn.status !== "complete") {
        setError("新裝置驗證尚未完成，請重新輸入驗證碼。");
        return;
      }
      await finalize(signIn);
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function startPasswordReset(email: string) {
    clearMessages();
    setEmailAddress(email);
    if (stopWhenOffline()) return;

    try {
      const { error: createError } = await signIn.create({ identifier: email });
      if (createError) {
        setError(emailAuthErrorMessage(createError, firstError(signInErrors.raw)));
        return;
      }
      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setError(emailAuthErrorMessage(sendError, firstError(signInErrors.raw)));
        return;
      }
      setStep("reset-code");
      setNotice(`重設密碼驗證碼已寄到 ${email}`);
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function verifyResetCode(code: string) {
    clearMessages();
    if (stopWhenOffline()) return;
    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyError) {
        setError(emailAuthErrorMessage(verifyError, firstError(signInErrors.raw)));
        return;
      }
      if (signIn.status !== "needs_new_password") {
        setError("驗證尚未完成，請重新輸入驗證碼。");
        return;
      }
      setStep("reset-password");
      setNotice("驗證完成，請設定新的密碼。");
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function submitNewPassword(password: string) {
    clearMessages();
    if (stopWhenOffline()) return;
    try {
      const { error: passwordError } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (passwordError) {
        setError(emailAuthErrorMessage(passwordError, firstError(signInErrors.raw)));
        return;
      }
      if (signIn.status !== "complete") {
        setError("密碼已更新，但登入尚未完成。");
        return;
      }
      await finalize(signIn);
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function resendCode() {
    clearMessages();
    if (stopWhenOffline()) return;
    try {
      const result = step === "verify-sign-up"
        ? await signUp.verifications.sendEmailCode()
        : step === "verify-client-trust"
          ? await signIn.mfa.sendEmailCode()
          : await signIn.resetPasswordEmailCode.sendCode();
      if (result.error) {
        setError(emailAuthErrorMessage(result.error));
        return;
      }
      setNotice(`新的驗證碼已寄到 ${emailAddress}`);
    } catch (caught) {
      setError(emailAuthErrorMessage(caught));
    }
  }

  async function returnToForm() {
    if (submitting) return;
    await resetAttempts();
    setStep("form");
    clearMessages();
  }

  return {
    emailAddress,
    error,
    mode,
    notice,
    resendCode,
    returnToForm,
    setMode,
    startPasswordReset,
    startSignIn,
    startSignUp,
    step,
    submitNewPassword,
    submitting,
    verifyClientTrust,
    verifyResetCode,
    verifySignUp,
  };
}
