interface Segment {
  label: string;
  value: number;
  color: string;
}

const PieChart = ({ segments, size = 200 }: { segments: Segment[]; size?: number }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total <= 0) return null;

  let cumulative = 0;
  const gradientParts = segments.map((seg) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="rounded-full border-4 border-card"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientParts.join(", ")})`,
          boxShadow: "var(--card-shadow)",
        }}
      />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
            {seg.label} ({total > 0 ? ((seg.value / total) * 100).toFixed(1) : 0}%)
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;

