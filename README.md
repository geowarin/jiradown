# Overview

`jiradown` is a TypeScript library that converts [Jira markup](https://jira.atlassian.com/secure/WikiRendererHelpAction.jspa?section=all) to [Markdown](https://commonmark.org/).

It follows a standard compiler-like architecture:
1.  **Parser**: Converts input Jira markup into an Abstract Syntax Tree (AST).
2.  **AST**: Defines the structure of the document, distinguishing between Block nodes (e.g., Heading, List, Table) and Inline nodes (e.g., Strong, Link, Image).
3.  **Renderer**: Traverses the AST and produces Markdown string output.

The Markdown implementation follows the [CommonMark specification](https://spec.commonmark.org/0.29/) with extensions, making it suitable for use with github and other Markdown-compatible systems.

## Usage

```typescript
import { convert } from 'jiradown';

const jiraText = 'h1. Hello World\n\nThis is *strong* text.';
const markdownText = convert(jiraText);

console.log(markdownText);
// # Hello World
//
// This is **strong** text.
```

# Conversion tables

## Headings

| Jira                   | Markdown                  |
|------------------------|---------------------------|
| `h1. Biggest heading`  | `# Biggest heading`       |
| `h2. Bigger heading`   | `## Bigger heading`       |
| `h3. Big heading`      | `### Big heading`         |
| `h4. Normal heading`   | `#### Normal heading`     |
| `h5. Small heading`    | `##### Small heading`     |
| `h6. Smallest heading` | `###### Smallest heading` |

## Text Effects

| Jira                                 | Markdown                             |
|--------------------------------------|--------------------------------------|
| `*strong*`                           | `**strong**`                         |
| `_emphasis_`                         | Not converted (the same syntax)      |
| `??citation??`                       | `<q>citation</q>`                    |
| `-deleted-`                          | `~~deleted~~`                        |
| `+inserted+`                         | `inserted`                           |
| `^superscript^`                      | `<sup>superscript</sup>`             |
| `~subscript~`                        | `<sub>subscript</sub>`               |
| `{{monospaced}}`                     | `` `monospaced` ``                   |
| `bq. Some block quoted text`         | `> Some block quoted text`           |
| `{quote}Content to be quoted{quote}` | `> Content to be quoted`             |
| `{color:red}red text!{color}`        | `<font color="red">red text!</font>` |

## Text Breaks

| Jira  | Markdown   |
|-------|------------|
| `\\`  | Line break |
| `---` | `—`        |
| `--`  | `–`        |

## Links

| Jira                            | Markdown                           |
|---------------------------------|------------------------------------|
| `[#anchor]`                     | Not converted                      |
| `[^attachment.ext]`             | `[attachment.ext](attachment.ext)` |
| `[http://www.example.com]`      | `<http://www.example.com>`         |
| `[Example\|http://example.com]` | `[Example](http://example.com)`    |
| `[mailto:box@example.com]`      | `<box@example.com>`                |
| `[file:///c:/temp/foo.txt]`     | Not converted                      |
| `{anchor:anchorname}`           | Not converted                      |
| `[~username]`                   | `@username`                        |

## Lists

<table>
<tr>
<th>Jira</th>
<th>Markdown</th>
</tr>
<tr>
<td>

```
* some
* bullet
** indented
** bullets
* points
```

</td>
<td>

```
- some
- bullet
  - indented
  - bullets
- points
```

</td>
</tr>
<tr>
<td>

```
# a
# numbered
# list
```

</td>
<td>

```
1. a
1. numbered
1. list
```

</td>
</tr>
<tr>
<td>

```
# a
# numbered
#* with
#* nested
#* bullet
# list
```

</td>
<td>

```
1. a
1. numbered
   - with
   - nested
   - bullet
1. list
```

</td>
</tr>
<tr>
<td>

```
* a
* bulleted
*# with
*# nested
*# numbered
* list
```

</td>
<td>

```
- a
- bulleted
  1. with
  1. nested
  1. numbered
- list
```

</td>
</tr>
</table>

## Images

<table>
<tr>
<th>Jira</th>
<th>Markdown</th>
</tr>
<tr>
<td>

```
!image.jpg!
!image.jpg|thumbnail!
!image.gif|align=right, vspace=4!
```

</td>
<td>

```
![image.jpg](image.jpg)
```

</td>
</tr>
<tr>
<td>

```
!image.jpg|width=300, height=200!
```

</td>
<td>

```
![image.jpg](image.jpg){width=300 height=200}
```

</td>
</tr>
</table>

## Tables

<table>
<tr>
<th>Jira</th>
<th>Markdown</th>
</tr>
<tr>
<td>

```
||heading 1||heading 2||heading 3||
|col A1|col A2|col A3|
|col B1|col B2|col B3|

```

</td>
<td>

```
|heading 1|heading 2|heading 3|
|---|---|---|
|col A1|col A2|col A3|
|col B1|col B2|col B3|
```

</td>
</tr>
</table>

## Advanced Formatting

<table>
<tr>
<th>Jira</th>
<th>Markdown</th>
</tr>
<tr>
<td>

```
{noformat}
preformatted piece of text
 so *no* further _formatting_ is done here
{noformat}
```

</td>
<td>

````
```
preformatted piece of text
 so *no* further _formatting_ is done here
```
````

</td>
</tr>
<tr>
<td>

```
{panel:title=My Title}
Some text with a title
{panel}
```

</td>
<td>

```
> **My Title**
> Some text with a title
```

</td>
</tr>
<tr>
<td>

```
{code:xml}
    <test>
        <another tag="attribute"/>
    </test>
{code}
```

</td>
<td>

```xml
    <test>
        <another tag="attribute"/>
    </test>
```

</td>
</tr>
</table>

## Nesting rules

Blocks (lists, tables, panels, etc.) can be nested inside other blocks.
Inlines (strong, strike, underline, etc.) can be nested inside other inlines.

## Development

### Prerequisites

- [pnpm](https://pnpm.io/)

### Commands

- **Install dependencies**: `pnpm install`
- **Build**: `pnpm run build`
- **Run tests**: `pnpm test`
- **Lint & Typecheck**: `pnpm run check`

### Testing

- **Run all tests**: `pnpm test`
- **Run a single test file**: `pnpm test path/to/test.ts`
- **Run tests matching a pattern**: `pnpm test -t pattern`