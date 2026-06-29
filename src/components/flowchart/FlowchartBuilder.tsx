import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Diamond, Square, Trash2, Download, MousePointer2, Spline, Eraser } from "lucide-react";

type ShapeKind = "rect" | "diamond" | "ellipse";
type Node = { id: string; kind: ShapeKind; x: number; y: number; w: number; h: number; label: string };
type Edge = { id: string; from: string; to: string };
type Tool = "select" | "rect" | "diamond" | "ellipse" | "connect" | "delete";

const uid = () => Math.random().toString(36).slice(2, 9);

const STORAGE_KEY = "racira-flowchart-v1";

export function FlowchartBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  const [selected, setSelected] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load / save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setNodes(data.nodes ?? []);
        setEdges(data.edges ?? []);
      } else {
        // seed example
        const a: Node = { id: uid(), kind: "ellipse", x: 80, y: 60, w: 140, h: 60, label: "Start" };
        const b: Node = { id: uid(), kind: "rect", x: 80, y: 180, w: 140, h: 60, label: "Do work" };
        const c: Node = { id: uid(), kind: "diamond", x: 80, y: 300, w: 160, h: 80, label: "OK?" };
        const d: Node = { id: uid(), kind: "ellipse", x: 80, y: 440, w: 140, h: 60, label: "End" };
        setNodes([a, b, c, d]);
        setEdges([
          { id: uid(), from: a.id, to: b.id },
          { id: uid(), from: b.id, to: c.id },
          { id: uid(), from: c.id, to: d.id },
        ]);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const svgPoint = (e: React.MouseEvent) => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (editing) return;
    const p = svgPoint(e);
    if (tool === "rect" || tool === "diamond" || tool === "ellipse") {
      const n: Node = {
        id: uid(),
        kind: tool,
        x: p.x - 70,
        y: p.y - 30,
        w: 140,
        h: 60,
        label: tool === "diamond" ? "Decision" : tool === "ellipse" ? "Terminator" : "Step",
      };
      setNodes((prev) => [...prev, n]);
      setSelected(n.id);
      setTool("select");
    } else {
      setSelected(null);
      setConnectFrom(null);
    }
  };

  const onNodeMouseDown = (e: React.MouseEvent, n: Node) => {
    e.stopPropagation();
    if (editing) return;
    if (tool === "delete") {
      setNodes((prev) => prev.filter((x) => x.id !== n.id));
      setEdges((prev) => prev.filter((x) => x.from !== n.id && x.to !== n.id));
      return;
    }
    if (tool === "connect") {
      if (!connectFrom) {
        setConnectFrom(n.id);
      } else if (connectFrom !== n.id) {
        setEdges((prev) => [...prev, { id: uid(), from: connectFrom, to: n.id }]);
        setConnectFrom(null);
      }
      return;
    }
    setSelected(n.id);
    const p = svgPoint(e);
    setDragging({ id: n.id, dx: p.x - n.x, dy: p.y - n.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const p = svgPoint(e);
    setNodes((prev) =>
      prev.map((n) => (n.id === dragging.id ? { ...n, x: p.x - dragging.dx, y: p.y - dragging.dy } : n)),
    );
  };

  const onMouseUp = () => setDragging(null);

  const updateLabel = (id: string, label: string) =>
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, label } : n)));

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    setNodes((prev) => prev.filter((n) => n.id !== selected));
    setEdges((prev) => prev.filter((e) => e.from !== selected && e.to !== selected));
    setSelected(null);
  }, [selected]);

  const clearAll = () => {
    if (!confirm("Clear the whole canvas?")) return;
    setNodes([]);
    setEdges([]);
    setSelected(null);
  };

  const exportSVG = () => {
    const svg = svgRef.current!;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flowchart.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tools: { id: Tool; icon: typeof Square; label: string }[] = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "rect", icon: Square, label: "Process" },
    { id: "diamond", icon: Diamond, label: "Decision" },
    { id: "ellipse", icon: Circle, label: "Terminator" },
    { id: "connect", icon: Spline, label: "Connect" },
    { id: "delete", icon: Eraser, label: "Erase" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
      {/* Toolbar */}
      <aside className="rounded-2xl border bg-card p-3 shadow-sm">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tools</p>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((t) => {
            const Icon = t.icon;
            const active = tool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id);
                  setConnectFrom(null);
                }}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition ${
                  active
                    ? "border-brand bg-brand text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 px-2 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</p>
        <div className="space-y-2">
          <button
            onClick={deleteSelected}
            disabled={!selected}
            className="flex w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete selected
          </button>
          <button
            onClick={exportSVG}
            className="flex w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" /> Export SVG
          </button>
          <button
            onClick={clearAll}
            className="w-full rounded-lg border border-destructive/30 bg-background px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
          >
            Clear canvas
          </button>
        </div>

        <p className="mt-5 rounded-md bg-muted/60 p-2 text-[11px] leading-snug text-muted-foreground">
          {tool === "connect"
            ? connectFrom
              ? "Click a target shape to connect."
              : "Click a source shape to start connecting."
            : tool === "select"
              ? "Drag shapes to move. Double-click to rename."
              : tool === "delete"
                ? "Click a shape to erase it."
                : "Click anywhere on the canvas to drop a shape."}
        </p>
      </aside>

      {/* Canvas */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <svg
          ref={svgRef}
          onClick={onCanvasClick}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="block h-[640px] w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.9 0.01 220) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="oklch(0.5 0.05 220)" />
            </marker>
          </defs>

          {edges.map((e) => {
            const a = nodes.find((n) => n.id === e.from);
            const b = nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            const ax = a.x + a.w / 2;
            const ay = a.y + a.h / 2;
            const bx = b.x + b.w / 2;
            const by = b.y + b.h / 2;
            return (
              <line
                key={e.id}
                x1={ax}
                y1={ay}
                x2={bx}
                y2={by}
                stroke="oklch(0.5 0.05 220)"
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
            );
          })}

          {nodes.map((n) => (
            <NodeShape
              key={n.id}
              node={n}
              selected={selected === n.id || connectFrom === n.id}
              editing={editing === n.id}
              onMouseDown={(e) => onNodeMouseDown(e, n)}
              onDoubleClick={() => setEditing(n.id)}
              onLabelCommit={(v) => {
                updateLabel(n.id, v);
                setEditing(null);
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function NodeShape({
  node,
  selected,
  editing,
  onMouseDown,
  onDoubleClick,
  onLabelCommit,
}: {
  node: Node;
  selected: boolean;
  editing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onLabelCommit: (v: string) => void;
}) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const stroke = selected ? "oklch(0.72 0.13 185)" : "oklch(0.55 0.04 220)";
  const fill = "oklch(0.99 0.005 200)";
  const strokeWidth = selected ? 2.5 : 1.5;

  let shapeEl: React.ReactNode;
  if (node.kind === "rect") {
    shapeEl = (
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  } else if (node.kind === "ellipse") {
    shapeEl = (
      <ellipse
        cx={cx}
        cy={cy}
        rx={node.w / 2}
        ry={node.h / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  } else {
    const pts = `${cx},${node.y} ${node.x + node.w},${cy} ${cx},${node.y + node.h} ${node.x},${cy}`;
    shapeEl = <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
  }

  return (
    <g onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} style={{ cursor: "move" }}>
      {shapeEl}
      {editing ? (
        <foreignObject x={node.x + 6} y={node.y + node.h / 2 - 14} width={node.w - 12} height={28}>
          <input
            autoFocus
            defaultValue={node.label}
            onBlur={(e) => onLabelCommit(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onLabelCommit((e.target as HTMLInputElement).value);
            }}
            className="w-full rounded border bg-background px-1 py-0.5 text-center text-sm outline-none"
          />
        </foreignObject>
      ) : (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={14}
          fontWeight={500}
          fill="oklch(0.2 0.02 220)"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {node.label}
        </text>
      )}
    </g>
  );
}
