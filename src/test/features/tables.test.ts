import { describe, expect, it } from "vitest";
import { convert } from "@/convert";

describe("Tables", () => {
  it("converts basic tables", () => {
    const jira = `||heading 1||heading 2||
|col A1|col A2|`;
    const expected = `|heading 1|heading 2|
|---|---|
|col A1|col A2|`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("converts tables without headers", () => {
    const jira = `|col A1|col A2|
|col B1|col B2|`;
    const expected = `|col A1|col A2|
|---|---|
|col B1|col B2|`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("handles uneven column counts by padding with empty cells", () => {
    const jira = `|header 1|header 2|
|cell 1-1|cell 1-2|cell 1-3|
|cell 2-1|`;
    const expected = `|header 1|header 2||
|---|---|---|
|cell 1-1|cell 1-2|cell 1-3|
|cell 2-1|`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("handles mixed column separators", () => {
    const jira = `|header 1||header 2|header 3|
|cell 1-1|cell 1-2||cell 1-3|
||cell 2-1|cell 2-2|cell 2-3|`;
    const expected = `|header 1|header 2|header 3|
|---|---|---|
|cell 1-1|cell 1-2|**cell 1-3**|
|**cell 2-1**|cell 2-2|cell 2-3|`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("handles multiline text using \\\\", () => {
    // Note: the implementation currently replaces \\ with \n during cell parsing.
    // The renderer then replaces \n with <br>.
    const jira = `|multi\\\\line|cell|`;
    const expected = `|multi<br>line|cell|
|---|---|`;
    expect(convert(jira).trim()).toBe(expected);
  });

  it("handles smallest table", () => {
    expect(convert("|header").trim()).toBe("|header|\n|---|");
  });

  it("handles headers in any row", () => {
    const jira =
      "||Header 1||Header 2||\n|Cell 1|Cell 2|\n||Subheader 1||Subheader 2||\n|Cell 3|Cell 4|";
    const markdown = convert(jira);
    expect(markdown).toContain("|Header 1|Header 2|");
    expect(markdown).toContain("|---|---|");
    expect(markdown).toContain("|**Subheader 1**|**Subheader 2**|");
  });
});
