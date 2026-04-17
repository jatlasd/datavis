import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Datapus — A structured map of your tech stack",
  description:
    "Datapus is a local-first V1 for modeling the tools you already run as domains, systems, and typed relationships — and reading the map that falls out of it.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#1b1b1a] [--rule:#d9d4c6] [--muted:#6a665c] [--accent:#b33a22]">
      <div className="mx-auto max-w-[720px] px-6 pb-32">
        <Masthead />
        <Hero />
        <Lede />
        <AnnotatedHero />
        <Objects />
        <Map />
        <Surface
          eyebrow="The dashboard"
          caption="Fig. 2 — Dashboard: counts, breakdowns, most-connected systems, and the honest 'needs attention' list."
          src="/landing/dashboard.png"
          alt="Datapus dashboard with demo seed data"
        />
        <DashboardCopy />
        <Surface
          eyebrow="The systems table"
          caption="Fig. 3 — Systems: every tool you run, every domain it's in, every category it falls under, every connection it has."
          src="/landing/systems.png"
          alt="Datapus systems table"
        />
        <SystemsCopy />
        <Surface
          eyebrow="Overlap review"
          caption="Fig. 4 — Overlaps: shared-domain scoring turns a hunch into a ranked list you can actually walk through."
          src="/landing/overlaps.png"
          alt="Datapus overlap review page"
        />
        <OverlapsCopy />
        <Questions />
        <StatusNote />
        <Colophon />
      </div>
    </div>
  );
}

function Masthead() {
  return (
    <div className="flex items-baseline justify-between border-b border-[var(--rule)] pb-4 pt-10 font-mono text-xs tracking-wide text-[var(--muted)]">
      <span>Datapus &middot; A field note</span>
      <span>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          Open the app &rarr;
        </Link>
      </span>
    </div>
  );
}

function Hero() {
  return (
    <header className="pt-20 pb-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
        No. 01 &middot; On mapping the stack
      </p>
      <h1 className="mt-6 font-[var(--font-instrument-serif)] text-[48px] leading-[1.02] tracking-[-0.01em] sm:text-[72px]">
        A <em className="italic">structured</em> map of your tech stack.
      </h1>
      <p className="hero-lede mt-8 max-w-[52ch] text-[17px] leading-[1.7] text-[#2b2a27]">
        Datapus is a small, opinionated tool for modeling the software your
        organization actually runs. You describe your domains, drop your
        systems into them, draw the relationships you already know about, and
        the map you&rsquo;ve been trying to keep in a spreadsheet or on a
        whiteboard writes itself.
      </p>
      <style>{`
        .hero-lede::first-letter {
          font-family: var(--font-instrument-serif), Georgia, serif;
          font-weight: 400;
          font-size: 64px;
          line-height: 0.85;
          float: left;
          padding: 6px 10px 0 0;
          color: var(--accent);
        }
      `}</style>
    </header>
  );
}

function Lede() {
  return (
    <section className="border-y border-[var(--rule)] py-10">
      <p className="max-w-[58ch] font-[var(--font-instrument-serif)] text-[26px] leading-[1.35] italic text-[#2b2a27] sm:text-[30px]">
        &ldquo;Most stack documentation is either a static spreadsheet or an
        overly loose diagram. Both break down the moment someone has to make a
        decision with them.&rdquo;
      </p>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
        &mdash; The argument, in one sentence
      </p>
    </section>
  );
}

function AnnotatedHero() {
  const pins = [
    {
      n: 1,
      top: "37%",
      left: "23.5%",
      label: "Systems are just named nodes — not free-form shapes.",
    },
    {
      n: 2,
      top: "29%",
      left: "50.5%",
      label: "Every edge carries a type: feeds into, depends on, overlaps with, replaces.",
    },
    {
      n: 3,
      top: "48%",
      left: "23.5%",
      label: "Color is the domain. The model keeps it consistent across every view.",
    },
    {
      n: 4,
      top: "84%",
      left: "90%",
      label: "The relationship legend lives with the map, not in a key on a different slide.",
    },
  ];

  return (
    <figure className="relative mt-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
        Fig. 1 &middot; The map, annotated
      </p>
      <div className="relative mt-4 border border-[var(--rule)] bg-white">
        <Image
          src="/landing/map-canvas.png"
          alt="An annotated view of a Datapus dependency map"
          width={1400}
          height={900}
          priority
          className="block w-full"
        />
        {pins.map((p) => (
          <span
            key={p.n}
            className="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[var(--accent)] bg-white font-mono text-[10px] font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(0,0,0,0.08)]"
            style={{ top: p.top, left: p.left }}
          >
            {p.n}
          </span>
        ))}
      </div>
      <figcaption className="mt-5 grid gap-3 border-t border-dashed border-[var(--rule)] pt-5 sm:grid-cols-2">
        {pins.map((p) => (
          <div key={p.n} className="flex gap-3 text-sm leading-snug">
            <span className="mt-[2px] grid size-5 shrink-0 place-items-center rounded-full border border-[var(--accent)] font-mono text-[10px] font-semibold text-[var(--accent)]">
              {p.n}
            </span>
            <span className="text-[#2b2a27]">{p.label}</span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}

function Objects() {
  return (
    <section className="pt-20">
      <SectionHead kicker="The model" title="Four nouns, and that is the entire model." />
      <div className="mt-10 space-y-8 text-[17px] leading-[1.65] text-[#2b2a27]">
        <p>
          Datapus resists the urge to become a general modeling tool. There
          are four things you will ever create in it, and that is on purpose.
        </p>
        <DefList
          items={[
            {
              term: "Domains",
              body: "Color-coded buckets for how you think about your business. Identity. Student information. Data and reporting. Whatever your shape is.",
            },
            {
              term: "Systems",
              body: "The actual tools you run. A name, a vendor, a link, a short description, and the domains and categories they belong to.",
            },
            {
              term: "Connections",
              body: "Typed edges between systems. Depends on. Feeds into. Overlaps with. Duplicates. Replaces. The edges explain themselves.",
            },
            {
              term: "Profiles",
              body: "Named subsets — for a team, an audit, a migration. Activate one and every view in the app scopes with you.",
            },
          ]}
        />
      </div>
    </section>
  );
}

function Map() {
  return (
    <section className="pt-20">
      <SectionHead kicker="The map" title="The map is a read of the model, not a drawing of it." />
      <div className="mt-10 space-y-6 text-[17px] leading-[1.65] text-[#2b2a27]">
        <p>
          The graph lays itself out. Dagre handles placement; React Flow
          handles interaction. You can flip between a left-to-right and
          top-to-bottom layout, switch between one edge per relationship type
          and one edge per pair, isolate a node to see only its neighborhood,
          or hide the pieces you aren&rsquo;t working on.
        </p>
        <p>
          Search highlights matches. If your query resolves to exactly one
          system, the view re-centers on it. None of this is clever. It is
          what you already wanted the diagram to do.
        </p>
      </div>
      <Surface
        eyebrow=""
        caption="Fig. 1a — The full map view, with the filter bar and the relationship legend surrounding the graph."
        src="/landing/map.png"
        alt="Datapus full map view"
      />
    </section>
  );
}

function DashboardCopy() {
  return (
    <section className="pt-10">
      <SectionHead kicker="The dashboard" title="A plain-language read on your stack." />
      <div className="mt-10 space-y-6 text-[17px] leading-[1.65] text-[#2b2a27]">
        <p>
          The dashboard reports on the model without decorating it. Counts at
          the top. Systems by domain and by category. The most connected
          systems ranked. And&mdash;importantly&mdash;an{" "}
          <em className="italic">attention</em> list surfacing systems that
          have no domain, no category, or no connections at all.
        </p>
        <p>
          The attention list is the single most honest widget in the app.
          It&rsquo;s the thing you need to see every Monday, not hide behind a
          toggle.
        </p>
      </div>
    </section>
  );
}

function SystemsCopy() {
  return (
    <section className="pt-10">
      <SectionHead kicker="The systems table" title="The spreadsheet view, but tied to the model." />
      <div className="mt-10 space-y-6 text-[17px] leading-[1.65] text-[#2b2a27]">
        <p>
          The table is sortable by any column and filterable by domain or
          category. Tags are multi-select. Each row links to a per-system
          detail page where you can see every relationship that system is part
          of and edit them in place.
        </p>
        <p>
          With an active profile, the table reduces to only the systems in
          that profile. The cell-level edits propagate to the map, the
          dashboard, and the overlap review without ceremony.
        </p>
      </div>
    </section>
  );
}

function OverlapsCopy() {
  return (
    <section className="pt-10">
      <SectionHead kicker="Overlap review" title="Where you have two tools doing the same job." />
      <div className="mt-10 space-y-6 text-[17px] leading-[1.65] text-[#2b2a27]">
        <p>
          Datapus scores pairs of systems by shared domains and categories,
          and ranks them as high, medium, or low overlap candidates. You walk
          the list, marking pairs as possible overlaps, confirmed overlaps,
          or duplicates. Those decisions become typed edges in the map.
        </p>
        <p>
          Not a recommendation engine. A queue for a conversation you were
          already going to have.
        </p>
      </div>
    </section>
  );
}

function Questions() {
  const qs = [
    {
      q: "Is this trying to replace my CMDB?",
      a: "No. A CMDB wants to know everything about every asset. Datapus wants to know how a few dozen systems relate to each other so you can make a decision. It lives upstream of that conversation, not downstream.",
    },
    {
      q: "Where does my data go?",
      a: "Nowhere. The V1 is local-first. Everything lives in your browser via Zustand with persist. Close the tab and it is still there; clear your storage and it is gone.",
    },
    {
      q: "Is there an AI in here guessing my relationships?",
      a: "No. You draw the edges. The app does not invent them. The only opinions it has are the overlap scores, and those are transparent arithmetic over the domains and categories you assigned.",
    },
    {
      q: "What is this not, yet?",
      a: "Not a backend. Not multi-user. No import or export pipeline. No integrations with your SSO directory or billing system. Those are roadmap, not release notes.",
    },
  ];
  return (
    <section className="pt-20">
      <SectionHead kicker="Questions" title="Before you open the app." />
      <dl className="mt-10 divide-y divide-[var(--rule)]">
        {qs.map((item, i) => (
          <div key={i} className="grid gap-3 py-6 sm:grid-cols-[10ch_1fr]">
            <dt className="pt-[2px] font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              Q.{String(i + 1).padStart(2, "0")}
            </dt>
            <dd className="space-y-3 text-[16px] leading-[1.65] text-[#2b2a27]">
              <p className="font-[var(--font-instrument-serif)] text-[22px] italic leading-[1.35]">
                {item.q}
              </p>
              <p>{item.a}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StatusNote() {
  return (
    <aside className="mt-20 border-l-2 border-[var(--accent)] bg-[#efe9d9]/50 px-6 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
        A note on V1
      </p>
      <p className="mt-3 text-[15px] leading-[1.6] text-[#2b2a27]">
        This is a V1. It is in your browser. It is enough to model and
        discuss a real stack today, and it is honestly not much more than
        that. The sign above the door reads{" "}
        <em className="italic">usable</em>, not{" "}
        <em className="italic">finished</em>. If that&rsquo;s the tool you
        wanted, you&rsquo;re in the right place.
      </p>
    </aside>
  );
}

function Colophon() {
  return (
    <footer className="mt-24 border-t border-[var(--rule)] pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span>Datapus &middot; v1 &middot; Local-first</span>
        <span>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Open the app &rarr;
          </Link>
          <span className="mx-3 text-[var(--rule)]">/</span>
          <Link href="/map" className="text-[var(--accent)] hover:underline">
            Jump to the map &rarr;
          </Link>
        </span>
      </div>
      <p className="mt-4 max-w-[60ch] normal-case tracking-normal text-[13px] leading-[1.6]">
        Set in Instrument Serif and Geist. No signup, no tracking, no
        onboarding flow.
      </p>
    </footer>
  );
}

function SectionHead({ kicker, title }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
        {kicker}
      </p>
      <h2 className="mt-3 font-[var(--font-instrument-serif)] text-[34px] leading-[1.1] tracking-[-0.005em] sm:text-[42px]">
        {title}
      </h2>
    </div>
  );
}

function DefList({ items }) {
  return (
    <dl className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
      {items.map((it) => (
        <div key={it.term} className="grid gap-2 py-4 sm:grid-cols-[14ch_1fr]">
          <dt className="font-[var(--font-instrument-serif)] text-[22px] leading-[1.2] italic">
            {it.term}
          </dt>
          <dd className="text-[16px] leading-[1.6] text-[#2b2a27]">{it.body}</dd>
        </div>
      ))}
    </dl>
  );
}

function Surface({ eyebrow, caption, src, alt }) {
  return (
    <figure className="mt-12">
      {eyebrow ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="mt-3 border border-[var(--rule)] bg-white">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1000}
          className="block w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-[13px] italic leading-[1.55] text-[var(--muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
