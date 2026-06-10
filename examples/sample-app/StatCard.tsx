// StatCard.tsx - KPI card. Token-driven; delta uses color + arrow (never color alone).
type Props = { label: string; value: string; delta: number };

export function StatCard({ label, value, delta }: Props) {
  const up = delta >= 0;
  return (
    <div className="card">
      <div className="card__label">{label}</div>
      <div className="card__value">{value}</div>
      <div className={up ? "card__delta--up" : "card__delta--down"}>
        <span aria-hidden="true">{up ? "▲" : "▼"}</span> {Math.abs(delta)}%
        <span className="sr-only">{up ? "increase" : "decrease"}</span>
      </div>
    </div>
  );
}
