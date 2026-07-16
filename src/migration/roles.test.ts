import { describe, test, expect } from "bun:test";
import { PermissionsBitField } from "discord.js";
import { mapPermissions, mapChannelOverridePermissions } from "./roles.ts";
import { PermissionBit } from "../stoat/types.ts";

// Regression coverage for commit 56d4a7e: discordToRevoltBits used to
// accumulate bits with `|=` on a plain `number`, which flips the sign bit
// at bit 31 and silently truncates bits >= 32. These bits must round-trip
// exactly through BigInt accumulation.

describe("mapPermissions", () => {
  test("Speak (bit 31) maps without sign-bit corruption", () => {
    const perms = new PermissionsBitField(["Speak"]);
    expect(mapPermissions(perms)).toEqual({
      a: Number(PermissionBit.Speak),
      d: 0,
    });
  });

  test("Stream (bit 32, Video) maps without truncation to 0", () => {
    const perms = new PermissionsBitField(["Stream"]);
    expect(mapPermissions(perms)).toEqual({
      a: Number(PermissionBit.Video),
      d: 0,
    });
  });

  test("MuteMembers (bit 33) maps without truncation", () => {
    const perms = new PermissionsBitField(["MuteMembers"]);
    expect(mapPermissions(perms)).toEqual({
      a: Number(PermissionBit.MuteMembers),
      d: 0,
    });
  });

  test("DeafenMembers (bit 34) maps without truncation", () => {
    const perms = new PermissionsBitField(["DeafenMembers"]);
    expect(mapPermissions(perms)).toEqual({
      a: Number(PermissionBit.DeafenMembers),
      d: 0,
    });
  });

  test("MoveMembers (bit 35) maps without truncation", () => {
    const perms = new PermissionsBitField(["MoveMembers"]);
    expect(mapPermissions(perms)).toEqual({
      a: Number(PermissionBit.MoveMembers),
      d: 0,
    });
  });

  test("ModerateMembers -> TimeoutMembers (bit 36) maps without truncation", () => {
    const perms = new PermissionsBitField(["ModerateMembers"]);
    expect(mapPermissions(perms)).toEqual({
      a: Number(PermissionBit.TimeoutMembers),
      d: 0,
    });
  });

  test("OR-accumulation is correct across the 32-bit boundary", () => {
    const perms = new PermissionsBitField([
      "ManageChannels",
      "Stream",
      "MuteMembers",
    ]);
    const expected = Number(
      PermissionBit.ManageChannel | PermissionBit.Video | PermissionBit.MuteMembers
    );
    expect(mapPermissions(perms)).toEqual({ a: expected, d: 0 });
  });

  test("permissions with no high bits still map correctly", () => {
    const perms = new PermissionsBitField(["ViewChannel", "SendMessages"]);
    const expected = Number(PermissionBit.ViewChannel | PermissionBit.SendMessage);
    expect(mapPermissions(perms)).toEqual({ a: expected, d: 0 });
  });
});

describe("mapChannelOverridePermissions", () => {
  test("allow and deny map independently, high bits included", () => {
    const allow = new PermissionsBitField(["Speak"]);
    const deny = new PermissionsBitField(["MuteMembers"]);
    expect(mapChannelOverridePermissions(allow, deny)).toEqual({
      a: Number(PermissionBit.Speak),
      d: Number(PermissionBit.MuteMembers),
    });
  });

  test("denied-only bits do not leak into allowed", () => {
    const allow = new PermissionsBitField([]);
    const deny = new PermissionsBitField(["ViewChannel"]);
    const result = mapChannelOverridePermissions(allow, deny);
    expect(result.a).toBe(0);
    expect(result.d).toBe(Number(PermissionBit.ViewChannel));
  });
});
