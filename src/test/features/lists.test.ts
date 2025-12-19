import { describe, expect, it } from "vitest";
import { convert } from "@/convert";

describe("Lists", () => {
  it("converts basic unordered lists", () => {
    const jira = `* some
* bullet
** indented
** bullets
* points`;
    // The renderer currently adds newlines around lists if not handled in a specific way,
    // but convert() might return them differently. Let's see.
    // Based on convertBlocks in render.ts, it adds \n before and after lists.
    const result = convert(jira);
    expect(result.trim()).toBe(`- some
- bullet
  - indented
  - bullets
- points`);
  });

  it("converts basic ordered lists", () => {
    const jira = `# a
# numbered
# list`;
    expect(convert(jira).trim()).toBe(`1. a
1. numbered
1. list`);
  });

  it("converts mixed nested lists (*#)", () => {
    const jira = `* a
* bulleted
*# with
*# nested
*# numbered
* list`;
    const expected = `- a
- bulleted
  1. with
  1. nested
  1. numbered
- list`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("converts mixed nested lists (#*)", () => {
    const jira = `# a
# numbered
#* with
#* nested
#* bullet
# list`;
    const expected = `1. a
1. numbered
   - with
   - nested
   - bullet
1. list`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("handles multiline text within a list item", () => {
    const jira = `* Item
Line
Next`;
    const expected = `- Item
  Line
  Next`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("should correctly indent deeply nested lists", () => {
    const jira = "* Level 1\n** Level 2\n*** Level 3";
    const expected = "- Level 1\n  - Level 2\n    - Level 3";
    expect(convert(jira).trim()).toBe(expected);
  });

  it("should indent continuation lines correctly in lists with multiple blocks", () => {
    const jira = "* First line\\\\Second line";
    const expected = "- First line\n  Second line";
    expect(convert(jira).trim()).toBe(expected);
  });
});
