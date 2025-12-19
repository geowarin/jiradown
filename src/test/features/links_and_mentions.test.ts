import { describe, expect, it } from "vitest";
import { convert } from "@/convert";

describe("Links and Mentions", () => {
  it("converts basic external links", () => {
    expect(convert("[http://www.example.com]")).toBe(
      "<http://www.example.com>",
    );
    expect(convert("[ftp://example.com]")).toEqual("<ftp://example.com>");
  });

  it("converts aliased links", () => {
    expect(convert("[Example|http://example.com]")).toBe(
      "[Example](http://example.com)",
    );
  });

  it("converts mailto links", () => {
    expect(convert("[mailto:box@example.com]")).toBe("<box@example.com>");
    expect(convert("[box@example.com|mailto:box@example.com]")).toEqual(
      "<box@example.com>",
    );
    expect(convert("[Some text|mailto:home_box@domain-name.com]")).toEqual(
      "[Some text](mailto:home_box@domain-name.com)",
    );
  });

  it("converts attachment links", () => {
    expect(convert("[^attachment.ext]")).toBe(
      "[attachment.ext](attachment.ext)",
    );
  });

  it("converts anchor links", () => {
    expect(convert("[#anchor]")).toBe("[#anchor](#anchor)");
  });

  it("converts anchor definitions", () => {
    expect(convert("{anchor:anchorname}")).toBe('<a name="anchorname"></a>');
  });

  it("converts user mentions", () => {
    expect(convert("[~username]")).toBe("@username");
    expect(convert("[~100:internal-id]")).toEqual("@100:internal-id");
  });

  it("handles mention spacing", () => {
    expect(convert("text[~userA]")).toEqual("text @userA");
    expect(convert("[~userA]text")).toEqual("@userA text");
    expect(convert("[~userA][~userB]")).toEqual("@userA @userB");
  });

  it("handles WWW. links", () => {
    expect(convert("[WWW.EXAMPLE.COM]")).toEqual("<https://WWW.EXAMPLE.COM>");
  });

  it("should not add spaces to mentions inside code blocks", () => {
    const jira = "{code}\n[~user1][~user2]\n{code}";
    const markdown = convert(jira);
    expect(markdown).toContain("[~user1][~user2]");
  });

  it("handles complex links found in integration tests", () => {
    const jira = "[JIRA TASK|https://jira.example.com/browse/TASK-1234]";
    expect(convert(jira)).toBe("[JIRA TASK](https://jira.example.com/browse/TASK-1234)");
  });
});
