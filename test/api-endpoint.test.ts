import { afterEach, describe, expect, it, vi } from "vitest";

import { apiEndpoint as webEndpoint } from "@/data/apiEndpoint";
import { apiEndpoint as nativeEndpoint } from "@/data/apiEndpoint.native";

afterEach(() => vi.unstubAllEnvs());

describe("API origin selection", () => {
  it("keeps web account and sync requests on the current custom domain", () => {
    vi.stubEnv("EXPO_PUBLIC_SYNC_API_URL", "https://deep-space-ledger-app.vercel.app");
    expect(webEndpoint("/api/sync")).toBe("/api/sync");
    expect(webEndpoint("api/account")).toBe("/api/account");
  });

  it("uses the configured HTTPS origin for native requests", () => {
    vi.stubEnv("EXPO_PUBLIC_SYNC_API_URL", "https://api.example.test/");
    expect(nativeEndpoint("api/sync")).toBe("https://api.example.test/api/sync");
  });

  it("has an independent production fallback for native requests", () => {
    vi.stubEnv("EXPO_PUBLIC_SYNC_API_URL", "");
    expect(nativeEndpoint("/api/account")).toBe("https://deep-space-ledger-app.vercel.app/api/account");
  });
});
