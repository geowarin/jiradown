import { describe, expect, it } from "vitest";
import { renderDocument } from "@/render";

describe("renderer", () => {
  it("text", () => {
    const markdown = renderDocument({
      type: "Document",
      children: [
        { type: "Paragraph", inlines: [{ type: "Text", value: "text" }] },
      ],
    });

    expect(markdown).toBe("text");
  });

  it("headings", () => {
    const markdown = renderDocument({
      type: "Document",
      children: [
        {
          type: "Heading",
          level: 1,
          inlines: [{ type: "Text", value: "Title" }],
        },
      ],
    });
    expect(markdown).toBe("# Title");
  });
});
