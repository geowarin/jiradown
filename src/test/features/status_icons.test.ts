import { describe, expect, it } from "vitest";
import { convert } from "@/convert.ts";

describe("Status Icons", () => {
  it("should convert all supported Jira status icons to emojis", () => {
    const jira = "(/) (x) (!) (i) (y) (n) ( ) (?) (+) (-)";
    const expected = "✅ ❌ ⚠️ ℹ️ 👍 👎 ⚪ ❓ ➕ ➖";
    expect(convert(jira).trim()).toBe(expected);
  });

  it("should convert status icons mixed with text", () => {
    const jira = "Done (/) - please check (i)";
    const expected = "Done ✅ - please check ℹ️";
    expect(convert(jira).trim()).toBe(expected);
  });

  it("should not convert invalid status icons", () => {
    const jira = "(a) (bc) ( )";
    // ( ) is actually supported and maps to ⚪
    const expected = "(a) (bc) ⚪";
    expect(convert(jira).trim()).toBe(expected);
  });
});
