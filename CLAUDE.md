# CLAUDE.md — Workspace Rules & Workflows

## Command Guidelines
Always use `npm` for Node.js package operations and script execution (user preference).
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Typecheck**: `npm run typecheck`

## Graphify Memory & Ingestion Layer
This codebase is fully mapped into a structured semantic knowledge graph using **Graphify**. 

### 1. Verification & Map First (Rule)
Before reading large blocks of files sequentially or running broad grep queries across directory trees, the AI assistant MUST reference the local knowledge graph:
- Query `/graphify` or check `graphify-out/graph.json` to analyze module interfaces, import chains, and type inheritance.
- Read `graphify-out/GRAPH_REPORT.md` for a human-readable synthesis of core code components and architectural hubs.

### 2. Maintenance Workflow (Workflow)
Keep the knowledge graph updated to prevent semantic drifting:
- After introducing new components or refactoring directory layouts, run:
  ```bash
  graphify . --update
  ```
- If the project files undergo radical structural changes, perform a full re-build:
  ```bash
  graphify .
  ```
