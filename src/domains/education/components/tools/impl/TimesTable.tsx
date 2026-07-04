import { useState } from "react";

export function TimesTable() {
  const [hover, setHover] = useState<[number, number] | null>(null);
  const n = 12;
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">Hover a cell to highlight its row and column.</p>
      <div className="grid gap-0.5 text-center text-sm" style={{ gridTemplateColumns: `repeat(${n + 1}, minmax(0,1fr))` }}>
        <div></div>
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className="font-bold p-2 bg-primary text-primary-foreground rounded">{i + 1}</div>
        ))}
        {Array.from({ length: n }, (_, i) => (
          <>
            <div key={`r${i}`} className="font-bold p-2 bg-primary text-primary-foreground rounded">{i + 1}</div>
            {Array.from({ length: n }, (_, j) => {
              const hl = hover && (hover[0] === i || hover[1] === j);
              const active = hover && hover[0] === i && hover[1] === j;
              return (
                <div
                  key={`${i}${j}`}
                  onMouseEnter={() => setHover([i, j])}
                  className={`p-2 rounded transition ${active ? "bg-primary text-primary-foreground" : hl ? "bg-primary/15" : "bg-card border"}`}
                >
                  {(i + 1) * (j + 1)}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
