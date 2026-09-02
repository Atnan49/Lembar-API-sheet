# Graph Report - Lembar  (2026-09-02)

## Corpus Check
- Corpus is ~21,473 words - fits in a single context window. You may not need a graph.

## Summary
- 241 nodes · 365 edges · 21 communities (14 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.93)
- Token cost: 1,250 input · 980 output

## Community Hubs (Navigation)
- Internal API Handlers
- Dashboard & Docs Pages
- Public REST API Endpoints
- Production Dependencies
- TypeScript & Global Types
- Dev Tooling & Linters
- Layout & Navigation Components
- Package Scripts & Metadata
- Pakasir Payment & Webhooks
- Core Architecture & Specs
- OpenGraph Metadata & Banner
- Neo-Brutalist Design System
- Vercel Deployment Config
- NextAuth Type Declarations
- Next.js Build Configuration
- PostCSS Style Pipeline
- LLM Discoverability & Docs
- Tailwind CSS Configuration
- Agent Behavior Guidelines

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `validateApiKeyRequest()` - 12 edges
3. `prisma` - 12 edges
4. `authOptions` - 10 edges
5. `decryptToken()` - 10 edges
6. `getSheetsService()` - 8 edges
7. `Button` - 7 edges
8. `createSheetTab()` - 7 edges
9. `scripts` - 6 edges
10. `POST()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Security Architecture & Encryption` --semantically_similar_to--> `Formula Injection Prevention`  [INFERRED] [semantically similar]
  README.md → vibecoding-sheets-to-api (1).md
- `Lembar Neo-Brutalist Logo` --implements--> `Neo-Brutalism & Wireframe Design System`  [INFERRED]
  public/logo.svg → desain.md
- `Lembar Yellow Sheet Favicon` --semantically_similar_to--> `Lembar Neo-Brutalist Logo`  [INFERRED] [semantically similar]
  src/app/icon.svg → public/logo.svg
- `Lembar Sheets-to-API Project` --conceptually_related_to--> `Lembar Architecture & Product Roadmap`  [INFERRED]
  README.md → vibecoding-sheets-to-api (1).md
- `POST()` --calls--> `createSheetTab()`  [EXTRACTED]
  src/app/api/sheets/[id]/create-tab/route.ts → src/lib/google-sheets.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core Sheets to API Platform Architecture** — readme_md_lembar_project, vibecoding_sheets_to_api_1_md_product_architecture, readme_md_auto_create_tab, vibecoding_sheets_to_api_1_md_single_oauth_consent [INFERRED 0.85]
- **Neo-Brutalism Visual Identity & Assets** — desain_md_neobrutalism_design_system, desain_md_high_contrast_palette, public_logo_svg_brand_logo, src_app_icon_svg_app_icon [INFERRED 0.95]

## Communities (21 total, 5 thin omitted)

### Community 0 - "Internal API Handlers"
Cohesion: 0.15
Nodes (18): handler, POST(), POST(), RouteParams, POST(), RouteParams, GET(), RouteParams (+10 more)

### Community 1 - "Dashboard & Docs Pages"
Cohesion: 0.12
Nodes (15): ConnectedSheetItem, Badge(), BadgeProps, Button, ButtonProps, Card(), CardContent(), CardDescription() (+7 more)

### Community 2 - "Public REST API Endpoints"
Cohesion: 0.16
Nodes (21): POST(), RouteParams, GET(), POST(), RouteParams, DELETE(), PUT(), RouteParams (+13 more)

### Community 3 - "Production Dependencies"
Cohesion: 0.07
Nodes (27): clsx, googleapis, lucide-react, nanoid, next, next-auth, dependencies, clsx (+19 more)

### Community 4 - "TypeScript & Global Types"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 5 - "Dev Tooling & Linters"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 6 - "Layout & Navigation Components"
Cohesion: 0.25
Nodes (5): metadata, Footer(), Navbar(), SessionProvider(), JsonLd()

### Community 7 - "Package Scripts & Metadata"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, postinstall, start (+1 more)

### Community 8 - "Pakasir Payment & Webhooks"
Cohesion: 0.29
Nodes (7): POST(), createPakasirTransaction(), CreateTransactionParams, getPakasirPaymentUrl(), PAKASIR_CONFIG, PakasirWebhookPayload, PRO_PLAN_CONFIG

### Community 9 - "Core Architecture & Specs"
Cohesion: 0.29
Nodes (8): Auto-create Tab & Header Feature, Lembar Sheets-to-API Project, Pakasir QRIS Payment Integration, Security Architecture & Encryption, Formula Injection Prevention, Freemium & Tier Structure, Lembar Architecture & Product Roadmap, Single OAuth Consent Mechanism

### Community 10 - "OpenGraph Metadata & Banner"
Cohesion: 0.33
Nodes (4): alt, contentType, runtime, size

### Community 11 - "Neo-Brutalist Design System"
Cohesion: 0.40
Nodes (5): High Contrast Color Palette, Neo-Brutalism & Wireframe Design System, Sharp Borders & Solid Box Shadows Rule, Lembar Neo-Brutalist Logo, Lembar Yellow Sheet Favicon

### Community 12 - "Vercel Deployment Config"
Cohesion: 0.40
Nodes (4): sin1, buildCommand, framework, regions

### Community 13 - "NextAuth Type Declarations"
Cohesion: 0.40
Nodes (4): JWT, next-auth, next-auth/jwt, Session

## Knowledge Gaps
- **94 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 115 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Production Dependencies` to `Package Scripts & Metadata`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Tooling & Linters` to `Package Scripts & Metadata`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `prisma` connect `Internal API Handlers` to `Pakasir Payment & Webhooks`, `Public REST API Endpoints`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Internal API Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.14795008912655971 - nodes in this community are weakly interconnected._
- **Should `Dashboard & Docs Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.12258064516129032 - nodes in this community are weakly interconnected._
- **Should `Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._