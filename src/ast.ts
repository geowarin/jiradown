// Block-level nodes
export type Block =
  | Document
  | Paragraph
  | Heading
  | Blockquote
  | Panel
  | List
  | ListItem
  | Table
  | CodeFence
  | NoFormat
  | HorizontalRule;

export interface Document {
  type: "Document";
  children: Block[];
}

export interface Paragraph {
  type: "Paragraph";
  inlines: Inline[];
}

export interface Heading {
  type: "Heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  inlines: Inline[];
}

export interface Blockquote {
  type: "Blockquote";
  children: Block[];
}

export interface Panel {
  type: "Panel";
  title?: Inline[];
  children: Block[];
}

export interface List {
  type: "List";
  ordered: boolean;
  items: ListItem[];
}

export interface ListItem {
  type: "ListItem";
  children: Block[]; // first child typically Paragraph
}

export interface Table {
  type: "Table";
  rows: TableRow[];
}

export interface TableRow {
  type: "TableRow";
  cells: TableCell[];
}

export interface TableCell {
  type: "TableCell";
  header: boolean;
  content: Block[];
}

export interface CodeFence {
  type: "CodeFence";
  lang?: string;
  content: string;
}

export interface NoFormat {
  type: "NoFormat";
  content: string;
  multiline?: boolean;
}

export interface HorizontalRule {
  type: "HorizontalRule";
}

// Inline nodes
export type Inline =
  | Text
  | Strong
  | Strike
  | Underline
  | InlineQuote
  | Sup
  | Sub
  | Emphasis
  | ColorSpan
  | CodeSpan
  | Link
  | Anchor
  | Image
  | Mention;

export interface Text {
  type: "Text";
  value: string;
}

export interface Strong {
  type: "Strong";
  children: Inline[];
}

export interface Strike {
  type: "Strike";
  children: Inline[];
}

export interface Underline {
  type: "Underline";
  children: Inline[];
}

export interface InlineQuote {
  type: "InlineQuote";
  children: Inline[];
}

export interface Sup {
  type: "Sup";
  children: Inline[];
}

export interface Sub {
  type: "Sub";
  children: Inline[];
}

export interface Emphasis {
  type: "Emphasis";
  children: Inline[];
}

export interface ColorSpan {
  type: "ColorSpan";
  color: string;
  children: Inline[];
}

export interface CodeSpan {
  type: "CodeSpan";
  code: string;
}

export interface Link {
  type: "Link";
  text?: Inline[];
  url: string;
}

export interface Anchor {
  type: "Anchor";
  name: string;
}

export interface Image {
  type: "Image";
  alt?: string;
  src: string;
  width?: string;
  height?: string;
  align?: string;
  hspace?: string;
  vspace?: string;
  thumbnail?: boolean;
}

export interface Mention {
  type: "Mention";
  id: string;
}

export function doc(children: Block[] = []): Document {
  return { type: "Document", children };
}
