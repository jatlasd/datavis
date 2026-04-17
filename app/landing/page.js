import Link from "next/link";
import Image from "next/image";
import {
  Network,
  Layers,
  Tags,
  Server,
  FolderOpen,
  GitCompareArrows,
  Search,
  ArrowRight,
  Check,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Datapus — A structured map of your tech stack",
  description:
    "Datapus is a systems and dependency mapper for teams that need a clear, structured view of how their tools connect. Domains, typed relationships, and profile-based views — not a freeform whiteboard.",
};

function SectionLabel({ children }) {
  return (
    <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function Screenshot({ src, alt, width, height, priority = false }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-muted/30 shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.18)]">
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-2">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
          {alt}
        </span>
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="block w-full"
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/landing" className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-foreground text-background">
              <Network className="size-3.5" />
            </span>
            <span className="font-semibold tracking-tight">Datapus</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              v1
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#surfaces" className="hover:text-foreground">
              Product
            </a>
            <a href="#model" className="hover:text-foreground">
              Model
            </a>
            <a href="#comparison" className="hover:text-foreground">
              Why
            </a>
            <a href="#status" className="hover:text-foreground">
              Status
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/map">See the map</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/">
                Open app
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Local-first. V1 available now.
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            A structured map of your stack,
            <span className="text-muted-foreground"> not another whiteboard.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Datapus models the tools you actually run as domains, systems, and typed
            relationships. You get an interactive dependency map that stays accurate
            enough to answer real questions about your stack.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-10 px-4">
              <Link href="/">
                Open the app
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-10 px-4">
              <Link href="/map">See a live example map</Link>
            </Button>
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              No signup. Runs in your browser.
            </span>
          </div>

          <div className="mt-14">
            <Screenshot
              src="/landing/map-canvas.png"
              alt="datapus / map"
              width={1400}
              height={900}
              priority
            />
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-8 border-t pt-8 sm:grid-cols-4">
            {[
              { v: "Domains", l: "Color-coded buckets for grouping systems" },
              { v: "Systems", l: "Name, vendor, description, links, tags" },
              { v: "Typed links", l: "feeds_into, depends_on, overlaps_with…" },
              { v: "Profiles", l: "Saved subsets for scoped views" },
            ].map((x) => (
              <div key={x.v}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {x.v}
                </dt>
                <dd className="mt-1 text-sm">{x.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="comparison" className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel>The problem</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Stack docs are usually a spreadsheet or a drawing. Both break
            down when you need an actual answer.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground">
            Datapus sits between the two. It is strict enough to be accurate and
            flexible enough to be useful. No freeform shapes. No AI guessing.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Spreadsheet",
                body: "Rows of tools with no relationships. You can't see what's upstream, downstream, or duplicated.",
                marks: [
                  { ok: false, t: "No relationships" },
                  { ok: false, t: "No scoped views" },
                  { ok: false, t: "Stale by week two" },
                ],
              },
              {
                title: "Whiteboard / Figma",
                body: "Free-shape diagrams look great in a review and then fall apart the next time someone adds a tool.",
                marks: [
                  { ok: false, t: "No structure" },
                  { ok: false, t: "No filters" },
                  { ok: false, t: "Fragile layout" },
                ],
              },
              {
                title: "Datapus",
                body: "A typed model with a graph over it. Add a system, tag a domain, draw a relationship — the map updates.",
                marks: [
                  { ok: true, t: "Typed relationships" },
                  { ok: true, t: "Filters, search, profiles" },
                  { ok: true, t: "Auto-laid-out map" },
                ],
                accent: true,
              },
            ].map((c) => (
              <div
                key={c.title}
                className={`rounded-xl border bg-card p-6 ${
                  c.accent ? "ring-1 ring-foreground/80" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{c.title}</h3>
                  {c.accent && (
                    <span className="rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-background">
                      This app
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
                <ul className="mt-5 space-y-2">
                  {c.marks.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={`grid size-4 place-items-center rounded-full border ${
                          m.ok
                            ? "border-emerald-600 bg-emerald-600/10 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {m.ok ? (
                          <Check className="size-2.5" strokeWidth={3} />
                        ) : (
                          <Minus className="size-2.5" strokeWidth={3} />
                        )}
                      </span>
                      <span
                        className={
                          m.ok ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {m.t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="surfaces" className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel>The product</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Four surfaces, one model.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground">
            Every screen reads from the same typed model, so adding a system or
            tagging a domain updates the graph, the lists, and the overlap view
            at the same time.
          </p>

          <div className="mt-14 grid gap-14">
            <Surface
              reverse={false}
              eyebrow="01 / Dashboard"
              title="A plain‑language read on your stack."
              body="Counts, breakdowns by domain and category, most-connected systems, and an honest 'needs attention' list for systems missing domains, categories, or connections."
              bullets={[
                "High-level counts at the top",
                "Systems by domain and by category",
                "Most-connected systems ranked",
                "Attention items surfaced, not hidden",
              ]}
              src="/landing/dashboard.png"
              alt="datapus / dashboard"
            />
            <Surface
              reverse={true}
              eyebrow="02 / Map"
              title="An interactive dependency graph that updates in real time."
              body="Built on React Flow with automatic Dagre layout. Typed edges, grouped or separate. Domain and connection-type filters. Search to highlight or auto-center. Isolate a node to see just its neighborhood."
              bullets={[
                "Typed edges: depends_on, feeds_into, overlaps_with…",
                "Grouped or separate edge display",
                "Search highlight with single-match auto-center",
                "Pin, isolate, and hide nodes per working session",
              ]}
              src="/landing/map.png"
              alt="datapus / map"
            />
            <Surface
              reverse={false}
              eyebrow="03 / Systems"
              title="A real table for the real list."
              body="Every system with its vendor, domains, categories, and connection count. Sortable and filterable by domain or category, and editable inline — not buried under a modal tree."
              bullets={[
                "Sort and filter by any column",
                "Multi-domain and multi-category tagging",
                "Per-system detail page with relationships",
                "Profile-aware: table scopes to your active view",
              ]}
              src="/landing/systems.png"
              alt="datapus / systems"
            />
            <Surface
              reverse={true}
              eyebrow="04 / Overlaps"
              title="Review where you have two tools doing the same job."
              body="Datapus scores system pairs by shared domains and categories, and ranks them high, medium, or low. Confirm a duplicate, mark as a possible overlap, or dismiss — the result flows back into the map."
              bullets={[
                "Candidate list with shared-domain reasoning",
                "Confirm or downgrade with one click",
                "Results show up as typed edges in the map",
                "A practical path to stack consolidation",
              ]}
              src="/landing/overlaps.png"
              alt="datapus / overlaps"
            />
          </div>
        </div>
      </section>

      <section id="model" className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel>The mental model</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Four objects. That is the whole model.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground">
            No custom properties, no schemas to design. Start with a handful of
            domains, drop your systems in, draw the relationships you already
            know, and use profiles to focus on a scope or team.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Layers,
                name: "Domains",
                body: "Color-coded areas of your stack: Identity, Data, Ops, Learning. Order them however you think about your business.",
              },
              {
                icon: Server,
                name: "Systems",
                body: "The actual tools: name, vendor, link, description, and the domains and categories they belong to.",
              },
              {
                icon: Network,
                name: "Typed connections",
                body: "Depends on, feeds into, overlaps with, duplicates, replaces. The edges explain themselves.",
              },
              {
                icon: FolderOpen,
                name: "Profiles",
                body: "Named subsets for a team, an audit, or a migration. Switch profiles and the whole app scopes with you.",
              },
            ].map((o) => (
              <div key={o.name} className="rounded-xl border bg-card p-5">
                <div className="grid size-8 place-items-center rounded-md bg-muted">
                  <o.icon className="size-4 text-foreground" />
                </div>
                <div className="mt-4 font-medium">{o.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionLabel>Details that matter in day-to-day use</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for people who have to maintain this thing.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Network,
                name: "Automatic layout",
                body: "Dagre lays the graph out so you do not spend time arranging nodes. Toggle left-right or top-down.",
              },
              {
                icon: Search,
                name: "Search + auto-center",
                body: "Type to highlight matching systems. If there's exactly one, the map centers on it.",
              },
              {
                icon: Tags,
                name: "Grouped or separate edges",
                body: "Flip between one aggregated edge per pair or one edge per relationship type.",
              },
              {
                icon: GitCompareArrows,
                name: "Overlap detection",
                body: "Shared-domain and shared-category scoring turns hunches into a ranked list you can review.",
              },
              {
                icon: FolderOpen,
                name: "Profile-scoped everything",
                body: "Systems, domains, categories, and connections all reduce to the active profile's scope.",
              },
              {
                icon: Server,
                name: "Local persistence",
                body: "Zustand + persist. Your model sticks between sessions, no account required.",
              },
            ].map((f) => (
              <div key={f.name} className="bg-background p-6">
                <div className="grid size-8 place-items-center rounded-md bg-muted">
                  <f.icon className="size-4" />
                </div>
                <div className="mt-4 font-medium">{f.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <SectionLabel>Questions this is meant to answer</SectionLabel>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                The questions spreadsheets cannot answer at a glance.
              </h2>
              <p className="mt-5 max-w-md text-base text-muted-foreground">
                Datapus exists because answering the questions on the right
                usually takes more meetings than it should.
              </p>
            </div>
            <ul className="flex flex-col divide-y rounded-xl border bg-card">
              {[
                "Which systems are core dependencies?",
                "Where do we have overlapping tools doing the same job?",
                "What downstream impact does changing this tool have?",
                "What does our stack look like for just the learning team?",
                "Which systems have no owner, no domain, or no connections?",
                "Which tool is replacing which, and where are we in that migration?",
              ].map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 px-5 py-4 text-sm"
                >
                  <span className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="status" className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionLabel>What V1 is, and what it is not</SectionLabel>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Honest about what works and what doesn&rsquo;t.
              </h2>
              <p className="mt-5 max-w-lg text-base text-muted-foreground">
                Datapus is a usable V1 for structured stack mapping and
                dependency visibility. It is local-first and strong enough to
                model and discuss your stack today. Anything beyond that is on
                the roadmap, not in the product.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/">
                    Open the app
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/map">Jump straight to the map</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatusCard
                tone="on"
                title="Shipping in V1"
                items={[
                  "Domain and category management",
                  "Typed connections between systems",
                  "Interactive, auto-laid-out map",
                  "Profile-scoped views",
                  "Overlap review flow",
                  "Demo seed data for quick tours",
                ]}
              />
              <StatusCard
                tone="off"
                title="Not here yet"
                items={[
                  "Backend, auth, multi-user sync",
                  "Import / export pipelines",
                  "API integrations and webhooks",
                  "Governance and approval flows",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop redrawing the stack diagram every quarter.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Open the app, load the demo data, and see your kind of stack
            modeled in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-10 px-4">
              <Link href="/">
                Open the app
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-10 px-4">
              <Link href="/map">Explore the map</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-md bg-foreground text-background">
              <Network className="size-3" />
            </span>
            <span className="text-sm font-medium">Datapus</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              A structured systems map
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              App
            </Link>
            <Link href="/map" className="hover:text-foreground">
              Map
            </Link>
            <Link href="/overlaps" className="hover:text-foreground">
              Overlaps
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Surface({ reverse, eyebrow, title, body, bullets, src, alt }) {
  return (
    <div
      className={`grid items-center gap-10 lg:grid-cols-2 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </div>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-base text-muted-foreground">{body}</p>
        <ul className="mt-6 space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-foreground" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <Screenshot src={src} alt={alt} width={1600} height={1000} />
    </div>
  );
}

function StatusCard({ tone, title, items }) {
  const isOn = tone === "on";
  return (
    <div
      className={`rounded-xl border p-5 ${
        isOn ? "bg-card" : "bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`size-2 rounded-full ${
            isOn ? "bg-emerald-500" : "bg-muted-foreground/40"
          }`}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${
                isOn
                  ? "border-emerald-600 bg-emerald-600/10 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400"
                  : "border-border text-muted-foreground"
              }`}
            >
              {isOn ? (
                <Check className="size-2.5" strokeWidth={3} />
              ) : (
                <Minus className="size-2.5" strokeWidth={3} />
              )}
            </span>
            <span className={isOn ? "" : "text-muted-foreground"}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
