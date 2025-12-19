import { describe, expect, it } from "vitest";
import { convert } from "@/convert.ts";

describe("Checkboxes", () => {
  it("should convert unchecked checkboxes", () => {
    const jira = "* [ ] Todo item";
    const markdown = "- [ ] Todo item";
    expect(convert(jira).trim()).toBe(markdown);
  });

  it("should convert checked checkboxes", () => {
    const jira = "* [x] Done item";
    const markdown = "- [x] Done item";
    expect(convert(jira).trim()).toBe(markdown);
  });
  
  it("should convert checked checkboxes with capital X", () => {
    const jira = "* [X] Done item";
    const markdown = "- [x] Done item";
    expect(convert(jira).trim()).toBe(markdown);
  });

  it("should convert checkboxes in numbered lists", () => {
    const jira = "# [ ] First\n# [x] Second";
    const markdown = "1. [ ] First\n2. [x] Second";
    expect(convert(jira).trim()).toBe(markdown);
  });

  it("should convert standalone checkboxes (not in list)", () => {
    const jira = "[ ] Standalone task";
    const markdown = "[ ] Standalone task";
    expect(convert(jira).trim()).toBe(markdown);
  });

  it("should convert checkboxes in the middle of text", () => {
    const jira = "Please check this [ ] and this [x]";
    const markdown = "Please check this [ ] and this [x]";
    expect(convert(jira).trim()).toBe(markdown);
  });
});
