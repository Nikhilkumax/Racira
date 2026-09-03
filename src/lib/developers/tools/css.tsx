import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect, OptNumber } from "@/components/developers/tools/options-controls";

const cssFormatter: ToolDefinition = {
  slug: "css-formatter",
  mode: "text",
  transform: async ({ input }) => {
    const { format } = await import("prettier/standalone");
    const plugin = (await import("prettier/plugins/postcss")).default;
    const out = await format(input, { parser: "css", plugins: [plugin] });
    return { output: out };
  },
};

const cssMinifier: ToolDefinition = {
  slug: "css-minifier",
  mode: "text",
  transform: ({ input }) => ({
    output: input
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim(),
  }),
};

const boxShadowGenerator: ToolDefinition = {
  slug: "box-shadow-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="X" value={Number(options.x ?? 4)} onChange={(v) => setOptions({ ...options, x: v })} />
      <OptNumber label="Y" value={Number(options.y ?? 4)} onChange={(v) => setOptions({ ...options, y: v })} />
      <OptNumber label="Blur" value={Number(options.blur ?? 10)} onChange={(v) => setOptions({ ...options, blur: v })} />
      <OptNumber label="Spread" value={Number(options.spread ?? 0)} onChange={(v) => setOptions({ ...options, spread: v })} />
      <OptRow label="Color"><input type="color" defaultValue={String(options.color ?? "#000000")} onChange={(e) => setOptions({ ...options, color: e.target.value })} className="h-8 w-12 rounded" /></OptRow>
      <label className="text-xs flex items-center gap-1"><input type="checkbox" defaultChecked={Boolean(options.inset)} onChange={(e) => setOptions({ ...options, inset: e.target.checked })} /> inset</label>
    </OptionsBar>
  ),
  defaultOptions: { x: 4, y: 4, blur: 10, spread: 0, color: "#000000", inset: false },
  transform: ({ options }) => {
    const o = options;
    const css = `box-shadow: ${o.inset ? "inset " : ""}${o.x}px ${o.y}px ${o.blur}px ${o.spread}px ${o.color};`;
    return { output: css, html: `<div style="width: 120px; height: 80px; background: #fff; border-radius: 8px; margin: 20px auto; ${css}"></div>` };
  },
};

const textShadowGenerator: ToolDefinition = {
  slug: "text-shadow-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="X" value={Number(options.x ?? 2)} onChange={(v) => setOptions({ ...options, x: v })} />
      <OptNumber label="Y" value={Number(options.y ?? 2)} onChange={(v) => setOptions({ ...options, y: v })} />
      <OptNumber label="Blur" value={Number(options.blur ?? 4)} onChange={(v) => setOptions({ ...options, blur: v })} />
      <OptRow label="Color"><input type="color" defaultValue={String(options.color ?? "#888888")} onChange={(e) => setOptions({ ...options, color: e.target.value })} className="h-8 w-12 rounded" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { x: 2, y: 2, blur: 4, color: "#888888" },
  transform: ({ options }) => {
    const o = options;
    const css = `text-shadow: ${o.x}px ${o.y}px ${o.blur}px ${o.color};`;
    return { output: css, html: `<div style="font-size: 32px; font-weight: 800; text-align: center; padding: 20px; ${css}">Text Shadow</div>` };
  },
};

const borderRadiusGenerator: ToolDefinition = {
  slug: "border-radius-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="TL" value={Number(options.tl ?? 16)} onChange={(v) => setOptions({ ...options, tl: v })} />
      <OptNumber label="TR" value={Number(options.tr ?? 16)} onChange={(v) => setOptions({ ...options, tr: v })} />
      <OptNumber label="BR" value={Number(options.br ?? 16)} onChange={(v) => setOptions({ ...options, br: v })} />
      <OptNumber label="BL" value={Number(options.bl ?? 16)} onChange={(v) => setOptions({ ...options, bl: v })} />
    </OptionsBar>
  ),
  defaultOptions: { tl: 16, tr: 16, br: 16, bl: 16 },
  transform: ({ options }) => {
    const o = options;
    const css = `border-radius: ${o.tl}px ${o.tr}px ${o.br}px ${o.bl}px;`;
    return { output: css, html: `<div style="width: 120px; height: 120px; background: linear-gradient(135deg, var(--color-primary, #4f46e5), #ec4899); margin: 20px auto; ${css}"></div>` };
  },
};

const cssTriangleGenerator: ToolDefinition = {
  slug: "css-triangle-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.dir ?? "up")} onChange={(v) => setOptions({ ...options, dir: v })} options={[{ value: "up", label: "Up" }, { value: "down", label: "Down" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
      <OptNumber label="Size" value={Number(options.size ?? 50)} onChange={(v) => setOptions({ ...options, size: v })} />
      <OptRow label="Color"><input type="color" defaultValue={String(options.color ?? "#4f46e5")} onChange={(e) => setOptions({ ...options, color: e.target.value })} className="h-8 w-12 rounded" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { dir: "up", size: 50, color: "#4f46e5" },
  transform: ({ options }) => {
    const { dir, size, color } = options as { dir: string; size: number; color: string };
    let css = "";
    if (dir === "up") css = `border-left: ${size}px solid transparent; border-right: ${size}px solid transparent; border-bottom: ${size}px solid ${color};`;
    if (dir === "down") css = `border-left: ${size}px solid transparent; border-right: ${size}px solid transparent; border-top: ${size}px solid ${color};`;
    if (dir === "left") css = `border-top: ${size}px solid transparent; border-bottom: ${size}px solid transparent; border-right: ${size}px solid ${color};`;
    if (dir === "right") css = `border-top: ${size}px solid transparent; border-bottom: ${size}px solid transparent; border-left: ${size}px solid ${color};`;
    return { output: `width: 0;\nheight: 0;\n${css}`, html: `<div style="width: 0; height: 0; margin: 20px auto; ${css}"></div>` };
  },
};

const cssFilterGenerator: ToolDefinition = {
  slug: "css-filter-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptNumber label="Blur" value={Number(options.blur ?? 0)} onChange={(v) => setOptions({ ...options, blur: v })} />
      <OptNumber label="Bright %" value={Number(options.bright ?? 100)} onChange={(v) => setOptions({ ...options, bright: v })} />
      <OptNumber label="Contrast %" value={Number(options.contrast ?? 100)} onChange={(v) => setOptions({ ...options, contrast: v })} />
      <OptNumber label="Grayscale %" value={Number(options.gray ?? 0)} onChange={(v) => setOptions({ ...options, gray: v })} />
      <OptNumber label="Sepia %" value={Number(options.sepia ?? 0)} onChange={(v) => setOptions({ ...options, sepia: v })} />
      <OptNumber label="Hue °" value={Number(options.hue ?? 0)} onChange={(v) => setOptions({ ...options, hue: v })} />
    </OptionsBar>
  ),
  defaultOptions: { blur: 0, bright: 100, contrast: 100, gray: 0, sepia: 0, hue: 0 },
  transform: ({ options }) => {
    const o = options as Record<string, number>;
    const css = `filter: blur(${o.blur}px) brightness(${o.bright}%) contrast(${o.contrast}%) grayscale(${o.gray}%) sepia(${o.sepia}%) hue-rotate(${o.hue}deg);`;
    return { output: css, html: `<div style="width: 140px; height: 100px; background: linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6); margin: 20px auto; ${css}"></div>` };
  },
};

const cubicBezierGenerator: ToolDefinition = {
  slug: "cubic-bezier-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => {
    const defaults: Record<string, number> = { x1: 0.4, y1: 0, x2: 0.2, y2: 1 };
    return (
      <OptionsBar>
        {(["x1", "y1", "x2", "y2"] as const).map((k) => (
          <OptNumber
            key={k}
            label={k.toUpperCase()}
            value={Number(options[k] ?? defaults[k])}
            onChange={(v) => setOptions({ ...options, [k]: v })}
          />
        ))}
      </OptionsBar>
    );
  },
  defaultOptions: { x1: 0.4, y1: 0, x2: 0.2, y2: 1 },
  transform: ({ options }) => {
    const o = options as Record<string, number>;
    const css = `cubic-bezier(${o.x1}, ${o.y1}, ${o.x2}, ${o.y2})`;
    return { output: `transition: all 0.6s ${css};`, html: `<style>@keyframes bezmove{from{transform:translateX(0)}to{transform:translateX(160px)}}.bez{animation:bezmove 1.6s infinite alternate;animation-timing-function:${css}}</style><div class="bez" style="width:40px;height:40px;background:#4f46e5;border-radius:8px;margin:20px auto"></div>` };
  },
};

const cssUnitConverter: ToolDefinition = {
  slug: "css-unit-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.from ?? "px")} onChange={(v) => setOptions({ ...options, from: v })} options={[{ value: "px", label: "px" }, { value: "rem", label: "rem" }, { value: "em", label: "em" }, { value: "pt", label: "pt" }]} />
      <OptRow label="Base px"><input type="number" defaultValue={Number(options.base ?? 16)} onChange={(e) => setOptions({ ...options, base: Number(e.target.value) })} className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { from: "px", base: 16 },
  transform: ({ input, options }) => {
    const nums = input.match(/-?\d*\.?\d+/g) ?? [];
    if (!nums.length) return { output: "Enter a value, e.g. 32 or 32px" };
    const base = Number(options.base ?? 16);
    const from = String(options.from ?? "px");
    const toPx = (v: number) => (from === "px" ? v : from === "rem" || from === "em" ? v * base : from === "pt" ? v * (96 / 72) : v);
    const lines = nums.map((n) => {
      const v = Number(n);
      const px = toPx(v);
      return `${v}${from} = ${px}px = ${(px / base).toFixed(4)}rem = ${(px * (72 / 96)).toFixed(2)}pt`;
    });
    return { output: lines.join("\n") };
  },
};

const remPxConverter: ToolDefinition = {
  slug: "rem-px-converter",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.dir ?? "rem")} onChange={(v) => setOptions({ ...options, dir: v })} options={[{ value: "rem", label: "px → rem" }, { value: "px", label: "rem → px" }]} />
      <OptRow label="Base"><input type="number" defaultValue={Number(options.base ?? 16)} onChange={(e) => setOptions({ ...options, base: Number(e.target.value) })} className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { dir: "rem", base: 16 },
  transform: ({ input, options }) => {
    const base = Number(options.base ?? 16);
    const nums = input.match(/-?\d*\.?\d+/g) ?? [];
    if (!nums.length) return { output: "Enter a number" };
    const out = nums.map((n) => {
      const v = Number(n);
      return options.dir === "rem" ? `${v}px = ${(v / base).toFixed(4)}rem` : `${v}rem = ${(v * base).toFixed(2)}px`;
    });
    return { output: out.join("\n") };
  },
};

const clampCalculator: ToolDefinition = {
  slug: "clamp-calculator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Min"><input type="number" defaultValue={Number(options.min ?? 16)} onChange={(e) => setOptions({ ...options, min: Number(e.target.value) })} className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Max"><input type="number" defaultValue={Number(options.max ?? 32)} onChange={(e) => setOptions({ ...options, max: Number(e.target.value) })} className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Min vw"><input type="number" defaultValue={Number(options.minVw ?? 400)} onChange={(e) => setOptions({ ...options, minVw: Number(e.target.value) })} className="h-8 w-24 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
      <OptRow label="Max vw"><input type="number" defaultValue={Number(options.maxVw ?? 1200)} onChange={(e) => setOptions({ ...options, maxVw: Number(e.target.value) })} className="h-8 w-24 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { min: 16, max: 32, minVw: 400, maxVw: 1200 },
  transform: ({ input, options }) => {
    // Input can override defaults; otherwise use options.
    const o = options as Record<string, number>;
    const slope = (o.max - o.min) / (o.maxVw - o.minVw);
    const intercept = o.min - slope * o.minVw;
    const preferredVw = `${(slope * 100).toFixed(4)}vw`;
    const preferredPx = `${intercept.toFixed(2)}px`;
    return { output: `clamp(${o.min}px, ${preferredPx} + ${preferredVw}, ${o.max}px)`, info: `input ignored: ${input || "—"} (uses options above)` };
  },
};

const clampGenerator: ToolDefinition = { ...clampCalculator, slug: "css-clamp-generator" };

const cssSpecificityCalculator: ToolDefinition = {
  slug: "css-specificity-calculator",
  mode: "text",
  transform: ({ input }) => {
    const selectors = input.split(",").map((s) => s.trim()).filter(Boolean);
    const calc = (sel: string): string => {
      const ids = (sel.match(/#/g) ?? []).length;
      const classes = (sel.match(/\.[a-zA-Z]/g) ?? []).length + (sel.match(/\[[^\]]+\]/g) ?? []).length + (sel.match(/:[a-zA-Z]/g) ?? []).length;
      const elementTypes = (sel.match(/\b[a-z][a-z0-9-]*\b/gi) ?? []).filter((t) => !["not", "is", "where", "has"].includes(t.toLowerCase())).length;
      const score = ids * 100 + classes * 10 + elementTypes;
      return `${sel} → (${ids}, ${classes}, ${elementTypes}) = ${score}`;
    };
    return { output: selectors.map(calc).join("\n") };
  },
};

const tailwindClassSorter: ToolDefinition = {
  slug: "tailwind-class-sorter",
  mode: "text",
  transform: ({ input }) => {
    const order = ["flex", "grid", "block", "inline", "hidden", "w", "h", "p", "m", "text", "font", "bg", "border", "rounded", "shadow"];
    const classes = input.trim().split(/\s+/).filter(Boolean);
    classes.sort((a, b) => {
      const ai = order.findIndex((p) => a.startsWith(p));
      const bi = order.findIndex((p) => b.startsWith(p));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    });
    return { output: classes.join(" ") };
  },
};

const tailwindClassMerger: ToolDefinition = {
  slug: "tailwind-class-merger",
  mode: "dual",
  transform: ({ input, secondInput }) => {
    const a = input.trim().split(/\s+/).filter(Boolean);
    const b = (secondInput ?? "").trim().split(/\s+/).filter(Boolean);
    // Later classes with same prefix win.
    const map = new Map<string, string>();
    for (const c of [...a, ...b]) {
      const prefix = c.replace(/[^a-z-].*$/i, "");
      map.set(prefix, c);
    }
    return { output: Array.from(map.values()).join(" "), info: `${a.length} + ${b.length} → ${map.size} classes` };
  },
};

const cssToTailwindConverter: ToolDefinition = {
  slug: "css-to-tailwind-converter",
  mode: "text",
  transform: ({ input }) => {
    const map: [RegExp, string][] = [
      [/display:\s*flex/, "flex"],
      [/display:\s*grid/, "grid"],
      [/display:\s*none/, "hidden"],
      [/display:\s*block/, "block"],
      [/flex-direction:\s*column/, "flex-col"],
      [/justify-content:\s*center/, "justify-center"],
      [/align-items:\s*center/, "items-center"],
      [/gap:\s*(\d+)px/, "gap-$1"],
      [/padding:\s*(\d+)px/, "p-$1"],
      [/margin:\s*(\d+)px/, "m-$1"],
      [/font-weight:\s*(\d+)/, "font-[$1]"],
      [/text-align:\s*center/, "text-center"],
      [/border-radius:\s*(\d+)px/, "rounded-$1"],
      [/color:\s*(#[0-9a-fA-F]+)/, "text-[$1]"],
      [/background(-color)?:\s*(#[0-9a-fA-F]+)/, "bg-[$2]"],
    ];
    const lines: string[] = [];
    for (const decl of input.split(/[;{}]/).map((s) => s.trim()).filter(Boolean)) {
      let matched = false;
      for (const [re, cls] of map) {
        const m = re.exec(decl);
        if (m) {
          lines.push(`${decl} → ${cls.replace(/\$(\d)/, (_, i) => m[Number(i)])}`);
          matched = true;
          break;
        }
      }
      if (!matched) lines.push(`${decl} → (no common Tailwind equivalent)`);
    }
    return { output: lines.join("\n") };
  },
};

export const cssTools: ToolDefinition[] = [
  cssFormatter, cssMinifier, boxShadowGenerator, textShadowGenerator, borderRadiusGenerator,
  cssTriangleGenerator, cssFilterGenerator, cubicBezierGenerator, cssUnitConverter,
  remPxConverter, clampGenerator, clampCalculator,
  tailwindClassSorter, tailwindClassMerger, cssToTailwindConverter,
];
