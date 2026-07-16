import { describe, test, expect } from "bun:test";
import { generateCode, generatePushToken, generateApiToken } from "./store.ts";

describe("generateCode", () => {
  test("produces a 6-character code", () => {
    expect(generateCode().length).toBe(6);
  });

  test("only uses the unambiguous charset (no 0/O/1/I)", () => {
    const code = generateCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });

  test("is highly unlikely to collide across many calls", () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateCode()));
    expect(codes.size).toBe(500);
  });
});

describe("generatePushToken", () => {
  test("produces a base64url string with no padding", () => {
    const token = generatePushToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token).not.toContain("=");
  });

  test("is highly unlikely to collide across many calls", () => {
    const tokens = new Set(Array.from({ length: 500 }, () => generatePushToken()));
    expect(tokens.size).toBe(500);
  });
});

describe("generateApiToken", () => {
  test("produces a 32-char lowercase hex string", () => {
    const token = generateApiToken();
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  test("is highly unlikely to collide across many calls", () => {
    const tokens = new Set(Array.from({ length: 500 }, () => generateApiToken()));
    expect(tokens.size).toBe(500);
  });
});
