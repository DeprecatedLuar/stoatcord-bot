import { describe, test, expect } from "bun:test";
import { sanitizeName, groupByCategory, type ChannelMapping } from "./channels.ts";

describe("sanitizeName", () => {
  test("replaces empty string with 'unnamed'", () => {
    expect(sanitizeName("")).toBe("unnamed");
  });

  test("replaces whitespace-only string with 'unnamed'", () => {
    expect(sanitizeName("   ")).toBe("unnamed");
  });

  test("trims surrounding whitespace", () => {
    expect(sanitizeName("  general  ")).toBe("general");
  });

  test("truncates names longer than 32 chars", () => {
    const long = "a".repeat(40);
    const result = sanitizeName(long);
    expect(result.length).toBe(32);
    expect(result).toBe("a".repeat(32));
  });

  test("leaves valid names untouched", () => {
    expect(sanitizeName("general-chat")).toBe("general-chat");
  });
});

describe("groupByCategory", () => {
  function makeMapping(category: string | null, discordId: string): ChannelMapping {
    return {
      discordChannel: {} as ChannelMapping["discordChannel"],
      discordId,
      stoatName: discordId,
      stoatType: "Text",
      category,
      position: 0,
      selected: true,
      topic: null,
      nsfw: false,
      slowmodeSeconds: 0,
      originalType: "GuildText",
      permOverwriteCount: 0,
      warnings: [],
    };
  }

  test("groups mappings by category key", () => {
    const mappings = [
      makeMapping("General", "1"),
      makeMapping("Voice", "2"),
      makeMapping("General", "3"),
    ];
    const groups = groupByCategory(mappings);
    expect(groups.get("General")?.map((m) => m.discordId)).toEqual(["1", "3"]);
    expect(groups.get("Voice")?.map((m) => m.discordId)).toEqual(["2"]);
  });

  test("null category is its own group", () => {
    const mappings = [makeMapping(null, "1"), makeMapping("General", "2")];
    const groups = groupByCategory(mappings);
    expect(groups.get(null)?.map((m) => m.discordId)).toEqual(["1"]);
    expect(groups.has("General")).toBe(true);
  });

  test("preserves insertion order within a group", () => {
    const mappings = [
      makeMapping("General", "a"),
      makeMapping("General", "b"),
      makeMapping("General", "c"),
    ];
    const groups = groupByCategory(mappings);
    expect(groups.get("General")?.map((m) => m.discordId)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
