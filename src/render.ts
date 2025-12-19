import type {
  Block,
  Document,
  Inline,
  List,
  Panel,
  Table,
  TableCell,
  TableRow,
} from "./ast";

function renderBlock(b: Block): string {
  switch (b.type) {
    case "Document":
      return renderDocument(b);
    case "Paragraph":
      return renderInlines(b.inlines);
    case "ListItem":
      return b.children.map(renderBlock).join("\n");
    case "Heading":
      return `${"#".repeat(b.level)} ${renderInlines(b.inlines)}`;
    case "Blockquote":
      return b.children
        .map(renderBlock)
        .map((line: string) =>
          line
            .split("\n")
            .map((l) => (l.trim() === "" ? ">" : `> ${l}`))
            .join("\n"),
        )
        .join("\n>\n");
    case "Panel":
      return renderPanel(b);
    case "List":
      return renderList(b, 0);
    case "Table":
      return renderTable(b);
    case "CodeFence":
      return "```" + (b.lang ?? "") + "\n" + b.content + "\n```";
    case "NoFormat":
      return (
        (b.multiline ? "```\n" : "```") +
        b.content +
        (b.multiline ? "\n```" : "```")
      );
    case "HorizontalRule":
      return "---";
    default:
      return "";
  }
}

function renderInline(n: Inline): string {
  switch (n.type) {
    case "Text":
      return n.value
        .replace(/\\/g, "\\\\")
        .replace(/\*/g, "\\*")
        .replace(/_/g, "\\_")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/~/g, "\\~")
        .replace(/\^/g, "\\^")
        .replace(/`/g, "\\`")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    case "Strong":
      return `**${renderInlines(n.children)}**`;
    case "Strike":
      return `~~${renderInlines(n.children)}~~`;
    case "Underline":
      return `<u>${renderInlines(n.children)}</u>`;
    case "InlineQuote":
      return `<q>${renderInlines(n.children)}</q>`;
    case "Sup":
      return `<sup>${renderInlines(n.children)}</sup>`;
    case "Sub":
      return `<sub>${renderInlines(n.children)}</sub>`;
    case "ColorSpan": {
      let color = n.color;
      if (color.startsWith("rgba")) {
        const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1], 10).toString(16).padStart(2, "0");
          const g = parseInt(match[2], 10).toString(16).padStart(2, "0");
          const b = parseInt(match[3], 10).toString(16).padStart(2, "0");
          color = `#${r}${g}${b}`;
        }
      }
      return `<font color="${color}">${renderInlines(n.children)}</font>`;
    }
    case "CodeSpan":
      return `\`${n.code}\``;
    case "Emphasis":
      return `_${renderInlines(n.children)}_`;
    case "Link": {
      if (!n.text) {
        return n.url.startsWith("mailto:")
          ? `<${n.url.slice(7)}>`
          : `<${n.url}>`;
      }
      const renderedText = renderInlines(n.text);
      if (n.url.startsWith("mailto:") && renderedText === n.url.slice(7)) {
        return `<${renderedText}>`;
      }
      return `[${renderedText}](${n.url})`;
    }
    case "Anchor":
      return `<a name="${n.name}"></a>`;
    case "Image": {
      const alt = n.alt ?? "";
      const dims =
        n.width || n.height
          ? `{${n.width ? `width=${n.width}` : ""}${n.width && n.height ? " " : ""}${n.height ? `height=${n.height}` : ""}}`
          : "";
      return `![${alt}](${n.src})${dims}`;
    }
    case "Mention": {
      let id = n.id;
      if (id.toLowerCase().startsWith("accountid:")) id = id.slice(10);
      return `@${id}`;
    }
    default:
      return "";
  }
}

export function renderDocument(doc: Document): string {
  return doc.children
    .map(renderBlock)
    .filter((b) => b !== "")
    .join("\n\n");
}

function renderTable(table: Table) {
  if (table.rows.length === 0) return "";

  const rowsData = table.rows.map((row: TableRow, rowIndex: number) => {
    return row.cells.map((cell: TableCell) => {
      let content = cell.content
        .map((block: Block) => {
          if (block.type === "CodeFence") {
            const lang = block.lang ? ` class="language-${block.lang}"` : "";
            return `<pre><code${lang}>${block.content}</code></pre>`;
          }
          if (block.type === "NoFormat") {
            return `<pre><code>${block.content}</code></pre>`;
          }
          if (block.type === "List") {
            return renderList(block, 0);
          }
          return renderBlock(block);
        })
        .join("<br>")
        .replace(/\r?\n/g, "<br>");

      if (cell.header && rowIndex > 0) {
        content = `**${content}**`;
      }
      return content;
    });
  });

  const maxCells = Math.max(...rowsData.map((row) => row.length));
  if (maxCells === 0) return "";

  const paddedRows = rowsData.map((row) => {
    const padded = [...row];
    if (padded.length > 1) {
      while (padded.length < maxCells) {
        padded.push("");
      }
    }
    return "|" + padded.join("|") + "|";
  });

  const separator = "|" + "---|".repeat(maxCells);
  paddedRows.splice(1, 0, separator);

  return paddedRows.join("\n");
}

function renderPanel(panel: Panel) {
  const title = panel.title ? `**${renderInlines(panel.title)}**\n` : "";
  const content = panel.children
    .map(renderBlock)
    .filter((b) => b !== "")
    .join("\n");
  const combined = `${title}${content}`.trim();
  return combined
    .split("\n")
    .map((l) => (l.trim() === "" ? ">" : `> ${l}`))
    .join("\n");
}

export function renderInlines(nodes: Inline[]): string {
  let result = "";
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const prev = nodes[i - 1];
    const next = nodes[i + 1];

    if (node.type === "Mention") {
      if (prev && prev.type === "Text" && !prev.value.endsWith(" ")) {
        result += " ";
      }
      result += renderInline(node);
      if (next) {
        if (next.type === "Text" && !next.value.startsWith(" ")) {
          if (!/^[.,:!?\]]/.test(next.value)) {
            result += " ";
          }
        } else if (next.type === "Mention") {
          result += " ";
        }
      }
    } else {
      result += renderInline(node);
    }
  }
  return result;
}

function renderList(list: List, depth: number): string {
  const lines: string[] = [];
  const marker = list.ordered ? "1. " : "- ";

  for (const item of list.items) {
    const renderedItem = item.children
      .map((c) => {
        if (c.type === "List") {
          return renderList(c, depth + 1);
        }
        return renderBlock(c).trim();
      })
      .filter((s) => s !== "")
      .join("\n");
    const itemLines = renderedItem.split(/\r?\n/);
    const firstLine = itemLines[0] ?? "";

    lines.push(`${marker}${firstLine}`);

    const continuationIndent = " ".repeat(marker.length);
    for (let i = 1; i < itemLines.length; i++) {
      const line = itemLines[i];
      lines.push(`${continuationIndent}${line}`);
    }
  }
  return lines.join("\n");
}
