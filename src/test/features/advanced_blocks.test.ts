import { describe, expect, it } from "vitest";
import { convert } from "@/convert";

describe("Advanced Blocks", () => {
  describe("noformat", () => {
    it("converts basic noformat", () => {
      expect(
        convert("{noformat}preformatted piece of text{noformat}").trim(),
      ).toBe("```preformatted piece of text```");
    });

    it("converts multiline noformat", () => {
      const jira = `{noformat}
preformatted piece
of text
{noformat}`;
      expect(convert(jira).trim()).toBe(
        "```\npreformatted piece\nof text\n```",
      );
    });

    it("handles multiple parameters in noformat", () => {
      const jira = `{noformat:borderStyle=dashed|borderColor=#ccc|title=My Title}
a block of code
{noformat}`;
      expect(convert(jira).trim()).toBe("```\na block of code\n```");
    });
  });

  describe("code", () => {
    it("converts code with no default language", () => {
      const jira = `{code}
def test_code():
    pass
{code}`;
      expect(convert(jira).trim()).toBe("```\ndef test_code():\n    pass\n```");
    });

    it("converts code with explicit language", () => {
      const jira = `{code:xml}
<test/>
{code}`;
      expect(convert(jira).trim()).toBe("```xml\n<test/>\n```");
    });

    it("handles multiple parameters in code block", () => {
      const jira = `{code:C++|title=test.cpp}
static int x = 10;
{code}`;
      expect(convert(jira).trim()).toBe("```C++\nstatic int x = 10;\n```");
    });
  });

  describe("panel", () => {
    it("converts basic panel to blockquote", () => {
      const jira = `{panel}
Some text
{panel}`;
      expect(convert(jira).trim()).toBe("> Some text");
    });

    it("converts panel with title", () => {
      const jira = `{panel:title=My Title}
Some text with a title
{panel}`;
      expect(convert(jira).trim()).toBe(
        "> **My Title**\n> Some text with a title",
      );
    });

    it("handles multiple parameters in panel", () => {
      const jira = `{panel:borderStyle=dashed|title=My Title}
a block of text
{panel}`;
      expect(convert(jira).trim()).toBe("> **My Title**\n> a block of text");
    });
  });

  describe("quote", () => {
    it("converts bq. to blockquote", () => {
      expect(convert("bq. Some quote")).toBe("> Some quote");
    });

    it("converts {quote} to blockquote", () => {
      const jira = `{quote}
content to be quoted
{quote}`;
      expect(convert(jira).trim()).toBe("> content to be quoted");
    });
  });
});
