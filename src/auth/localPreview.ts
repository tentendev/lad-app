/** Local development can preview device-only tools without connecting an account. */
export function isLocalPreview(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__ && process.env.EXPO_PUBLIC_LOCAL_PREVIEW === "true";
}
