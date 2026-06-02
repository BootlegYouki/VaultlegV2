# Graph Report - VaultlegV2  (2026-06-02)

## Corpus Check
- 36 files · ~22,170 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 309 nodes · 486 edges · 20 communities (14 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `860c3cf4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Modern Package Masters|Modern Package Masters]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Nimble Pnpm Pioneers|Nimble Pnpm Pioneers]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 37 edges
2. `TuiText()` - 18 edges
3. `expo` - 12 edges
4. `scripts` - 12 edges
5. `Transaction` - 11 edges
6. `TuiContainer()` - 9 edges
7. `Debt` - 9 edges
8. `scripts` - 8 edges
9. `TuiButton()` - 7 edges
10. `getCategoryIcon()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `graphify pipeline` --conceptually_related_to--> `Graphify Memory & Ingestion Layer`  [INFERRED]
  .agents/workflows/graphify.md → CLAUDE.md
- `MainApp()` --calls--> `useTheme()`  [EXTRACTED]
  App.tsx → src/theme/theme-provider.tsx
- `MainApp()` --calls--> `getTodayDateString()`  [EXTRACTED]
  App.tsx → src/screens/debts.tsx
- `TuiCheckbox()` --calls--> `useTheme()`  [EXTRACTED]
  src/components/tui-checkbox.tsx → src/theme/theme-provider.tsx
- `TuiSwitch()` --calls--> `useTheme()`  [EXTRACTED]
  src/components/tui-switch.tsx → src/theme/theme-provider.tsx

## Communities (20 total, 6 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.50
Nodes (3): apps, identifier, name

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (18): dependencies, expo, expo-document-picker, expo-file-system, expo-font, @expo-google-fonts/jetbrains-mono, expo-sharing, expo-splash-screen (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (24): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, prettier-plugin-tailwindcss (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (44): BrandLogo(), BrandLogoProps, styles, TuiButton(), TuiButtonProps, styles, TuiContainer(), TuiContainerProps (+36 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (21): APP_TSX_PATH, __dirname, __filename, ROOT_DIR, TEMPLATE_DIR_PATH, APP_TSX_PATH, __dirname, __filename (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (26): name, private, type, version, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (14): dependencies, class-variance-authority, clsx, @fontsource-variable/jetbrains-mono, radix-ui, react, react-dom, recharts (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (23): MONTHS, styles, TuiCalendar(), TuiCalendarProps, WEEKDAYS, styles, TuiCheckbox(), TuiCheckboxProps (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): Adding components, 🧼 Clean the Template (Start Fresh), 🧹 How to Clean the Template (Start Fresh), 🚀 Key Features, 🧠 maintaining the Graphify Knowledge Graph, 🛠️ Quick Start, React + TypeScript + Vite + shadcn/ui, 📟 Restore/Initialize the Template (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): Graphify Memory & Ingestion Layer, graphify-out/, template-tui, TuiContainer, graphify, graphify query, 1. Verification & Map First (Rule), 2. Maintenance Workflow (Workflow) (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (9): compilerOptions, paths, files, @/*, references, compilerOptions, strict, exclude (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.14
Nodes (23): ChartItem, MeterSegment, styles, TuiBarChart(), TuiBarChartProps, TuiProgressMeter(), TuiProgressMeterProps, TuiSegmentedMeter() (+15 more)

## Knowledge Gaps
- **191 isolated node(s):** `name`, `identifier`, `apps`, `name`, `slug` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `Community 6` to `Community 7`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 7`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 4` to `Community 7`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `name`, `identifier`, `apps` to the rest of the system?**
  _194 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._