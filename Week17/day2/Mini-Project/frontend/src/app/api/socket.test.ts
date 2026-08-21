/**
 * Tests for the WebSocket URL derivation.
 *
 * Getting this wrong is a classic deployment bug: an https site opening a `ws://`
 * socket is blocked by the browser as mixed content, and the failure only shows up
 * in production.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { socketUrl } from "./socket";

/** Re-imports the module with VITE_API_URL stubbed to a given value. */
async function withApiUrl(url: string) {
  vi.stubEnv("VITE_API_URL", url);
  vi.resetModules();
  return (await import("./socket")).socketUrl;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("socketUrl", () => {
  it("turns an http API base into a ws:// socket URL on /ws", async () => {
    const build = await withApiUrl("http://localhost:4000/api");
    const url = new URL(build("abc"));
    expect(url.protocol).toBe("ws:");
    expect(url.host).toBe("localhost:4000");
    expect(url.pathname).toBe("/ws");
  });

  it("uses wss:// when the API is served over https", async () => {
    const build = await withApiUrl("https://api.example.com/api");
    const url = new URL(build("abc"));
    // The important assertion: never ws:// from an https origin.
    expect(url.protocol).toBe("wss:");
    expect(url.pathname).toBe("/ws");
  });

  it("puts the access token in the query string", async () => {
    const build = await withApiUrl("http://localhost:4000/api");
    const url = new URL(build("my.jwt.token"));
    expect(url.searchParams.get("token")).toBe("my.jwt.token");
  });

  it("url-encodes a token containing reserved characters", async () => {
    const build = await withApiUrl("http://localhost:4000/api");
    const url = new URL(build("a+b/c=d&e"));
    // Round-trips exactly -- an unencoded '&' would truncate the token.
    expect(url.searchParams.get("token")).toBe("a+b/c=d&e");
  });

  it("works when the API base has no trailing /api segment", async () => {
    const build = await withApiUrl("http://localhost:4000");
    expect(new URL(build("t")).pathname).toBe("/ws");
  });

  it("is exported and callable with the default configuration", () => {
    expect(typeof socketUrl).toBe("function");
  });
});
