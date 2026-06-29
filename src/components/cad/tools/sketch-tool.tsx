"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MousePointer2, Minus, Square, Circle as CircleIcon, Spline,
  Trash2, Download, Undo2, Grid3x3,
} from "lucide-react";

type Pt = { x: number; y: number };
type Shape =
  | { id: string; type: "line"; a: Pt; b: Pt }
  | { id: string; type: "rect"; a: Pt; b: Pt }
  | { id: string; type: "circle"; c: Pt; r: number }
  | { id: string; type: "polyline"; pts: Pt[] };

type Tool = "select" | "line" | "rect" | "circle" | "polyline";

const GRID = 20; // px per grid unit
const UNIT_MM = 10; // each grid cell = 10mm

const uid = () => Math.random().toString(36).slice(2, 9);

export function SketchTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("line");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draft, setDraft] = useState<Shape | null>(null);
  const [cursor, setCursor] = useState<Pt>({ x: 0, y: 0 });
  const [snap, setSnap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [size, setSize] = useState({ w: 800, h: 560 });

  // Responsive sizing.
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.floor(e.contentRect.width);
        setSize({ w, h: Math.max(420, Math.floor(w * 0.62)) });
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const snapPt = useCallback(
    (p: Pt): Pt => (snap ? { x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID } : p),
    [snap],
  );

  // Draw routine.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    // Background.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.w, size.h);

    // Grid.
    if (showGrid) {
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= size.w; x += GRID) {
        ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, size.h);
      }
      for (let y = 0; y <= size.h; y += GRID) {
        ctx.moveTo(0, y + 0.5); ctx.lineTo(size.w, y + 0.5);
      }
      ctx.stroke();

      // Major every 5 cells.
      ctx.strokeStyle = "#cbd5e1";
      ctx.beginPath();
      for (let x = 0; x <= size.w; x += GRID * 5) {
        ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, size.h);
      }
      for (let y = 0; y <= size.h; y += GRID * 5) {
        ctx.moveTo(0, y + 0.5); ctx.lineTo(size.w, y + 0.5);
      }
      ctx.stroke();
    }

    const drawShape = (s: Shape, color = "#475569", lw = 2) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      if (s.type === "line") { ctx.moveTo(s.a.x, s.a.y); ctx.lineTo(s.b.x, s.b.y); }
      else if (s.type === "rect") {
        const x = Math.min(s.a.x, s.b.x), y = Math.min(s.a.y, s.b.y);
        ctx.rect(x, y, Math.abs(s.b.x - s.a.x), Math.abs(s.b.y - s.a.y));
      } else if (s.type === "circle") {
        ctx.arc(s.c.x, s.c.y, s.r, 0, Math.PI * 2);
      } else if (s.type === "polyline") {
        s.pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      }
      ctx.stroke();
    };

    shapes.forEach((s) => drawShape(s));
    if (draft) drawShape(draft, "#94a3b8", 1.5);

    // Snap indicator.
    if (snap) {
      const sp = snapPt(cursor);
      ctx.fillStyle = "#475569";
      ctx.beginPath(); ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2); ctx.fill();
    }
  }, [shapes, draft, size, showGrid, snap, cursor, snapPt]);

  const toLocal = (e: React.MouseEvent): Pt => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.MouseEvent) => {
    const p = snapPt(toLocal(e));
    if (tool === "select") return;
    if (tool === "line") setDraft({ id: uid(), type: "line", a: p, b: p });
    else if (tool === "rect") setDraft({ id: uid(), type: "rect", a: p, b: p });
    else if (tool === "circle") setDraft({ id: uid(), type: "circle", c: p, r: 0 });
    else if (tool === "polyline") {
      setDraft((d) =>
        d && d.type === "polyline" ? { ...d, pts: [...d.pts, p] } : { id: uid(), type: "polyline", pts: [p, p] },
      );
    }
  };

  const onMove = (e: React.MouseEvent) => {
    const raw = toLocal(e);
    setCursor(raw);
    const p = snapPt(raw);
    if (!draft) return;
    if (draft.type === "line" || draft.type === "rect") setDraft({ ...draft, b: p });
    else if (draft.type === "circle") setDraft({ ...draft, r: Math.hypot(p.x - draft.c.x, p.y - draft.c.y) });
    else if (draft.type === "polyline") {
      const pts = draft.pts.slice(0, -1).concat([p]);
      setDraft({ ...draft, pts });
    }
  };

  const onUp = () => {
    if (!draft) return;
    if (draft.type === "polyline") return; // commit on dblclick / Enter
    setShapes((s) => [...s, draft]);
    setDraft(null);
  };

  const onDouble = () => {
    if (draft && draft.type === "polyline" && draft.pts.length > 2) {
      setShapes((s) => [...s, { ...draft, pts: draft.pts.slice(0, -1) }]);
      setDraft(null);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDraft(null);
      if (e.key === "Enter" && draft && draft.type === "polyline") {
        if (draft.pts.length > 2) setShapes((s) => [...s, { ...draft, pts: draft.pts.slice(0, -1) }]);
        setDraft(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") setShapes((s) => s.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);

  const exportPNG = () => {
    const c = canvasRef.current; if (!c) return;
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "racira-cad-sketch.png"; a.click();
  };

  const toolBtns: { id: Tool; icon: typeof Minus; label: string }[] = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: CircleIcon, label: "Circle" },
    { id: "polyline", icon: Spline, label: "Polyline" },
  ];

  // Live measurement readout.
  const readout = (() => {
    const sp = snapPt(cursor);
    const mm = (n: number) => `${((n / GRID) * UNIT_MM).toFixed(1)} mm`;
    if (draft?.type === "line") {
      const d = Math.hypot(draft.b.x - draft.a.x, draft.b.y - draft.a.y);
      return `Length: ${mm(d)}`;
    }
    if (draft?.type === "rect") {
      return `W: ${mm(Math.abs(draft.b.x - draft.a.x))}  H: ${mm(Math.abs(draft.b.y - draft.a.y))}`;
    }
    if (draft?.type === "circle") {
      return `R: ${mm(draft.r)}  Ø: ${mm(draft.r * 2)}`;
    }
    return `X: ${mm(sp.x)}  Y: ${mm(sp.y)}`;
  })();

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      {/* Toolbar */}
      <aside className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Tools</p>
          <div className="grid grid-cols-2 gap-1.5">
            {toolBtns.map((b) => {
              const Icon = b.icon;
              const active = tool === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => { setTool(b.id); setDraft(null); }}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[11px] transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">View</p>
          <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs">
            <span className="flex items-center gap-2"><Grid3x3 className="h-3.5 w-3.5" /> Grid</span>
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs">
            <span>Snap to grid</span>
            <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} />
          </label>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Actions</p>
          <button
            onClick={() => setShapes((s) => s.slice(0, -1))}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-accent"
          ><Undo2 className="h-3.5 w-3.5" /> Undo</button>
          <button
            onClick={() => { setShapes([]); setDraft(null); }}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-accent"
          ><Trash2 className="h-3.5 w-3.5" /> Clear all</button>
          <button
            onClick={exportPNG}
            className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          ><Download className="h-3.5 w-3.5" /> Export PNG</button>
        </div>

        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Polyline: click to add points, double-click or Enter to finish, Esc to cancel.
          Cmd/Ctrl+Z to undo. 1 grid cell = {UNIT_MM} mm.
        </p>
      </aside>

      {/* Canvas */}
      <div ref={wrapRef} className="space-y-2">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <canvas
            ref={canvasRef}
            style={{ width: size.w, height: size.h, cursor: tool === "select" ? "default" : "crosshair", display: "block" }}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onDoubleClick={onDouble}
            onMouseLeave={() => setDraft(draft && draft.type === "polyline" ? draft : null)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-muted-foreground">
          <span>{readout}</span>
          <span>{shapes.length} object{shapes.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
