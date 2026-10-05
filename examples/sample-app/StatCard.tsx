// StatCard.tsx - KPI card. Token-driven; the delta uses an icon AND a colour, never
// colour alone. Styles in ./styles.css; rendered and gated by
// scripts/render_framework_source.mjs.
//
// The arrow used to be the geometric glyphs U+25B2/U+25BC. They slip past
// check_no_emoji - that gate scans the emoji blocks, and these sit in Geometric
// Shapes - but they are exactly the pictograph-as-icon CLAUDE.md bans: they render
// differently on every platform and carry no stroke weight from the theme. The
// hand-written twin of this component (preview.html) already used lucide; only the
// React source still carried them, because nothing ever rendered it.

type Props = {
  label: string;
  value: string;
  delta: number;
  /** The one card that leads the row. Four equal cards give the eye nowhere to land. */
  lead?: boolean;
  /** Shown only on the lead card: what the number does and does not include. */
  note?: string;
};

/** lucide trending-up / trending-down, inline so it inherits currentColor. */
function TrendIcon({ up }: { up: boolean }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {up ? (
        <>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </>
      ) : (
        <>
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
          <polyline points="16 17 22 17 22 11" />
        </>
      )}
    </svg>
  );
}

export function StatCard({ label, value, delta, lead = false, note }: Props) {
  const up = delta >= 0;
  const figure = (
    <div>
      <div className="card__label">{label}</div>
      <div className="card__value">{value}</div>
      <div className={up ? "card__delta--up" : "card__delta--down"}>
        <TrendIcon up={up} /> {Math.abs(delta)}%
        <span className="sr-only">{up ? "increase" : "decrease"}</span>
        {lead ? " against the previous 30 days" : null}
      </div>
    </div>
  );

  return (
    <div className={lead ? "card card--hero" : "card"}>
      {figure}
      {lead && note ? <p className="card__note">{note}</p> : null}
    </div>
  );
}
