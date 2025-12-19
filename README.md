# Overview

`jiradown` is a TypeScript library that converts [Jira markup](https://jira.atlassian.com/secure/WikiRendererHelpAction.jspa?section=all) to [Markdown](https://commonmark.org/).

> [!WARNING]
> This repository was mostly vibe coded. If you're looking for a more mature solution, check out [jira2markdown](https://github.com/catcombo/jira2markdown) which served as a great inspiration for this project.

It follows a standard compiler-like architecture:
1.  **Parser**: Converts input Jira markup into an Abstract Syntax Tree (AST).
2.  **AST**: Defines the structure of the document, distinguishing between Block nodes (e.g., Heading, List, Table) and Inline nodes (e.g., Strong, Link, Image).
3.  **Renderer**: Traverses the AST and produces Markdown string output.

The Markdown implementation follows the [CommonMark specification](https://spec.commonmark.org/0.29/) with extensions, making it suitable for use with github and other Markdown-compatible systems.

## Usage

```typescript
import { convert } from 'jiradown';

const jiraText = `h1. My Jira Nightmare
{quote}
"Can we just make the logo 20% more 'organic'?"
{quote}
* [ ] Crying in the shower
* [ ] Refactoring the *vibe*
* [!] Questioning my life choices`;

const markdownText = convert(jiraText);

console.log(markdownText);
/*
# My Jira Nightmare

> "Can we just make the logo 20% more 'organic'?"

- [ ] Crying in the shower
- [ ] Refactoring the **vibe**
- [!] Questioning my life choices
*/
```

# Conversion tables

## Headings

| Jira                      | Markdown                  |
|---------------------------|---------------------------|
| `h1. Total meltdown`      | `# Total meltdown`        |
| `h2. Major crisis`        | `## Major crisis`         |
| `h3. Minor inconvenience` | `### Minor inconvenience` |
| `h4. Casual shrug`        | `#### Casual shrug`       |
| `h5. Whispering`          | `##### Whispering`        |
| `h6. Silent screaming`    | `###### Silent screaming` |

## Text Effects

| Jira                                          | Markdown                               |
|-----------------------------------------------|----------------------------------------|
| `*extra strong vibe*`                         | `**extra strong vibe**`                |
| `_subtle hints_`                              | Not converted (the same syntax)        |
| `??citation needed??`                         | `<q>citation needed</q>`               |
| `-deprecated sanity-`                         | `~~deprecated sanity~~`                |
| `+improved excuses+`                          | `improved excuses`                     |
| `^highly optimistic^`                         | `<sup>highly optimistic</sup>`         |
| `~crushing reality~`                          | `<sub>crushing reality</sub>`          |
| `{{brain.exe}}`                               | `` `brain.exe` ``                      |
| `bq. "It works on my machine"`                | `> "It works on my machine"`           |
| `{quote}I have no idea what I'm doing{quote}` | `> I have no idea what I'm doing`      |
| `{color:red}danger zone{color}`               | `<font color="red">danger zone</font>` |

## Text Breaks

| Jira           | Markdown      |
|----------------|---------------|
| `\\`           | Line break    |
| `---`          | `—`           |
| `--`           | `–`           |

## Links

| Jira                          | Markdown                   |
|-------------------------------|----------------------------|
| `[#bottomless-pit]`           | Not converted              |
| `[^hope.jpg]`                 | `[hope.jpg](hope.jpg)`     |
| `[http://google.it]`          | `<http://google.it>`       |
| `[Fix it                      | http://stackoverflow.com]` | `[Fix it](http://stackoverflow.com)`   |
| `[panic@company.com]`         | `<panic@company.com>`      |
| `[file:///dev/null]`          | Not converted              |
| `{anchor:point-of-no-return}` | Not converted              |
| `[~intern]`                   | `@intern`                  |

## Lists

| Jira                                                                                   | Markdown                                                                                 |
|----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| <pre>* coffee<br>* more coffee<br>** espresso<br>** double espresso<br>* regrets</pre> | <pre>- coffee<br>- more coffee<br>  - espresso<br>  - double espresso<br>- regrets</pre> |
| <pre># Step 1: Open Jira<br># Step 2: Cry<br># Step 3: Profit?</pre>                   | <pre>1. Step 1: Open Jira<br>1. Step 2: Cry<br>1. Step 3: Profit?</pre>                  |
| <pre># Tasks<br>#* Wake up<br>#* Coffee<br>#* Back to sleep<br># Repeat</pre>          | <pre>1. Tasks<br>   - Wake up<br>   - Coffee<br>   - Back to sleep<br>1. Repeat</pre>    |

## Images

| Jira                                                                                     | Markdown                                                           |
|------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| <pre>!burnout.jpg!<br>!facepalm.jpg\|thumbnail!<br>!this-is-fine.gif\|align=right!</pre> | <pre>![burnout.jpg](burnout.jpg)</pre>                             |
| <pre>!productivity.png\|width=0, height=0!</pre>                                         | <pre>![productivity.png](productivity.png){width=0 height=0}</pre> |

## Tables

| Jira                                                                                                                               | Markdown                                                                                                                                |
|------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| <pre>\|\|Feature\|\|Status\|\|Owner\|\|<br>\|Dark mode\|\|Essential\|\|The Intern\|<br>\|Fixing bugs\|\|Optional\|\|Nobody\|</pre> | <pre>\|Feature\|Status\|Owner\|<br>\|---\|---\|---\|<br>\|Dark mode\|Essential\|The Intern\|<br>\|Fixing bugs\|Optional\|Nobody\|</pre> |

## Advanced Formatting

| Jira                                                                                                  | Markdown                                                                                       |
|-------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| <pre>{noformat}<br>This is where I put<br>my unfiltered thoughts<br>{noformat}</pre>                  | <pre>```<br>This is where I put<br>my unfiltered thoughts<br>```</pre>                         |
| <pre>{panel:title=Urgent Alert}<br>The vibes are off.<br>{panel}</pre>                                | <pre>> **Urgent Alert**<br>> The vibes are off.</pre>                                          |
| <pre>{code:typescript}<br>const mood = 'coding';<br>while (mood) {<br>  panic();<br>}<br>{code}</pre> | <pre>```typescript<br>const mood = 'coding';<br>while (mood) {<br>  panic();<br>}<br>```</pre> |

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