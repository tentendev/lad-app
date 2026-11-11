import * as AppleAuthentication from "expo-apple-authentication";

export async function requestAppleDeletionCredential(): Promise<{ authorizationCode: string; user: string }> {
  const credential = await AppleAuthentication.signInAsync({ requestedScopes: [] });
  if (!credential.authorizationCode || !credential.user) throw new Error("Apple verification incomplete");
  return { authorizationCode: credential.authorizationCode, user: credential.user };
}

export async function isAppleAuthorizationRevoked(user: string): Promise<boolean> {
  try {
    const state = await AppleAuthentication.getCredentialStateAsync(user);
    return state === AppleAuthentication.AppleAuthenticationCredentialState.REVOKED
      || state === AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND;
  } catch {
    return false;
  }
}
