# Graph Report - .  (2026-05-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 313 nodes · 664 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `46b35076`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Tactical UI Components Hub|Tactical UI Components Hub]]
- [[_COMMUNITY_Terminal UI Forge|Terminal UI Forge]]
- [[_COMMUNITY_Radix Primitives Hub|Radix Primitives Hub]]
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
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 85 edges
2. `ComponentsSection()` - 68 edges
3. `TacticalWidgets()` - 29 edges
4. `compilerOptions` - 19 edges
5. `DropdownMenu()` - 17 edges
6. `compilerOptions` - 16 edges
7. `TelemetrySection()` - 16 edges
8. `Badge()` - 13 edges
9. `Button()` - 13 edges
10. `scripts` - 12 edges

## Surprising Connections (you probably didn't know these)
- `graphify pipeline` --conceptually_related_to--> `Graphify Memory & Ingestion Layer`  [INFERRED]
  .agents/workflows/graphify.md → CLAUDE.md
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarGroup()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarGroupCount()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

## Communities (18 total, 4 thin omitted)

### Community 0 - "Tactical UI Components Hub"
Cohesion: 0.11
Nodes (42): TuiContainer, ComponentsSection(), ComponentsSectionProps, ICON_LIST, IconItem, BrutalistSlider(), BrutalistSliderProps, LogMessage (+34 more)

### Community 1 - "Terminal UI Forge"
Cohesion: 0.10
Nodes (25): ResolvedTheme, Theme, THEME_VALUES, ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, useTheme() (+17 more)

### Community 2 - "Radix Primitives Hub"
Cohesion: 0.11
Nodes (29): cn(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuPortal() (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (18): latencyData, processData, radarData, TelemetrySection(), TelemetrySectionProps, weeklyData, Button(), buttonVariants (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (21): APP_TSX_PATH, __dirname, __filename, ROOT_DIR, TEMPLATE_DIR_PATH, APP_TSX_PATH, __dirname, __filename (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (33): dependencies, class-variance-authority, clsx, @fontsource-variable/jetbrains-mono, radix-ui, react, react-dom, recharts (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.40
Nodes (4): TuiContainer, TuiContainerProps, TuiRadar(), TuiRadarProps

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (11): Adding components, 🧼 Clean the Template (Start Fresh), 🧹 How to Clean the Template (Start Fresh), 🚀 Key Features, 🧠 maintaining the Graphify Knowledge Graph, 🛠️ Quick Start, React + TypeScript + Vite + shadcn/ui, 📟 Restore/Initialize the Template (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (11): Graphify Memory & Ingestion Layer, graphify-out/, template-tui, graphify, graphify query, 1. Verification & Map First (Rule), 2. Maintenance Workflow (Workflow), CLAUDE.md — Workspace Rules & Workflows (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, files, @/*, references

## Knowledge Gaps
- **138 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Radix Primitives Hub` to `Tactical UI Components Hub`, `Terminal UI Forge`, `Community 5`, `Community 9`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `TuiContainer` connect `Tactical UI Components Hub` to `Terminal UI Forge`, `Radix Primitives Hub`, `Community 5`, `Community 9`, `Community 11`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `ComponentsSection()` connect `Tactical UI Components Hub` to `Terminal UI Forge`, `Radix Primitives Hub`, `Community 5`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tactical UI Components Hub` be split into smaller, more focused modules?**
  _Cohesion score 0.11447811447811448 - nodes in this community are weakly interconnected._
- **Should `Terminal UI Forge` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._
- **Should `Radix Primitives Hub` be split into smaller, more focused modules?**
  _Cohesion score 0.11363636363636363 - nodes in this community are weakly interconnected._