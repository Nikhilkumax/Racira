"use client";
import { useMemo, useState } from "react";

export function GridSystemBuilder() {
  const [columns, setColumns] = useState(12);
  const [gutter, setGutter] = useState(24);
  const [margin, setMargin] = useState(32);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [rowHeight, setRowHeight] = useState(80);
  const [rows, setRows] = useState(6);
  const [showGuides, setShowGuides] = useState(true);

  const cssGrid = useMemo(
    () =>
`.container {
  max-width: ${maxWidth}px;
  margin-inline: auto;
  padding-inline: ${margin}px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(${columns}, minmax(0, 1fr));
  gap: ${gutter}px;
}`,
    [columns, gutter, margin, maxWidth],
  );

  const colWidth = ((maxWidth - margin * 2) - gutter * (columns - 1)) / columns;

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <aside className="tool-card group">
        <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground">Settings</h3>
        <Slider label="Columns" value={columns} min={1} max={24} onChange={setColumns} />
        <Slider label="Gutter (px)" value={gutter} min={0} max={80} onChange={setGutter} />
        <Slider label="Margin (px)" value={margin} min={0} max={120} onChange={setMargin} />
        <Slider label="Max width (px)" value={maxWidth} min={320} max={1920} step={20} onChange={setMaxWidth} />
        <Slider label="Row height (px)" value={rowHeight} min={20} max={200} onChange={setRowHeight} />
        <Slider label="Rows preview" value={rows} min={1} max={20} onChange={setRows} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} className="accent-[var(--primary)]" />
          Show column guides
        </label>
        <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground space-y-1">
          <div>Column width: <span className="text-foreground font-mono">{colWidth.toFixed(1)}px</span></div>
          <div>Content width: <span className="text-foreground font-mono">{maxWidth - margin * 2}px</span></div>
        </div>
      </aside>

      <div className="space-y-6 min-w-0">
        <div className="rounded-2xl border border-border bg-card p-6 overflow-x-auto">
          <div className="text-xs text-muted-foreground mb-3">Live preview</div>
          <div
            className="relative mx-auto"
            style={{ maxWidth: `${maxWidth}px`, paddingInline: `${margin}px` }}
          >
            {showGuides && (
              <div
                className="absolute inset-y-0 grid pointer-events-none"
                style={{
                  left: margin,
                  right: margin,
                  gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
                  gap: `${gutter}px`,
                }}
              >
                {Array.from({ length: columns }).map((_, i) => (
                  <div key={i} className="bg-primary/10 border-x border-primary/20" />
                ))}
              </div>
            )}
            <div
              className="relative grid"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`,
                gap: `${gutter}px`,
              }}
            >
              {Array.from({ length: rows * columns }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-md bg-primary/80"
                  style={{ height: `${rowHeight}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="tool-card group">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold tracking-wide uppercase text-muted-foreground">CSS Output</div>
            <button
              onClick={() => navigator.clipboard.writeText(cssGrid)}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
            >
              Copy CSS
            </button>
          </div>
          <pre className="text-xs font-mono bg-secondary rounded-xl p-4 overflow-x-auto"><code>{cssGrid}</code></pre>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-foreground">{label}</label>
        <span className="text-xs font-mono text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}

