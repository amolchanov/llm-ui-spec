# Claude Code Instructions

## Project Overview
This is the LLM UI Spec Editor - a visual editor for LLM UI Spec XML files built with React, TypeScript, Vite, and shadcn/ui.

## Development Server
The dev server runs at http://localhost:5173/. Start it with:
```bash
cd editor && npm run dev
```

## Auto-Commit Behavior
After completing any requested changes, automatically commit if there are modifications:

1. Check for changes: `git status --porcelain`
2. If changes exist:
   - Stage all changes: `git add -A`
   - Create a short, descriptive commit message (1 line, max 72 chars)
   - Commit with: `git commit -m "message"`
3. Do NOT push unless explicitly requested

### Commit Message Format
- Use imperative mood: "Add feature" not "Added feature"
- Be concise: "Fix canvas click deselection bug" not "Fixed the bug where clicking on the canvas would deselect everything"
- Common prefixes: Add, Fix, Update, Remove, Refactor, Improve

### Examples
```
Add split container dialog for layouts
Fix element drag-drop within containers
Update properties dialog with element-specific fields
Remove unused switch component
Refactor selection store to preserve edit context
```

## Key Directories
- `editor/src/components/` - React components
- `editor/src/store/` - Zustand state stores
- `editor/src/lib/` - Utilities, XML parsing, DnD context
- `editor/src/types/` - TypeScript type definitions
- `samples/` - Sample XML files for testing
- `docs/` - VitePress documentation site

## Documentation Site

The spec documentation is hosted at https://llm-ui-spec.org/ using VitePress.

### Commands
```bash
npm run docs:dev    # Start local dev server
npm run docs:build  # Build for production
```

### Skill: /docs
Use `/docs` to sync and deploy documentation:
- `/docs` - Sync spec files from root to docs/
- `/docs build` - Sync and build locally
- `/docs deploy` - Sync, commit, and push to deploy
