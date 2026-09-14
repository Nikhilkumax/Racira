"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MousePointer2, Minus, Square, Circle as CircleIcon, Spline,
  Trash2, Download, Undo2, Grid3x3, Delete as DeleteIcon,
} from "lucide-react";
import {
  exportDxf, exportSvg, type Pt, type Shape,
} from "@/domains/cad/lib/sketch-export";

type Tool = "select" | "line" | "rect" | "circle" | "polyline";

const GRID = 20; // px per grid unit
const UNIT_MM = 10; // each grid cell = 10mm
const HIT_TOL = 6; // px hit-test tolerance
const MAX_HISTORY = 100;

const uid = () => Math.random().toString(36).slice(2, 9);

// ── Geometry helpers (pure) ───────────────────────────────────────
const distToSegment = (p: Pt, a: Pt, b: Pt): number => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

/** Hit-test a point against shapes. Last-drawn (topmost) wins. */
function hitTest(p: Pt, shapes: Shape[]): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];
    if (s.type === "line") {
      if (distToSegment(p, s.a, s.b) <= HIT_TOL) return s;
    } else if (s.type === "rect") {
      const x0 = Math.min(s.a.x, s.b.x), x1 = Math.max(s.a.x, s.b.x);
      const y0 = Math.min(s.a.y, s.b.y), y1 = Math.max(s.a.y, s.b.y);
      if (p.x >= x0 - HIT_TOL && p.x <= x1 + HIT_TOL && p.y >= y0 - HIT_TOL && p.y <= y1 + HIT_TOL) return s;
    } else if (s.type === "circle") {
      const d = Math.hypot(p.x - s.c.x, p.y - s.c.y);
      if (Math.abs(d - s.r) <= HIT_TOL) return s;
    } else if (s.type === "polyline") {
      for (let j = 0; j < s.pts.length - 1; j++) {
        if (distToSegment(p, s.pts[j], s.pts[j + 1]) <= HIT_TOL) return s;
      }
      for (const pt of s.pts) {
        if (Math.hypot(p.x - pt.x, p.y - pt.y) <= HIT_TOL) return s;
      }
    }
  }
  return null;
}

const getAnchor = (s: Shape): Pt =>
  s.type === "circle" ? s.c : s.type === "polyline" ? s.pts[0] : s.a;

const translate = (s: Shape, d: Pt): Shape => {
  if (s.type === "line") return { ...s, a: { x: s.a.x + d.x, y: s.a.y + d.y }, b: { x: s.b.x + d.x, y: s.b.y + d.y } };
  if (s.type === "rect") return { ...s, a: { x: s.a.x + d.x, y: s.a.y + d.y }, b: { x: s.b.x + d.x, y: s.b.y + d.y } };
  if (s.type === "circle") return { ...s, c: { x: s.c.x + d.x, y: s.c.y + d.y } };
  return { ...s, pts: s.pts.map((p) => ({ x: p.x + d.x, y: p.y + d.y })) };
};

const anchorPoints = (s: Shape): Pt[] => {
  if (s.type === "line") return [s.a, s.b];
  if (s.type === "rect") return [s.a, { x: s.b.x, y: s.a.y }, s.b, { x: s.a.x, y: s.b.y }];
  if (s.type === "circle") return [s.c, { x: s.c.x + s.r, y: s.c.y }, { x: s.c.x, y: s.c.y - s.r }, { x: s.c.x - s.r, y: s.c.y }, { x: s.c.x, y: s.c.y + s.r }];
  return s.pts;
};

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Refs keep event handlers free of stale closures:
  // shapesRef mirrors the committed `shapes`; historyRef is the undo stack
  // (each committed action pushes the pre-action snapshot once).
  const shapesRef = useRef<Shape[]>([]);
  const historyRef = useRef<Shape[][]>([]);
  const dragRef = useRef<{ id: string; dx: number; dy: number; origAnchor: Pt; origShapes: Shape[]; pushed: boolean } | null>(null);

  useEffect(() => {
    shapesRef.current = shapes;
  });

  const commit = useCallback((next: Shape[]) => {
    historyRef.current.push(shapesRef.current);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    setShapes(next);
  }, []);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) setShapes(prev);
  }, []);

  const deleteSelected = useCallback(() => {
    const id = selectedId;
    if (!id) return;
    commit(shapesRef.current.filter((s) => s.id !== id));
    setSelectedId(null);
  }, [selectedId, commit]);

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

    // Hover highlight (select tool only).
    if (tool === "select" && hoverId && hoverId !== selectedId) {
      const h = shapes.find((s) => s.id === hoverId);
      if (h) drawShape(h, "#60a5fa", 2);
    }

    // Selection: accent stroke + anchor handles.
    if (tool === "select" && selectedId) {
      const sel = shapes.find((s) => s.id === selectedId);
      if (sel) {
        drawShape(sel, "#2563eb", 2.5);
        ctx.fillStyle = "#2563eb";
        for (const p of anchorPoints(sel)) {
          ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
        }
      }
    }

    // Snap indicator.
    if (snap) {
      const sp = snapPt(cursor);
      ctx.fillStyle = "#475569";
      ctx.beginPath(); ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2); ctx.fill();
    }
  }, [shapes, draft, size, showGrid, snap, cursor, snapPt, tool, selectedId, hoverId]);

  const toLocal = (e: React.MouseEvent): Pt => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.MouseEvent) => {
    const raw = toLocal(e);
    if (tool === "select") {
      const hit = hitTest(raw, shapesRef.current);
      if (hit) {
        setSelectedId(hit.id);
        const anchor = getAnchor(hit);
        dragRef.current = {
          id: hit.id, dx: anchor.x - raw.x, dy: anchor.y - raw.y,
          origAnchor: anchor, origShapes: shapesRef.current, pushed: false,
        };
      } else {
        setSelectedId(null);
      }
      return;
    }
    const p = snapPt(raw);
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

    // Select-drag: translate the grabbed shape. Delta is recomputed from the
    // original anchor each move, so snapping never accumulates drift.
    if (tool === "select" && dragRef.current) {
      const d = dragRef.current;
      const snapped = snapPt({ x: raw.x + d.dx, y: raw.y + d.dy });
      const delta = { x: snapped.x - d.origAnchor.x, y: snapped.y - d.origAnchor.y };
      if ((delta.x !== 0 || delta.y !== 0) && !d.pushed) {
        d.pushed = true;
        historyRef.current.push(d.origShapes);
        if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
      }
      if (d.pushed) {
        setShapes(d.origShapes.map((s) => (s.id === d.id ? translate(s, delta) : s)));
      }
      return;
    }

    // Select hover highlight.
    if (tool === "select") {
      const h = hitTest(raw, shapesRef.current);
      setHoverId(h?.id ?? null);
      return;
    }

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
    if (tool === "select") {
      dragRef.current = null;
      return;
    }
    if (!draft) return;
    if (draft.type === "polyline") return; // commit on dblclick / Enter
    commit([...shapesRef.current, draft]);
    setDraft(null);
  };

  const onDouble = () => {
    if (draft && draft.type === "polyline" && draft.pts.length > 2) {
      commit([...shapesRef.current, { ...draft, pts: draft.pts.slice(0, -1) }]);
      setDraft(null);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDraft(null);
      if (e.key === "Enter" && draft && draft.type === "polyline") {
        if (draft.pts.length > 2) commit([...shapesRef.current, { ...draft, pts: draft.pts.slice(0, -1) }]);
        setDraft(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") undo();
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) deleteSelected();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, selectedId, commit, undo, deleteSelected]);

  const exportPNG = () => {
    const c = canvasRef.current; if (!c) return;
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "racira-cad-sketch.png"; a.click();
  };

  const downloadText = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // DXF is Y-up world space — pass the canvas height so Y flips correctly.
  const exportDXF = () => {
    if (!shapesRef.current.length) return;
    const canvasH = canvasRef.current?.getBoundingClientRect().height ?? size.h;
    downloadText(exportDxf(shapesRef.current, canvasH), "racira-cad-sketch.dxf", "application/dxf");
  };

  const exportSVG = () => {
    if (!shapesRef.current.length) return;
    downloadText(exportSvg(shapesRef.current), "racira-cad-sketch.svg", "image/svg+xml");
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
    if (tool === "select" && selectedId) {
      const sel = shapes.find((s) => s.id === selectedId);
      if (sel) {
        if (sel.type === "line") return `Selected line — ${mm(Math.hypot(sel.b.x - sel.a.x, sel.b.y - sel.a.y))}`;
        if (sel.type === "rect") return `Selected rect — ${mm(Math.abs(sel.b.x - sel.a.x))} × ${mm(Math.abs(sel.b.y - sel.a.y))}`;
        if (sel.type === "circle") return `Selected circle — Ø ${mm(sel.r * 2)}`;
        return `Selected polyline — ${sel.pts.length} pts`;
      }
    }
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
            onClick={undo}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-accent"
          ><Undo2 className="h-3.5 w-3.5" /> Undo</button>
          <button
            onClick={deleteSelected}
            disabled={!selectedId}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          ><DeleteIcon className="h-3.5 w-3.5" /> Delete</button>
          <button
            onClick={() => { if (shapesRef.current.length) commit([]); setDraft(null); setSelectedId(null); }}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-accent"
          ><Trash2 className="h-3.5 w-3.5" /> Clear all</button>
          <button
            onClick={exportPNG}
            className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          ><Download className="h-3.5 w-3.5" /> Export PNG</button>
          <button
            onClick={exportDXF}
            disabled={shapes.length === 0}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          ><Download className="h-3.5 w-3.5" /> Export DXF</button>
          <button
            onClick={exportSVG}
            disabled={shapes.length === 0}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          ><Download className="h-3.5 w-3.5" /> Export SVG</button>
        </div>

        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Select: click a shape to pick it, drag to move, Del to delete.
          Polyline: click to add points, double-click or Enter to finish, Esc to cancel.
          Cmd/Ctrl+Z to undo. 1 grid cell = {UNIT_MM} mm.
        </p>
      </aside>

      {/* Canvas */}
      {/* min-w-0 breaks the ResizeObserver feedback loop: without it the grid
          track grows to fit the canvas' style width, which grows the track,
          which grows the canvas… forever (+2px per tick). */}
      <div ref={wrapRef} className="min-w-0 space-y-2">
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <canvas
            ref={canvasRef}
            style={{ width: size.w, height: size.h, cursor: tool === "select" ? (hoverId ? "pointer" : "default") : "crosshair", display: "block" }}
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