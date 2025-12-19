import type {
  Block,
  Document,
  Heading,
  Inline,
  List,
  ListItem,
  Table,
  TableCell,
  TableRow,
} from "./ast";
import { doc } from "./ast";
import {
  PIPE_CONTAINING_INLINES,
  parseInline,
} from "./inline";
import { Scanner } from "./scanner";

const PATTERNS = {
  HEADING: /^[ \t]*h([1-6])\.\s*(.+)/,
  HR: /^----\s*$/m,
  BQ_PREFIX: /^bq\.\s*(.*)/,
  QUOTE: /^{quote}([\s\S]*?){quote}/,
  NOFORMAT: /^{noformat(?::([^}]+))?}([\s\S]*?)({noformat}|$)/,
  CODE: /^{code(?::([^}]+))?}([\s\S]*?)({code}|$)/,
  PANEL: /^{panel(?::([^}]+))?}([\s\S]*?)({panel}|$)/,
  LIST_START: /^[ \t]*([*#]+)\s+/,
  LIST_ITEM: /([*#]+)\s+(.*)/,
  LEADING_WS: /^[ \t]*/,
  NEWLINE: /^\r?\n/,
};

type BlockParser = (scanner: Scanner) => Block | null;

// Ordered list of block parsers
const parsers: BlockParser[] = [
  parseHeading,
  parseHorizontalRule,
  parseBlockquotePrefix,
  parseQuoteBlock,
  parseNoFormatBlock,
  parseCodeBlock,
  parsePanelBlock,
  parseListBlock,
  parseTableBlock,
];

export function parseBlocks(input: string): Document {
  const scanner = new Scanner(input);
  const blocks: Block[] = [];

  while (scanner.hasMore()) {
    let matched = false;

    for (const parser of parsers) {
      const block = parser(scanner);
      if (block) {
        blocks.push(block);
        matched = true;
        break;
      }
    }

    if (matched) {
      continue;
    }

    // Default to Paragraph
    const paragraphLine = scanner.consumeLine();
    if (paragraphLine.trim().length > 0) {
      blocks.push({ type: "Paragraph", inlines: parseInline(paragraphLine) });
    }
  }

  return doc(blocks);
}

export function parseParameters(paramStr: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!paramStr) return params;

  const parts = paramStr.split("|");
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.includes("=")) {
      const [key, ...valueParts] = part.split("=");
      params[key.trim()] = valueParts.join("=").trim();
    } else if (i === 0) {
      params.default = part.trim();
    }
  }
  return params;
}

function getBlockMatch(
  scanner: Scanner,
  excludeParsers: BlockParser[] = [],
): number | null {
  const savedPos = scanner.pos;
  try {
    for (const parser of parsers) {
      if (parser === parseListBlock || excludeParsers.includes(parser)) continue;
      if (parser(scanner)) {
        return scanner.pos - savedPos;
      }
    }
    return null;
  } finally {
    scanner.pos = savedPos;
  }
}

function isStartOfNewBlock(scanner: Scanner): boolean {
  return getBlockMatch(scanner) !== null;
}

/**
 * Strips at most one newline from the beginning and end of a string.
 */
function stripSurroundingNewlines(text: string): string {
  return text.replace(/^\r?\n/, "").replace(/\r?\n$/, "");
}

function parseHeading(scanner: Scanner): Heading | null {
  const m = scanner.matchAndConsume(PATTERNS.HEADING);
  if (!m) return null;
  return {
    type: "Heading",
    level: parseInt(m[1], 10) as Heading["level"],
    inlines: parseInline(m[2]),
  };
}

function parseHorizontalRule(scanner: Scanner): Block | null {
  if (scanner.matchAndConsume(PATTERNS.HR)) {
    return { type: "HorizontalRule" };
  }
  return null;
}

function parseBlockquotePrefix(scanner: Scanner): Block | null {
  const m = scanner.matchAndConsume(PATTERNS.BQ_PREFIX);
  if (!m) return null;
  return {
    type: "Blockquote",
    children: [{ type: "Paragraph", inlines: parseInline(m[1]) }],
  };
}

function parseQuoteBlock(scanner: Scanner): Block | null {
  const m = scanner.matchAndConsume(PATTERNS.QUOTE);
  if (!m) return null;
  return {
    type: "Blockquote",
    children: parseBlocks(m[1].trim()).children,
  };
}

function parseNoFormatBlock(scanner: Scanner): Block | null {
  const m = scanner.matchAndConsume(PATTERNS.NOFORMAT);
  if (!m) return null;
  const content = stripSurroundingNewlines(m[2]);
  return {
    type: "NoFormat",
    content,
    multiline: content.includes("\n") || m[0].includes("\n"),
  };
}

function parseCodeBlock(scanner: Scanner): Block | null {
  const m = scanner.matchAndConsume(PATTERNS.CODE);
  if (!m) return null;
  const params = parseParameters(m[1] || "");
  const lang = params.default;
  const content = stripSurroundingNewlines(m[2]);
  return { type: "CodeFence", lang, content };
}

function parsePanelBlock(scanner: Scanner): Block | null {
  const m = scanner.matchAndConsume(PATTERNS.PANEL);
  if (!m) return null;
  const params = parseParameters(m[1] || "");
  let title: Inline[] | undefined;
  if (params.title) {
    title = parseInline(params.title);
  }
  const content = stripSurroundingNewlines(m[2]);
  return {
    type: "Panel",
    title,
    children: parseBlocks(content).children,
  };
}

function parseListBlock(scanner: Scanner): List | null {
  const m = scanner.match(PATTERNS.LIST_START);
  if (!m) return null;
  const baseMarkerType = m[1][0];
  const items: ListItem[] = [];

  while (scanner.hasMore()) {
    // Consume optional leading whitespace
    scanner.matchAndConsume(PATTERNS.LEADING_WS);
    const match = scanner.matchAndConsume(PATTERNS.LIST_ITEM);
    if (!match || match[1][0] !== baseMarkerType) break;

    let content = match[2].trimEnd();
    // Consume the newline if it's there
    scanner.matchAndConsume(PATTERNS.NEWLINE);

    // Handle multiline list items
    while (scanner.hasMore()) {
      const savedPosML = scanner.pos;
      // Skip empty lines between list items if they are followed by another list item
      if (scanner.matchAndConsume(/^[ \t]*\r?\n(?=[ \t]*[*#]+)/)) {
        scanner.pos = savedPosML;
        break;
      }

      if (
        scanner.match(/^[ \t]*\r?\n/) ||
        scanner.match(/^[ \t]*[*#]+/) ||
        isStartOfNewBlock(scanner)
      ) {
        break;
      }

      const nextLine = scanner.consumeLine();
      content += `\n${nextLine.trimEnd()}`;
    }
    addListItem(items, match[1], content);
  }

  return {
    type: "List",
    ordered: baseMarkerType === "#",
    items,
  };
}

function parseTableBlock(scanner: Scanner): Table | null {
  if (!scanner.match(/^[ \t]*\|[|]/) && !scanner.match(/^[ \t]*\|/)) return null;
  const table = parseTable(scanner);
  return table.rows.length > 0 ? table : null;
}

function addListItem(items: ListItem[], markers: string, content: string) {
  if (markers.length === 1) {
    items.push({
      type: "ListItem",
      children: [{ type: "Paragraph", inlines: parseInline(content) }],
    });
    return;
  }

  if (items.length === 0) {
    items.push({
      type: "ListItem",
      children: [],
    });
  }

  const lastItem = items[items.length - 1];
  const lastChild = lastItem.children[lastItem.children.length - 1];
  const nextMarkers = markers.slice(1);

  if (
    lastChild?.type === "List" &&
    lastChild.ordered === (nextMarkers[0] === "#")
  ) {
    addListItem(lastChild.items, nextMarkers, content);
  } else {
    const newList: List = {
      type: "List",
      ordered: nextMarkers[0] === "#",
      items: [],
    };
    addListItem(newList.items, nextMarkers, content);
    lastItem.children.push(newList);
  }
}

function parseTable(scanner: Scanner): Table {
  const rows: TableRow[] = [];
  while (scanner.hasMore()) {
    const line = scanner.peekLine();
    if (!line.trim().startsWith("|")) break;

    const fullRowLines = consumeTableRow(scanner);
    const cells: TableCell[] = [];

    // Improved cell parsing to handle mixed | and ||, and multi-line content
    let remaining = fullRowLines.trim();
    if (remaining.endsWith("||")) {
      remaining = remaining.slice(0, -2);
    } else if (remaining.endsWith("|")) {
      remaining = remaining.slice(0, -1);
    }

    while (remaining.length > 0) {
      if (remaining.startsWith("||")) {
        remaining = remaining.slice(2);
        const endIdx = findCellEnd(remaining);
        const content = remaining.slice(0, endIdx);
        addTableCell(cells, content, true);
        remaining = remaining.slice(endIdx);
      } else if (remaining.startsWith("|")) {
        remaining = remaining.slice(1);
        const endIdx = findCellEnd(remaining);
        const content = remaining.slice(0, endIdx);
        addTableCell(cells, content, false);
        remaining = remaining.slice(endIdx);
      } else {
        // If it doesn't start with | or ||, but there is still content,
        // it might be some leading whitespace or tabs.
        const nextSeparator = remaining.search(/\|/);
        if (nextSeparator === -1) break;
        remaining = remaining.slice(nextSeparator);
      }
    }

    if (cells.length > 0) {
      rows.push({ type: "TableRow", cells });
    }
  }
  return { type: "Table", rows };
}

function consumeTableRow(scanner: Scanner): string {
  const startPos = scanner.pos;
  scanner.consumeLine(); // consume the first line which we know is a table row

  while (scanner.hasMore()) {
    const nextLine = scanner.peekLine();
    const trimmed = nextLine.trim();

    // Table rows must start with |
    if (trimmed.startsWith("|")) break;
    // Empty lines end the table
    if (trimmed === "") break;

    // These blocks also end the table
    if (scanner.match(PATTERNS.HEADING)) break;
    if (scanner.match(PATTERNS.HR)) break;
    if (scanner.match(PATTERNS.LIST_START)) break;

    // Otherwise, assume it's a continuation of the current row (multi-line cell)
    scanner.consumeLine();
  }
  return scanner.input.slice(startPos, scanner.pos);
}

function addTableCell(cells: TableCell[], content: string, header: boolean) {
  const blocks = parseBlocks(
    content.trim().replace(/\\\\/g, "\n").trim(),
  ).children;
  cells.push({
    type: "TableCell",
    header,
    content: blocks,
  });
}

function findCellEnd(text: string): number {
  const scanner = new Scanner(text);
  while (scanner.hasMore()) {
    const char = scanner.peek();

    if (char === "|" || (char === "|" && scanner.peek(2) === "||")) {
      return scanner.pos;
    }

    // Skip constructs that might contain pipe characters but are not cell separators.
    const inlineMatch = scanner.matchAny(PIPE_CONTAINING_INLINES);
    if (inlineMatch) {
      scanner.pos += inlineMatch[0].length;
      continue;
    }

    // Handle nested tables if any (though rare in Jira)
    const blockLength = getBlockMatch(scanner, [parseTableBlock]);
    if (blockLength !== null) {
      scanner.pos += blockLength;
      continue;
    }

    scanner.consume();
  }
  return scanner.pos;
}
