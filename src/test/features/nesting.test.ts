import { describe, expect, it } from "vitest";
import { convert } from "@/convert";

describe("Nesting", () => {
  it("converts list inside panel", () => {
    const jira = `{panel:title=Title}
* item 1
* item 2
{panel}`;
    const result = convert(jira);
    expect(result.trim()).toBe(`> **Title**
> - item 1
> - item 2`);
  });

  it("converts list inside table cell using \\\\", () => {
    const jira = `| * item 1\\\\* item 2 | cell 2 |`;
    const result = convert(jira);
    expect(result.trim()).toBe(`|- item 1<br>- item 2|cell 2|
|---|---|`);
  });

  it("converts code block inside table cell as HTML", () => {
    const jira = '| {code:java}\nSystem.out.println("Hello");\n{code} |';
    const result = convert(jira);
    expect(result.trim()).toBe(
      '|<pre><code class="language-java">System.out.println("Hello");</code></pre>|\n|---|',
    );
  });

  it("converts noformat block inside table cell as HTML", () => {
    const jira = "| {noformat}\npreformatted\n{noformat} |";
    const result = convert(jira);
    expect(result.trim()).toBe("|<pre><code>preformatted</code></pre>|\n|---|");
  });

  it("converts complex nesting (nested lists in panels)", () => {
    const jira = `{panel}
* level 1
** level 2
{panel}`;
    const result = convert(jira);
    expect(result.trim()).toBe(`> - level 1
>   - level 2`);
  });
});
