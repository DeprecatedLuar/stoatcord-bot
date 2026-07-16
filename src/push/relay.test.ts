import { describe, test, expect } from "bun:test";
import { isAllowedPushEndpoint } from "./relay.ts";

describe("isAllowedPushEndpoint", () => {
  test("accepts a normal public https host", () => {
    expect(isAllowedPushEndpoint("https://fcm.googleapis.com/fcm/send/abc")).toBe(
      true
    );
  });

  test("rejects non-https URLs", () => {
    expect(isAllowedPushEndpoint("http://example.com/push")).toBe(false);
  });

  test("rejects malformed URLs", () => {
    expect(isAllowedPushEndpoint("not-a-url")).toBe(false);
  });

  const blockedHosts = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "10.0.0.5",
    "172.16.0.1",
    "172.20.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "metadata.internal",
    "printer.local",
  ];

  for (const host of blockedHosts) {
    test(`rejects blocked host ${host}`, () => {
      expect(isAllowedPushEndpoint(`https://${host}/push`)).toBe(false);
    });
  }

  test("rejects IPv6 loopback", () => {
    expect(isAllowedPushEndpoint("https://[::1]/push")).toBe(false);
  });
});
