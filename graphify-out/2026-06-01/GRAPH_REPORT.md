# Graph Report - VaultlegV2  (2026-06-01)

## Corpus Check
- 27 files · ~7,633 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 243 nodes · 325 edges · 18 communities (12 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c25ad14c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Tactical UI Components Forge|Tactical UI Components Forge]]
- [[_COMMUNITY_Vivid TUI Components Hub|Vivid TUI Components Hub]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Modern Package Masters|Modern Package Masters]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Nimble Pnpm Pioneers|Nimble Pnpm Pioneers]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 24 edges
2. `TuiText()` - 12 edges
3. `scripts` - 12 edges
4. `expo` - 11 edges
5. `scripts` - 8 edges
6. `Transaction` - 7 edges
7. `TuiLogger` - 7 edges
8. `📟 template-tui — Retro-Brutalist TUI Design System` - 7 edges
9. `logger` - 6 edges
10. `📟 template-tui — Retro-Brutalist TUI Design System` - 6 edges

## Surprising Connections (you probably didn't know these)
- `MainApp()` --calls--> `useTheme()`  [EXTRACTED]
  App.tsx → src/theme/theme-provider.tsx
- `graphify pipeline` --conceptually_related_to--> `Graphify Memory & Ingestion Layer`  [INFERRED]
  .agents/workflows/graphify.md → CLAUDE.md
- `Graphify Memory & Ingestion Layer` --references--> `graphify-out/`  [EXTRACTED]
  CLAUDE.md → README.md
- `graphify query` --references--> `graphify-out/`  [EXTRACTED]
  .agents/rules/graphify.md → README.md
- `TuiCheckbox()` --calls--> `useTheme()`  [EXTRACTED]
  src/components/tui-checkbox.tsx → src/theme/theme-provider.tsx

## Communities (18 total, 6 thin omitted)

### Community 0 - "Tactical UI Components Forge"
Cohesion: 0.15
Nodes (16): AddTransaction(), AddTransactionProps, styles, Dashboard(), DashboardProps, getCategoryIcon(), Budget, CATEGORIES (+8 more)

### Community 1 - "Vivid TUI Components Hub"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, @types/node (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (34): styles, TuiButton(), TuiButtonProps, ChartItem, styles, TuiBarChart(), TuiBarChartProps, TuiProgressMeter() (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, prettier-plugin-tailwindcss (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (21): APP_TSX_PATH, __dirname, __filename, ROOT_DIR, TEMPLATE_DIR_PATH, APP_TSX_PATH, __dirname, __filename (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (25): name, private, type, version, dependencies, expo, expo-font, @expo-google-fonts/jetbrains-mono (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (14): dependencies, class-variance-authority, clsx, @fontsource-variable/jetbrains-mono, radix-ui, react, react-dom, recharts (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): Adding components, 🧼 Clean the Template (Start Fresh), 🧹 How to Clean the Template (Start Fresh), 🚀 Key Features, 🧠 maintaining the Graphify Knowledge Graph, 🛠️ Quick Start, React + TypeScript + Vite + shadcn/ui, 📟 Restore/Initialize the Template (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): Graphify Memory & Ingestion Layer, graphify-out/, template-tui, TuiContainer, graphify, graphify query, 1. Verification & Map First (Rule), 2. Maintenance Workflow (Workflow) (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (9): compilerOptions, paths, files, @/*, references, compilerOptions, strict, exclude (+1 more)

## Knowledge Gaps
- **152 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `Community 6` to `Community 7`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 4` to `Community 7`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 8` to `Community 7`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tactical UI Components Forge` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._