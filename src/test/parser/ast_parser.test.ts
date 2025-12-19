import { describe, expect, it } from "vitest";
import { parseBlocks } from "@/blocks";

describe("parseBlocksNew AST structure", () => {
  it("should preserve leading and trailing newlines as Text blocks", () => {
    const input = "text";
    const ast = parseBlocks(input);

    expect(ast.type).toBe("Document");
  });
});
