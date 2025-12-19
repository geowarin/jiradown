import { describe, expect, it } from "vitest";
import { convert } from "@/convert";

describe("Images", () => {
  it("converts basic images", () => {
    expect(convert("!image.png!")).toBe("![image.png](image.png)");
  });

  it("converts images with thumbnail attribute", () => {
    expect(convert("!image.png|thumbnail!")).toBe("![image.png](image.png)");
  });

  it("converts images with multiple attributes", () => {
    expect(convert("!image.png|width=100,height=200!")).toBe("![image.png](image.png){width=100 height=200}");
  });

  it("converts images with thumbnail and leading space in cell", () => {
    expect(convert(" !screenshot-2.png|thumbnail!")).toBe(" ![screenshot-2.png](screenshot-2.png)");
  });
});
