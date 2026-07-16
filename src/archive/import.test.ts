import { describe, test, expect } from "bun:test";
import { formatTimestamp } from "./import.ts";

describe("formatTimestamp", () => {
  test("formats midnight as 12:00 AM", () => {
    const date = new Date(Date.UTC(2026, 0, 5, 0, 0));
    expect(formatTimestamp(date)).toBe("2026-01-05 12:00 AM UTC");
  });

  test("formats noon as 12:00 PM", () => {
    const date = new Date(Date.UTC(2026, 0, 5, 12, 0));
    expect(formatTimestamp(date)).toBe("2026-01-05 12:00 PM UTC");
  });

  test("zero-pads month, day, and minutes", () => {
    const date = new Date(Date.UTC(2026, 2, 7, 9, 5));
    expect(formatTimestamp(date)).toBe("2026-03-07 9:05 AM UTC");
  });
});
