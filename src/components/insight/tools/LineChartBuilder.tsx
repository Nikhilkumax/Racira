"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const SAMPLE = `Month,Revenue,Expenses
Jan,1200,800
Feb,1600,900
Mar,1450,1100
Apr,2100,1300
May,2400,1500
Jun,2800,1700
Jul,3100,1800
Aug,3400,2000`;

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { keys: [], rows: [] as Record<string, string | number>[] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const obj: Record<string, string | number> = {};
    headers.forEach((h, i) => {
      const v = cells[i];
      const n = Number(v);
      obj[h] = v !== "" && !isNaN(n) ? n : v ?? "";
    });
    return obj;
  });
  return { keys: headers, rows };
}

const COLORS = ["hsl(200 90% 45%)", "hsl(220 70% 55%)", "hsl(180 65% 45%)", "hsl(260 60% 60%)"];

export function LineChartBuilder() {
  const [csv, setCsv] = useState(SAMPLE);
  const [title, setTitle] = useState("Monthly Performance");

  const { keys, rows } = useMemo(() => parseCSV(csv), [csv]);
  const xKey = keys[0];
  const seriesKeys = keys.slice(1).filter((k) => rows.some((r) => typeof r[k] === "number"));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Chart title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            CSV data (first column = X axis)
          </label>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            spellCheck={false}
            className="mt-2 h-64 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setCsv(SAMPLE)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs hover:bg-accent"
            >
              Load sample
            </button>
            <button
              onClick={() => setCsv("")}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs hover:bg-accent"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">{title || "Untitled chart"}</h3>
          <div className="mt-3 h-80 w-full">
            {rows.length > 0 && xKey && seriesKeys.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                  <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {seriesKeys.map((k, i) => (
                    <Line
                      key={k}
                      type="monotone"
                      dataKey={k}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Add CSV data to render a chart
              </div>
            )}
          </div>
          {seriesKeys.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              X: <span className="text-foreground">{xKey}</span> · Series:{" "}
              <span className="text-foreground">{seriesKeys.join(", ")}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
