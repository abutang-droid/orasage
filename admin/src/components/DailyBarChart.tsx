type BarPoint = {
  label: string;
  count: number;
};

type Props = {
  title: string;
  points: BarPoint[];
  emptyLabel?: string;
};

export function DailyBarChart({ title, points, emptyLabel = '暂无数据' }: Props) {
  const max = Math.max(...points.map((p) => p.count), 1);

  return (
    <div className="dash-chart">
      <h3 className="dash-chart-title">{title}</h3>
      {points.length === 0 ? (
        <p className="muted dash-chart-empty">{emptyLabel}</p>
      ) : (
        <div className="dash-chart-bars" role="img" aria-label={title}>
          {points.map((p) => (
            <div key={p.label} className="dash-chart-bar-wrap" title={`${p.label}: ${p.count}`}>
              <div
                className="dash-chart-bar"
                style={{ height: `${Math.max((p.count / max) * 100, 4)}%` }}
              />
              <span className="dash-chart-bar-label">{p.label}</span>
              <span className="dash-chart-bar-value">{p.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
