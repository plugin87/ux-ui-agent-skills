// Dashboard.tsx - page 1. Reuses Button + StatCard; consumes the shared theme only.
// Styles in ./styles.css; rendered and gated by scripts/render_framework_source.mjs.
//
// This used to map four identical StatCards over a flat KPI list - the same
// four-equal-cards layout the README holds up as the generated-looking "before".
// The hand-written twin (preview.html) had already been fixed to lead with one
// hero figure; the React source had not, and nothing rendered it to notice.
// Revenue leads; the other three stay quiet (non-negotiable 4, "one thing leads").
import { Button } from "../golden/Button";
import { StatCard } from "./StatCard";

const LEAD = {
  label: "Revenue",
  value: "$48.2k",
  delta: 12,
  note: "Recurring revenue only. One-off invoices are counted on the billing page, not here.",
};

const SUPPORTING = [
  { label: "Active users", value: "3,910", delta: 4 },
  { label: "Churn", value: "1.8%", delta: -2 },
  { label: "NPS", value: "62", delta: 7 },
];

export function Dashboard() {
  return (
    <div className="app">
      <main className="container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="subtle">Last 30 days &middot; one shared theme &middot; light + dark</p>
          </div>
          <Button>Export</Button>
        </header>

        <section className="grid" aria-label="Key metrics">
          <StatCard {...LEAD} lead />
          {SUPPORTING.map((k) => (
            <StatCard key={k.label} {...k} />
          ))}
        </section>
      </main>
    </div>
  );
}
