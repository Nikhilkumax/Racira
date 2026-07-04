import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function evalFn(expr: string, x: number): number | null {
  try {
    const safe = expr
      .replace(/\^/g, "**")
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\blog\b/g, "Math.log")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E");
    // eslint-disable-next-line no-new-func
    const v = new Function("x", `return (${safe});`)(x);
    return Number.isFinite(v) ? v : null;
  } catch { return null; }
}

export function FunctionGrapher() {
  const [expr, setExpr] = useState("x^2");
  const [xmin, setXmin] = useState(-10);
  const [xmax, setXmax] = useState(10);

  const path = useMemo(() => {
    const W = 600, H = 400;
    const pts: string[] = [];
    let yMin = Infinity, yMax = -Infinity;
    const samples: { x: number; y: number }[] = [];
    for (let i = 0; i <= 400; i++) {
      const x = xmin + (i / 400) * (xmax - xmin);
      const y = evalFn(expr, x);
      if (y !== null) { samples.push({ x, y }); yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
    }
    if (!Number.isFinite(yMin)) return { d: "", W, H, yMin: -10, yMax: 10 };
    const pad = (yMax - yMin) * 0.1 || 1;
    yMin -= pad; yMax += pad;
    samples.forEach((p, i) => {
      const px = ((p.x - xmin) / (xmax - xmin)) * W;
      const py = H - ((p.y - yMin) / (yMax - yMin)) * H;
      pts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
    });
    return { d: pts.join(" "), W, H, yMin, yMax };
  }, [expr, xmin, xmax]);

  const axisY = path.H - ((0 - path.yMin) / (path.yMax - path.yMin)) * path.H;
  const axisX = ((0 - xmin) / (xmax - xmin)) * path.W;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-3"><Label>f(x) =</Label><Input value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="e.g. sin(x), x^2-3, 1/x" /></div>
        <div><Label>x min</Label><Input type="number" value={xmin} onChange={(e) => setXmin(+e.target.value)} /></div>
        <div><Label>x max</Label><Input type="number" value={xmax} onChange={(e) => setXmax(+e.target.value)} /></div>
      </div>
      <div className="rounded-lg border bg-white p-4">
        <svg viewBox={`0 0 ${path.W} ${path.H}`} className="w-full h-auto">
          <line x1="0" y1={axisY} x2={path.W} y2={axisY} stroke="#cbd5e1" />
          <line x1={axisX} y1="0" x2={axisX} y2={path.H} stroke="#cbd5e1" />
          <path d={path.d} stroke="#3B82F6" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">Supports +, -, *, /, ^, sin, cos, tan, sqrt, abs, log, exp, pi, e</p>
    </div>
  );
}
