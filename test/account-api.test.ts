import { describe, expect, it } from "vitest";

import handler from "../api/account";

function responseDouble() {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let body: unknown;
  return {
    response: {
      setHeader(name: string, value: string) { headers.set(name, value); },
      status(code: number) { statusCode = code; return this; },
      json(value: unknown) { body = value; return this; },
      end() { return this; },
    },
    read: () => ({ body, headers, statusCode }),
  };
}

describe("account deletion API boundary", () => {
  it("requires a Clerk session before any deletion work", async () => {
    const target = responseDouble();
    await handler({ method: "DELETE", headers: {} } as never, target.response as never);
    expect(target.read().statusCode).toBe(401);
    expect(target.read().body).toEqual({ error: "token_missing" });
    expect(target.read().headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("only allows DELETE", async () => {
    const target = responseDouble();
    await handler({ method: "GET", headers: {} } as never, target.response as never);
    expect(target.read().statusCode).toBe(405);
    expect(target.read().headers.get("Allow")).toBe("DELETE");
  });
});
