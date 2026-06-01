# Graph Report - VaultlegV2  (2026-06-01)

## Corpus Check
- 31 files · ~11,378 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 266 nodes · 403 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0814254f`
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
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Nimble Pnpm Pioneers|Nimble Pnpm Pioneers]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 32 edges
2. `TuiText()` - 16 edges
3. `scripts` - 12 edges
4. `expo` - 11 edges
5. `Transaction` - 11 edges
6. `scripts` - 8 edges
7. `TuiContainer()` - 8 edges
8. `TuiButton()` - 7 edges
9. `TuiLogger` - 7 edges
10. `📟 template-tui — Retro-Brutalist TUI Design System` - 7 edges

## Surprising Connections (you probably didn't know these)
- `graphify pipeline` --conceptually_related_to--> `Graphify Memory & Ingestion Layer`  [INFERRED]
  .agents/workflows/graphify.md → CLAUDE.md
- `MainApp()` --calls--> `useTheme()`  [EXTRACTED]
  App.tsx → src/theme/theme-provider.tsx
- `TuiCheckbox()` --calls--> `useTheme()`  [EXTRACTED]
  src/components/tui-checkbox.tsx → src/theme/theme-provider.tsx
- `TuiSwitch()` --calls--> `useTheme()`  [EXTRACTED]
  src/components/tui-switch.tsx → src/theme/theme-provider.tsx
- `Graphify Memory & Ingestion Layer` --references--> `graphify-out/`  [EXTRACTED]
  CLAUDE.md → README.md

## Communities (22 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (11): dependencies, expo, expo-font, @expo-google-fonts/jetbrains-mono, expo-status-bar, lucide-react-native, react, react-dom (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.23
Nodes (10): ChartItem, styles, TuiBarChart(), TuiBarChartProps, TuiProgressMeter(), TuiProgressMeterProps, ASCII_DIGITS, Budgets() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (13): styles, TuiCheckbox(), TuiCheckboxProps, styles, TuiSwitch(), TuiSwitchProps, ACCENT_COLORS, AccentTheme (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (20): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, prettier-plugin-tailwindcss (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (9): ScreenType, styles, TuiTabBar(), TuiTabBarProps, logger, LogListener, KEYS, storage (+1 more)

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
Cohesion: 0.23
Nodes (11): AddTransactionProps, styles, BudgetsProps, Dashboard(), DashboardProps, styles, ExpensesProps, Budget (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): Adding components, 🧼 Clean the Template (Start Fresh), 🧹 How to Clean the Template (Start Fresh), 🚀 Key Features, 🧠 maintaining the Graphify Knowledge Graph, 🛠️ Quick Start, React + TypeScript + Vite + shadcn/ui, 📟 Restore/Initialize the Template (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): Graphify Memory & Ingestion Layer, graphify-out/, template-tui, TuiContainer, graphify, graphify query, 1. Verification & Map First (Rule), 2. Maintenance Workflow (Workflow) (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (9): compilerOptions, paths, files, @/*, references, compilerOptions, strict, exclude (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (16): styles, TuiContainer(), TuiContainerProps, styles, TuiDrawer(), TuiDrawerProps, styles, TuiInput() (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (7): styles, TuiButton(), TuiButtonProps, getCategoryIcon(), Expenses(), FilterType, styles

## Knowledge Gaps
- **163 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `scripts` connect `Community 6` to `Community 7`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 4` to `Community 7`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 8` to `Community 7`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _166 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._