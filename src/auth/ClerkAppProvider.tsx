import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import type { PropsWithChildren } from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.");
}

const validatedPublishableKey: string = publishableKey;

export function ClerkAppProvider({ children }: PropsWithChildren) {
  return (
    <ClerkProvider publishableKey={validatedPublishableKey} telemetry={false} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
