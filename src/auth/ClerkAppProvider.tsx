import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import type { PropsWithChildren } from "react";
import { isLocalPreview } from "./localPreview";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey && !isLocalPreview()) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.");
}

export function ClerkAppProvider({ children }: PropsWithChildren) {
  if (isLocalPreview()) return <>{children}</>;
  if (!publishableKey) throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.");
  return (
    <ClerkProvider publishableKey={publishableKey} telemetry={false} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
