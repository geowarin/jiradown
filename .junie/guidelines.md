### Project Overview

`jiradown` converts JIRA markup to Markdown.

### Tech Stack
- **Language**: TypeScript (configured as ES Modules)
- **Testing Framework**: `vitest`
- **Build Tool**: `tsc` (TypeScript Compiler)
- **Package manager**: `pnpm`

### Architecture
The project follows a standard compiler-like architecture:
1. **Parser (`src/blocks.ts`, `src/inline.ts`)**: Converts input Jira markup into an Abstract Syntax Tree (AST).
2. **AST (`src/ast.ts`)**: Defines the structure of the document, distinguishing between `Block` nodes (e.g., Heading, List, Table) and `Inline` nodes (e.g., Strong, Link, Image).
3. **Renderer (`src/render.ts`)**: Traverses the AST and produces Markdown string output.
4. **Main Entry Point (`src/convert.ts`)**: Provides the `convert(input: string)` function which handles pre-processing, parsing, and rendering.
5. **Tests (`src/test`)**: Unit tests for each component.

### Development Commands
- **Install dependencies**: `pnpm install`
- **Run tests**: `pnpm test`
- **Lint & tsc**: `pnpm check`
- **Run tests single test**: `pnpm test path/to/test.ts`
- **Run tests based on a pattern**: `pnpm test -t pattern`

### Testing Strategy
- Before adding a new feature, refactor the existing code to ensure the new feature is easy to implement
- Run all tests to ensure the existing functionality is not affected
- Add tests for the new feature
- Check all tests pass
- Check the code with `pnpm check`

### Contribution Guidelines
- Ensure all tests pass before submitting changes.
- Parser should avoid throwing exceptions and implement reasonable fallbacks.
- Whitespaces should only be preserved if they matter in the rendered markdown (eg, if they matter in the HTML output)