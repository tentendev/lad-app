import { Platform } from "react-native";

// Use each platform's built-in serif faces; keep body text and Dynamic Type native.
export const NATIVE_FONTS = {
  heading: Platform.select({ ios: "Songti TC", android: "serif", default: "serif" }),
  number: Platform.select({ ios: "Baskerville", android: "serif", default: "serif" }),
} as const;
