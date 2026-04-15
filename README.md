# Datapus

Datapus is a V1 systems and dependency mapper for teams that need a clear, structured view of how their tools connect.

It is intentionally focused on domains, systems, typed relationships, and profile-based filtered views. This is not a freeform whiteboard.

## The Problem Datapus Solves

Most stack documentation is either static spreadsheets or overly loose diagrams. Both break down when you need to answer practical questions like:

- What systems are core dependencies?
- Where do we have overlapping tools?
- What changes are risky because of downstream links?
- What does this map look like for just one scope or team?

Datapus gives you a practical model and an interactive map so those answers stay visible and usable.

## V1 Feature Set

- Domain management with color-coding and ordering
- System records (name, vendor, URL, description, domain assignments)
- Typed relationships between systems
- Graph map powered by layout + filtering controls
- Search highlight and auto-center on single match
- Edge display modes: separate relationships or grouped relationships
- Relationship creation and editing from map interactions
- System edit/delete flows directly from map node actions
- Profiles for saved system subsets and scoped views
- Dashboard with high-level counts, domain breakdown, top connected systems, and attention items
- Demo seed data loader for quick local exploration

## Current Stack

- Next.js (App Router)
- React
- Zustand + persist middleware (local state persistence)
- React Flow (`@xyflow/react`) for the map
- Dagre for automatic graph layout
- Tailwind CSS + shadcn/Radix UI primitives
- Sonner for toasts

## Run Locally

### Requirements

- Node.js 20+ (recommended)
- npm

### Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Useful Scripts

```bash
npm run lint
npm run build
npm run start
```

## Project Structure

```text
app/
  page.js                 Dashboard
  map/page.js             Map screen + filter/layout state
  systems/page.js         Systems list + profile-aware flows
  profiles/page.js        Profile management
components/
  map/                    React Flow graph + map UI components
  systems/                System forms/tables/detail UI
  dashboard/              Dashboard widgets
store/
  use-map-store.js        Core persisted app state + mutations
hooks/
  use-filtered-data.js    Active-profile scoped data projection
lib/
  constants.js            Connection/domain constants
  seed-data.js            Demo seed generator
```

## Practical Data Model

Datapus uses a simple client-side model in `store/use-map-store.js`.

- `domains`: category buckets with `id`, `name`, `color`, `description`, `position`
- `systems`: stack entries with `id`, metadata, and `domainIds[]`
- `connections`: typed links with `sourceId`, `targetId`, `type`, optional `note`
- `profiles`: named subsets with `systemIds[]`
- `activeProfileId`: current profile context (or all systems when null)

How it behaves in practice:

- Profile active:
  - Systems are limited to profile `systemIds`
  - Domains are reduced to domains used by those systems
  - Connections are reduced to links where both endpoints are in the profile
- Map filters then apply on top of profile scope:
  - Domain filter limits visible systems
  - Connection type filter limits emphasized relationships
  - Search highlights matching systems and centers when exactly one match

## Current Status

What this is:

- A usable V1 for structured systems mapping and dependency visibility
- A local-first product prototype with fast iteration loops
- Strong enough for modeling and discussion workflows

What this is not yet:

- No backend, auth, or multi-user collaboration
- No sync across devices/environments
- No import/export pipeline or API integrations
- No advanced governance workflows yet

## Near-Term Roadmap

- Stabilize map interaction architecture and reduce component complexity
- Add import/export for portable maps
- Add richer profile workflows and comparison views
- Improve relationship metadata depth and map auditability
- Introduce backend persistence and collaboration in a later phase
