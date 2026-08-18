import { isClerkAPIResponseError } from "@clerk/expo";
import { useSignInWithApple } from "@clerk/expo/apple";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useState } from "react";

function wasCancelled(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && String((error as { code?: unknown }).code).toLowerCase().includes("cancel");
}

function errorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.longMessage ?? error.errors[0]?.message ?? "Apple 登入沒有完成，請再試一次。";
  }
  return "Apple 登入沒有完成，請確認網路後再試一次。";
}

export function useNativeAppleSignIn() {
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await startAppleAuthenticationFlow();
      if (!result.createdSessionId || !result.setActive) {
        throw new Error("Apple authentication requires additional steps.");
      }
      await result.setActive({ session: result.createdSessionId });
      router.replace("/account" as Href);
    } catch (caught) {
      if (!wasCancelled(caught)) setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return { error, signIn, submitting };
}
