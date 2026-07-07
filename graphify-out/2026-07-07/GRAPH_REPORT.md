# Graph Report - VaultlegV2  (2026-07-07)

## Corpus Check
- 64 files · ~71,787 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 705 nodes · 1209 edges · 60 communities (54 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b1021aab`
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
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 62 edges
2. `Fallow: Critical Gotchas` - 32 edges
3. `Fallow CLI Reference` - 30 edges
4. `TuiText()` - 27 edges
5. `Transaction` - 27 edges
6. `Common Workflows` - 22 edges
7. `Debt` - 21 edges
8. `Fallow: codebase intelligence for JavaScript and TypeScript` - 17 edges
9. `Fallow: Common Workflow Patterns & Recipes` - 17 edges
10. `CI Pipeline Setup` - 17 edges

## Surprising Connections (you probably didn't know these)
- `graphify pipeline` --conceptually_related_to--> `Graphify Memory & Ingestion Layer`  [INFERRED]
  .agents/workflows/graphify.md → CLAUDE.md
- `MainApp()` --calls--> `getTodayDateString()`  [EXTRACTED]
  App.tsx → src/screens/debts.tsx
- `MainApp()` --calls--> `useTheme()`  [EXTRACTED]
  App.tsx → src/theme/theme-provider.tsx
- `MainApp()` --calls--> `useAppState()`  [EXTRACTED]
  App.tsx → src/hooks/use-app-state.ts
- `MainApp()` --calls--> `useFabMenu()`  [EXTRACTED]
  App.tsx → src/hooks/use-fab-menu.ts

## Communities (60 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (39): Agent Rules, Analyze specific workspaces, Audit a project for cleanup opportunities, Catch typos in entry file exports, Check if a PR introduces quality risk, Commands, Common Workflows, Configuration (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (71): styles, TuiButton(), TuiButtonProps, TuiCalendar(), styles, TuiCheckbox(), TuiCheckboxProps, styles (+63 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (19): dependencies, expo, expo-document-picker, expo-file-system, expo-font, @expo-google-fonts/jetbrains-mono, expo-sharing, expo-splash-screen (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, versionCode, expo (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, prettier-plugin-tailwindcss (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.50
Nodes (3): apps, identifier, name

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (33): Baseline Comparison Tracks Issue Identity, `--changed-since` Shows Only New Issues, Class Instance Members Are Tracked, Decorated Members Are Skipped By Default, Don't Create Config Unless Needed, Duplication Modes Affect What's Detected, Dynamically Loaded Files: Use `dynamicallyLoaded`, Exit Code 1 vs 2 (+25 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (9): name, private, type, version, author, main, name, private (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (14): dependencies, class-variance-authority, clsx, @fontsource-variable/jetbrains-mono, radix-ui, react, react-dom, recharts (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (39): ChartItem, MeterSegment, styles, TuiBarChart(), TuiBarChartProps, TuiProgressMeter(), TuiProgressMeterProps, TuiSegmentedMeter() (+31 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): Adding components, 🧼 Clean the Template (Start Fresh), 🧹 How to Clean the Template (Start Fresh), 🚀 Key Features, 🧠 maintaining the Graphify Knowledge Graph, 🛠️ Quick Start, React + TypeScript + Vite + shadcn/ui, 📟 Restore/Initialize the Template (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (17): Graphify Memory & Ingestion Layer, graphify-out/, template-tui, TuiContainer, graphify, graphify query, 1. Verification & Map First (Rule), 2. Maintenance Workflow (Workflow) (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (9): compilerOptions, paths, files, @/*, references, compilerOptions, strict, exclude (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, init-template, int-template, lint, preview (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (8): scripts, android, format, ios, lint, start, typecheck, web

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (19): Behavior, CI Integration, `ci`: Provider-Aware Review Automation, Combined Mode Flags, `config-schema`: Config JSON Schema, Environment Variables, Fallow CLI Reference, Flags (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (17): CI Pipeline Setup, GitHub Actions: Basic, GitHub Actions: Duplication Gate, GitHub Actions: Inline PR Annotations (No Advanced Security), GitHub Actions: PR-Scoped Check, GitHub Actions: PR-Scoped Duplication Check, GitHub Actions: Security Delta Gate, GitHub Actions: Severity-Aware PR Quality Gate (Audit) (+9 more)

### Community 23 - "Community 23"
Cohesion: 0.50
Nodes (4): Custom Plugin Setup, Option 1: Inline framework config, Option 2: External plugin file, Option 3: Plugin directory

### Community 24 - "Community 24"
Cohesion: 0.11
Nodes (19): FabItem(), FabItemProps, FabMenu(), FabMenuProps, styles, translateDatabaseMessage(), translateLogMessage(), translateNavigationMessage() (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (12): CalendarCell(), CalendarCellProps, compareDatesStr(), getCellDateString(), getCellRangeInfo(), getTextColor(), MONTHS, parseDateString() (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, @types/node (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (5): Migration from knip, Step 1: Preview migration, Step 2: Apply migration, Step 3: Compare results, Step 4: Remove knip config

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (9): `actions` Array, `baseline_deltas` Object, Combined output (`fallow` with no subcommand), `dead-code` output, `dupes` output, Error output (exit code 2), `fix` output (dry-run), Health `actions` array (CRAP findings) (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (8): Actionable error messages, `activate` flags, Clock skew, Exit Codes, Grace ladder, `license`: Manage Continuous Runtime License, Storage precedence, Subcommands

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (8): Examples, Exit Codes, Flags, `health`: Function Complexity & File Health Analysis, Health Trend, JSON Output Structure, Vital Signs, Vital Signs Snapshots

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (7): computedHash, skillPath, source, sourceType, skills, fallow, version

### Community 32 - "Community 32"
Cohesion: 0.06
Nodes (49): BrandLogo(), BrandLogoProps, ScreenType, styles, TuiTabBar(), TuiTabBarProps, TuiTransactionRowProps, AppDrawers() (+41 more)

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (7): `analyze` flags, `coverage`: Production-Coverage Workflow, `coverage upload-source-maps` flags, Environment, Exit Codes, `setup` flow, `upload-inventory` flags

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (7): Examples, File encoding contract, `fix`: Auto-Remove Unused Code, Flags, Low-confidence export removals, On-disk drift protection, What gets fixed

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (7): Full Project Audit, Step 1: Run full analysis, Step 2: Review issue counts, Step 3: Find duplication, Step 4: Preview auto-fix, Step 5: Apply fixes (after user confirmation), Step 6: Verify

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (7): Safe Auto-Fix Workflow, Step 1: Dry-run first, Step 2: Review each proposed change, Step 3: Confirm with user before applying, Step 4: Apply, Step 5: Verify, Step 6: Run project tests

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (6): `audit`: Changed-File Quality Gate, Examples, Flags, JSON contract: which fields are severity-aware, JSON Output Structure, Verdicts

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (6): Debugging False Positives, If the trace shows it IS used, If the trace shows it's NOT used, Trace a dependency, Trace all edges for a file, Trace an export's usage chain

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (6): Duplication baseline, Incremental Adoption with Baselines, Step 1: Save current state as baseline, Step 2: Commit the baseline, Step 3: CI only fails on NEW issues, Step 4: Gradually fix and update baseline

### Community 40 - "Community 40"
Cohesion: 0.40
Nodes (5): Analyze a single package, Analyze the full monorepo, List all discovered files across workspaces, Monorepo Analysis, Per-package CI

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (5): `.claude/hooks/fallow-gate.sh`, `.claude/settings.json`, Distinguish from `fallow hooks install --target git`, Guard `git push` with a Claude Code PreToolUse hook, Remove the hook

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (5): Cross-directory only, Duplication Threshold CI Gate, Step 1: Measure current duplication, Step 2: Set threshold slightly above current, Step 3: Tighten over time

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (5): Detection mode mapping, Migration from jscpd, Step 1: Preview migration, Step 2: Apply migration, Step 3: Compare results

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (8): Combined Dead Code + Duplication, Fallow: Common Workflow Patterns & Recipes, PR Dead Code Check, Step 1: Analyze changed files, Step 1: Run combined analysis, Step 2: If issues found, show specifics, Step 2: Prioritize cleanup, Table of Contents

### Community 45 - "Community 45"
Cohesion: 0.50
Nodes (4): Arguments, `explain`: Rule Explanation, JSON Output Structure, Usage

### Community 46 - "Community 46"
Cohesion: 0.50
Nodes (4): Configuration field notes, Configuration File Format, JSON Format (`.fallowrc.json` / `.fallowrc.jsonc`), TOML Format (`fallow.toml`)

### Community 47 - "Community 47"
Cohesion: 0.50
Nodes (4): `dead-code`: Dead Code Analysis, Examples, Flags, Issue Type Filters

### Community 48 - "Community 48"
Cohesion: 0.50
Nodes (4): Detected Source Configs, Examples, Flags, `migrate`: Config Migration

### Community 49 - "Community 49"
Cohesion: 0.50
Nodes (4): Detection Modes, `dupes`: Duplication Detection, Examples, Flags

### Community 50 - "Community 50"
Cohesion: 0.50
Nodes (4): Examples, Flags, JSON Output Structure, `security`: Security Candidate Detection

### Community 51 - "Community 51"
Cohesion: 0.50
Nodes (4): Examples, Flags, `flags`: Feature Flag Detection, JSON Output Structure

### Community 52 - "Community 52"
Cohesion: 0.50
Nodes (4): All-in-one with `--ci`, GitHub Code Scanning Integration, Step 1: Generate SARIF output, Step 2: Upload via GitHub Action

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (3): Full audit (default), Production audit, Production vs Full Audit

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (3): `config`: Show Resolved Config, Exit Codes, Flags

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (3): Examples, Flags, `list`: Project Introspection

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (3): Examples, Flags, `init`: Config Generation

### Community 60 - "Community 60"
Cohesion: 0.50
Nodes (3): health, ignore, ignoreDependencies

## Knowledge Gaps
- **435 isolated node(s):** `ignoreDependencies`, `ignore`, `name`, `slug`, `version` (+430 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `Community 1` to `Community 32`, `Community 24`, `Community 9`, `Community 25`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Fallow CLI Reference` connect `Community 21` to `Community 33`, `Community 34`, `Community 37`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 49`, `Community 50`, `Community 51`, `Community 55`, `Community 56`, `Community 57`, `Community 28`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `ignoreDependencies`, `ignore`, `name` to the rest of the system?**
  _438 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06507731958762887 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._