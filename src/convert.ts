import { parseBlocks } from "./blocks";
import { renderDocument } from "./render";

export function convert(input: string): string {
  const doc = parseBlocks(input);
  return renderDocument(doc);
}
