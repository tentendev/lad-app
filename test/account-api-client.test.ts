import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteRemoteAccount } from "../src/data/accountApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("account deletion client", () => {
  it("uses a Clerk bearer token and preserves the Apple revocation outcome", async () => {
    const fetchDouble = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      deleted: true,
      appleAuthorization: "manual_required",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchDouble);

    await expect(deleteRemoteAccount(async () => "session-token")).resolves.toEqual({
      deleted: true,
      appleAuthorization: "manual_required",
    });
    expect(fetchDouble).toHaveBeenCalledWith("/api/account", expect.objectContaining({
      method: "DELETE",
      headers: expect.objectContaining({ Authorization: "Bearer session-token" }),
    }));
  });

  it("does not make a request after the Clerk session has expired", async () => {
    const fetchDouble = vi.fn();
    vi.stubGlobal("fetch", fetchDouble);

    await expect(deleteRemoteAccount(async () => null)).rejects.toThrow("登入狀態已失效");
    expect(fetchDouble).not.toHaveBeenCalled();
  });

  it("sends a fresh Apple code only in the authenticated JSON body", async () => {
    const fetchDouble = vi.fn().mockResolvedValue(Response.json({ deleted: true, appleAuthorization: "revoked" }));
    vi.stubGlobal("fetch", fetchDouble);
    await deleteRemoteAccount(async () => "session-token", "single-use-code");
    expect(fetchDouble).toHaveBeenCalledWith("/api/account", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer session-token", "Content-Type": "application/json" }),
      body: JSON.stringify({ appleAuthorizationCode: "single-use-code" }),
    }));
  });
});
