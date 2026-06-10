// Dashboard.tsx - page 1. Reuses Button + StatCard; consumes the shared theme only.
import { Button } from "../golden/Button";
import { StatCard } from "./StatCard";

const KPIS = [
  { label: "Revenue", value: "$48.2k", delta: 12 },
  { label: "Active users", value: "3,910", delta: 4 },
  { label: "Churn", value: "1.8%", delta: -2 },
  { label: "NPS", value: "62", delta: 7 },
];

export function Dashboard() {
  return (
    <div className="app">
      <main className="container">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="subtle">Last 30 days</p>
          </div>
          <Button>Export</Button>
        </header>

        <section className="grid" aria-label="Key metrics" style={{ marginBlockStart: "var(--space-6)" }}>
          {KPIS.map((k) => (
            <StatCard key={k.label} {...k} />
          ))}
        </section>
      </main>
    </div>
  );
}
