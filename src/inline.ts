import type { Image, Inline } from "./ast";
import { parseParameters } from "./blocks";
import { Scanner } from "./scanner";

export const PATTERNS = {
  STRONG: /^\*([^* \n\r][^*]*?[^* \n\r]|\S)\*/,
  EMPHASIS: /^_([^_ \n\r][^_]*?[^_ \n\r]|\S)_/,
  STRIKE: /^-(?!\s)([^- \n\r][^-]*?[^- \n\r]|\S)-(?!\w)/,
  INSERTED: /^\+([^+ \n\r][^+]*?[^+ \n\r]|\S)\+/,
  SUP: /^\^([^^]+)\^/,
  SUB: /^~([^~]+)~/,
  MONOSPACED: /^{{([^}]+)}}/,
  CITATION: /^\?\?([^?]+)\?\?/,
  COLOR: /^{color:([^}]+)}(.*?){color}/,
  ANCHOR: /^{anchor:([^}]+)}/,
  MENTION: /^\[~([^\]]+)\]/,
  LINK: /^\[([^\]|]*)(?:\|([^\]]*))?\]/,
  CHECKBOX: /^\[([ xX])\]/,
  STATUS_ICON: /^\(([x/!iy n])\)/,
  IMAGE: /^!([^!| \t]+)(?:\|([^!]+))?!/,
  LINE_BREAK: /^\\\\/,
  DASHES_3: /^---/,
  DASHES_2: /^--/,
  DOMAIN: /^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}/,
};

export const PIPE_CONTAINING_INLINES = [
  PATTERNS.LINK,
  PATTERNS.IMAGE,
  PATTERNS.CHECKBOX,
  PATTERNS.MENTION,
];

export function parseInline(text: string): Inline[] {
  const scanner = new Scanner(text);
  const inlines: Inline[] = [];

  while (scanner.hasMore()) {
    const char = scanner.peek();
    let result: Inline | null = null;

    switch (char) {
      case "\\":
        result = parseLineBreak(scanner);
        break;
      case "-":
        result = parseDashes(scanner) || parseStrike(scanner);
        break;
      case "*":
        result = parseStrong(scanner);
        break;
      case "_":
        result = parseEmphasis(scanner);
        break;
      case "+":
        result = parseInserted(scanner);
        break;
      case "^":
        result = parseSup(scanner);
        break;
      case "~":
        result = parseSub(scanner);
        break;
      case "{":
        if (scanner.peek(2) === "{{") {
          result = parseMonospaced(scanner);
        } else if (scanner.peek(7) === "{anchor") {
          result = parseAnchor(scanner);
        } else if (scanner.peek(6) === "{color") {
          result = parseColor(scanner);
        }
        break;
      case "?":
        if (scanner.peek(2) === "??") {
          result = parseCitation(scanner);
        }
        break;
      case "(":
        result = parseStatusIcon(scanner);
        break;
      case "[":
        if (scanner.peek(2) === "[~") {
          result = parseMentionInline(scanner);
        } else {
          result = parseCheckbox(scanner) || parseLinkInline(scanner);
        }
        break;
      case "!":
        result = parseImageInline(scanner);
        break;
    }

    if (result) {
      inlines.push(result);
      continue;
    }

    // Just text
    const consumed = scanner.consume();
    if (consumed) {
      inlines.push({ type: "Text", value: consumed });
    }
  }

  return combineTextNodes(inlines);
}

function combineTextNodes(inlines: Inline[]): Inline[] {
  const result: Inline[] = [];
  for (const node of inlines) {
    const last = result[result.length - 1];
    if (node.type === "Text" && last && last.type === "Text") {
      last.value += node.value;
    } else {
      result.push(node);
    }
  }
  return result;
}

function parseStrong(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.STRONG);
  if (!m) return null;
  const content = m[1];
  return { type: "Strong", children: parseInline(content) };
}

function parseEmphasis(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.EMPHASIS);
  if (!m) return null;
  return { type: "Emphasis", children: parseInline(m[1]) };
}

function parseStrike(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.STRIKE);
  if (!m) return null;
  return { type: "Strike", children: parseInline(m[1]) };
}

function parseInserted(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.INSERTED);
  if (!m) return null;
  return { type: "Underline", children: parseInline(m[1]) };
}

function parseSup(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.SUP);
  if (!m) return null;
  return { type: "Sup", children: parseInline(m[1]) };
}

function parseSub(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.SUB);
  if (!m) return null;
  return { type: "Sub", children: parseInline(m[1]) };
}

function parseMonospaced(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.MONOSPACED);
  if (!m) return null;
  return { type: "CodeSpan", code: m[1] };
}

function parseCitation(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.CITATION);
  if (!m) return null;
  return { type: "InlineQuote", children: parseInline(m[1]) };
}

function parseColor(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.COLOR);
  if (!m) return null;
  return {
    type: "ColorSpan",
    color: m[1],
    children: parseInline(m[2]),
  };
}

function parseAnchor(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.ANCHOR);
  if (!m) return null;
  return { type: "Anchor", name: m[1] };
}

function parseMentionInline(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.MENTION);
  if (!m) return null;
  return { type: "Mention", id: m[1] };
}

function parseCheckbox(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.CHECKBOX);
  if (!m) return null;
  return { type: "Checkbox", checked: m[1].toLowerCase() === "x" };
}

function parseStatusIcon(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.STATUS_ICON);
  if (!m) return null;
  return { type: "StatusIcon", icon: m[0] };
}

function parseLinkInline(scanner: Scanner): Inline | null {
  const m = scanner.matchAndConsume(PATTERNS.LINK);
  if (!m) return null;
  const part1 = (m[1] || "").trim();
  const part2 = (m[2] || "").trim();

  if (part2) {
    if (part2.startsWith("mailto:")) {
      return {
        type: "Link",
        text: parseInline(part1),
        url: `mailto:${part2.slice(7).trim()}`,
      };
    }
    return { type: "Link", text: parseInline(part1), url: part2 };
  }

  if (part1.startsWith("#")) {
    return { type: "Link", text: [{ type: "Text", value: part1 }], url: part1 };
  }
  if (part1.startsWith("^")) {
    const filename = part1.slice(1);
    return {
      type: "Link",
      text: [{ type: "Text", value: filename }],
      url: filename,
    };
  }
  if (part1.startsWith("mailto:")) {
    return { type: "Link", url: part1.slice(7).trim() };
  }
  if (
    part1.startsWith("http") ||
    part1.startsWith("ftp") ||
    part1.startsWith("file:")
  ) {
    return { type: "Link", url: part1 };
  }
  if (PATTERNS.DOMAIN.test(part1)) {
    return { type: "Link", url: `https://${part1}` };
  }
  return { type: "Text", value: m[0] };
}

function parseImageInline(scanner: Scanner): Image | null {
  const m = scanner.matchAndConsume(PATTERNS.IMAGE);
  if (!m) return null;
  const src = m[1];
  const attrStr = m[2];
  const image: Image = { type: "Image", src, alt: src };

  if (attrStr) {
    const params = parseParameters(attrStr.replace(/,/g, "|"));
    if (params.width) image.width = params.width;
    if (params.height) image.height = params.height;
    if (params.align) image.align = params.align;
    if (params.hspace) image.hspace = params.hspace;
    if (params.vspace) image.vspace = params.vspace;
    if (params.thumbnail !== undefined || attrStr.includes("thumbnail"))
      image.thumbnail = true;
  }
  return image;
}

function parseLineBreak(scanner: Scanner): Inline | null {
  if (scanner.matchAndConsume(PATTERNS.LINE_BREAK)) {
    return { type: "Text", value: "\n" };
  }
  return null;
}

function parseDashes(scanner: Scanner): Inline | null {
  if (scanner.matchAndConsume(PATTERNS.DASHES_3)) {
    // If followed by >, it's an arrow, not an em dash
    if (scanner.peek() === ">") {
      return { type: "Text", value: "---" };
    }
    return { type: "Text", value: "—" };
  }
  if (scanner.matchAndConsume(PATTERNS.DASHES_2)) {
    // If followed by >, it's an arrow, not an en dash
    if (scanner.peek() === ">") {
      return { type: "Text", value: "--" };
    }
    return { type: "Text", value: "–" };
  }
  return null;
}
