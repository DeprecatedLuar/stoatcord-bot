import { describe, test, expect } from "bun:test";
import {
  discordToRevolt,
  revoltToDiscord,
  truncateForRevolt,
  truncateForDiscord,
} from "./format.ts";

describe("discordToRevolt", () => {
  test("converts spoilers", () => {
    expect(discordToRevolt("||secret||")).toBe("!!secret!!");
  });

  test("strips user mentions", () => {
    expect(discordToRevolt("hi <@123456>")).toBe("hi @discord-user");
    expect(discordToRevolt("hi <@!123456>")).toBe("hi @discord-user");
  });

  test("strips channel mentions", () => {
    expect(discordToRevolt("see <#123456>")).toBe("see #discord-channel");
  });

  test("strips role mentions", () => {
    expect(discordToRevolt("ping <@&123456>")).toBe("ping @discord-role");
  });

  test("converts custom emoji to :name:", () => {
    expect(discordToRevolt("<:pepe:98765>")).toBe(":pepe:");
    expect(discordToRevolt("<a:pepe:98765>")).toBe(":pepe:");
  });

  test("converts timestamps to UTC string", () => {
    const result = discordToRevolt("<t:0:f>");
    expect(result).toBe("1970-01-01 00:00:00 UTC");
  });
});

describe("revoltToDiscord", () => {
  test("converts spoilers back", () => {
    expect(revoltToDiscord("!!secret!!")).toBe("||secret||");
  });

  test("strips ULID user mentions", () => {
    expect(revoltToDiscord("hi <@01ARZ3NDEKTSV4RRFFQ69G5FAV>")).toBe(
      "hi @stoat-user"
    );
  });

  test("strips ULID channel mentions", () => {
    expect(revoltToDiscord("see <#01ARZ3NDEKTSV4RRFFQ69G5FAV>")).toBe(
      "see #stoat-channel"
    );
  });
});

describe("truncateForRevolt", () => {
  test("leaves content at exactly 2000 chars untouched", () => {
    const content = "a".repeat(2000);
    expect(truncateForRevolt(content)).toBe(content);
  });

  test("truncates content over 2000 chars with ellipsis, total length 2000", () => {
    const content = "a".repeat(2001);
    const result = truncateForRevolt(content);
    expect(result.length).toBe(2000);
    expect(result.endsWith("...")).toBe(true);
  });
});

describe("truncateForDiscord", () => {
  test("leaves content at exactly 2000 chars untouched", () => {
    const content = "a".repeat(2000);
    expect(truncateForDiscord(content)).toBe(content);
  });

  test("truncates content over 2000 chars with ellipsis, total length 2000", () => {
    const content = "a".repeat(2001);
    const result = truncateForDiscord(content);
    expect(result.length).toBe(2000);
    expect(result.endsWith("...")).toBe(true);
  });
});
