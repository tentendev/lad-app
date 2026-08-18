import { isClerkAPIResponseError, useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { isCurrentWebAuthOffline, OFFLINE_AUTH_MESSAGE } from "./networkAvailability";

export type SocialStrategy = "oauth_google" | "oauth_apple";
export const APPLE_SIGN_IN_ENABLED = process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === "true";

WebBrowser.maybeCompleteAuthSession();

function authErrorMessage(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    return error.errors[0]?.longMessage ?? error.errors[0]?.message ?? "登入沒有完成，請再試一次。";
  }
  return "登入沒有完成。請確認網路與瀏覽器權限後再試一次。";
}

export function useSocialSignIn() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [submitting, setSubmitting] = useState<SocialStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  async function signIn(strategy: SocialStrategy) {
    setError(null);
    if (isCurrentWebAuthOffline(Platform.OS)) {
      setError(OFFLINE_AUTH_MESSAGE);
      return;
    }
    setSubmitting(strategy);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: "deep-space-ledger",
          path: "sso-callback",
        }),
      });
      if (!createdSessionId || !setActive) {
        throw new Error("OAuth flow requires additional steps.");
      }
      await setActive({ session: createdSessionId });
      router.replace("/account" as Href);
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setSubmitting(null);
    }
  }

  return { error, signIn, submitting };
}
