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

  it("handles multi-line code blocks inside table cells", () => {
    const jira = `|cell 1|{code}
line 1
line 2
{code}|
|cell 2|content|`;
    const result = convert(jira);
    console.log("[DEBUG_LOG] result:", result);
    expect(result).toContain("|cell 1|<pre><code>line 1<br>line 2</code></pre>|");
    expect(result).toContain("|cell 2|content|");
  });

  it("handles multi-line code blocks inside table cells (broken case)", () => {
    const jira = `|cell 1| {code}
{
  "key": "value"
}
{code} | cell 2 |`;
    const result = convert(jira);
    console.log("[DEBUG_LOG] result (broken):", JSON.stringify(result));
    expect(result).toContain("|cell 1|<pre><code>{<br>  \"key\": \"value\"<br>}</code></pre>|cell 2|");
  });

  it("handles tab characters between table separators", () => {
    const jira = "||header 1||\tHeader 2\t||Header 3|| Header 4 ||\n|cell 1|\tcell 2\t||cell 3| cell 4 |";
    const result = convert(jira);
    expect(result).toContain("|header 1|Header 2|Header 3|Header 4|");
    expect(result).toContain("|cell 1|cell 2|**cell 3**|cell 4|");
  });
});
