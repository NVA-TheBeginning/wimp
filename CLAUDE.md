## Project Overview

WIMP is a terminal UI application built with OpenTUI React and Bun runtime.

## Commands

```bash
bun dev          # Watch mode development
bun run build    # Compile to standalone binary (outputs ./tui)
bun run lint     # Biome lint with auto-fix
```

## Architecture

- **Runtime**: Bun
- **UI Framework**: OpenTUI with React 19 bindings
- **Entry Point**: `src/index.tsx`
- **Build Output**: Standalone binary `./tui`

OpenTUI uses React components for terminal rendering:
- `box` - Flexbox-style container
- `text` - Text display with attributes (DIM, BOLD, etc.)
- `ascii-font` - ASCII art text rendering

## Code Standards

Biome enforces:
- React function components only (no class components)
- No CommonJS (ESM only)
- Interface-based types (not type aliases)
- Double quotes for strings
- 120 char line width, 2-space indent
