import { describe, expect, it } from "vitest";
import { convert } from "@/convert";

describe("Headings", () => {
  it("converts basic headings h1. through h6.", () => {
    expect(convert("h1. Biggest heading")).toBe("# Biggest heading");
    expect(convert("h2. Heading 2")).toBe("## Heading 2");
    expect(convert("h3. Heading 3")).toBe("### Heading 3");
    expect(convert("h4. Heading 4")).toBe("#### Heading 4");
    expect(convert("h5. Heading 5")).toBe("##### Heading 5");
    expect(convert("h6. Smallest heading")).toBe("###### Smallest heading");
  });

  it("does not convert h7. (not a standard Jira heading)", () => {
    expect(convert("h7. Title")).toEqual("h7. Title");
  });

  it("handles headings with leading spaces by ignoring them in output", () => {
    expect(convert("  h2. Title")).toEqual("## Title");
  });

  it("does not convert headings in the middle of a line", () => {
    expect(convert(" A  h2. Title")).toEqual(" A  h2. Title");
  });
});
