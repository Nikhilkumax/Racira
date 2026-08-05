"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ColorField } from "@/domains/colors/components/color-field";
import { Swatch } from "@/domains/colors/components/swatch";
import { CopyButton } from "@/domains/colors/components/copy-button";
import { ImageDropzone } from "@/domains/colors/components/image-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CSS_NAMED_COLORS, contrastRatio, darken, fileToImage, imageFileToPixels,
  kmeansPalette, lighten, mix, randomHex, rgbToHex, toCmyk, toHex, toHslObj,
  toHslString, toOklchObj, toOklchString, toRgb255, toRgbString,
} from "@/domains/colors/lib/color";

function Section({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>}
      {children}
    </div>
  );
}

/* ===================== Analysis ===================== */

function nearestNamed(hex: string): { name: string; hex: string; distance: number } {
  const { r, g, b } = toRgb255(hex);
  let best = { name: "", hex: "", distance: Infinity };
  for (const [name, h] of CSS_NAMED_COLORS) {
    const t = toRgb255(h);
    const d = (r - t.r) ** 2 + (g - t.g) ** 2 + (b - t.b) ** 2;
    if (d < best.distance) best = { name, hex: h, distance: d };
  }
  return { ...best, distance: Math.round(Math.sqrt(best.distance)) };
}

export function ColorNameLookup() {
  const [c, setC] = useState("#3B82F6");
  const n = nearestNamed(c);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section><ColorField value={c} onChange={setC} /><div className="mt-4"><Swatch color={c} size="lg" /></div></Section>
      <Section title="Nearest CSS named color">
        <Swatch color={n.hex} label={n.name} size="lg" />
        <p className="mt-3 text-sm text-muted-foreground">RGB distance: {n.distance}</p>
      </Section>
    </div>
  );
}

export function NearestColorFinder() { return <ColorNameLookup />; }

export function ColorDistance() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#EF4444");
  const ra = toRgb255(a), rb = toRgb255(b);
  const oa = toOklchObj(a), ob = toOklchObj(b);
  const rgbDist = Math.round(Math.sqrt((ra.r - rb.r) ** 2 + (ra.g - rb.g) ** 2 + (ra.b - rb.b) ** 2));
  const okDist = Math.sqrt((oa.l - ob.l) ** 2 + (oa.c - ob.c) ** 2 + (((oa.h - ob.h + 540) % 360 - 180) / 360) ** 2);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField label="Color A" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="Color B" value={b} onChange={setB} />
      </Section>
      <Section title="Distance">
        <p className="text-sm text-muted-foreground">RGB Euclidean</p>
        <p className="text-3xl font-bold">{rgbDist}</p>
        <p className="mt-4 text-sm text-muted-foreground">OKLCH ΔE (approx.)</p>
        <p className="text-3xl font-bold">{okDist.toFixed(3)}</p>
      </Section>
    </div>
  );
}

export function ColorPercentageAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Array<{ color: string; pct: number }>>([]);
  useEffect(() => {
    if (!file) return;
    imageFileToPixels(file, 80).then(({ pixels }) => {
      const centers = kmeansPalette(pixels, 6);
      const counts = centers.map(() => 0);
      for (const p of pixels) {
        let best = 0, bd = Infinity;
        for (let i = 0; i < centers.length; i++) {
          const c = centers[i];
          const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
          if (d < bd) { bd = d; best = i; }
        }
        counts[best]++;
      }
      const total = pixels.length || 1;
      const out = centers
        .map((c, i) => ({ color: rgbToHex(c[0], c[1], c[2]), pct: Math.round((counts[i] / total) * 1000) / 10 }))
        .sort((a, b) => b.pct - a.pct);
      setData(out);
    });
  }, [file]);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex h-8">
              {data.map((d, i) => <div key={i} style={{ width: `${d.pct}%`, background: d.color }} />)}
            </div>
          </div>
          <Section title="Breakdown">
            <div className="grid gap-2">
              {data.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border border-border" style={{ background: d.color }} />
                  <span className="font-mono text-sm">{d.color.toUpperCase()}</span>
                  <span className="ml-auto text-sm">{d.pct}%</span>
                </div>
              ))}
            </div>
          </Section>
          <Button variant="outline" onClick={() => setFile(null)}>Replace image</Button>
        </>
      )}
    </div>
  );
}

/* ===================== Pickers ===================== */

export function EyedropperTool() {
  const [picked, setPicked] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const supported = typeof window !== "undefined" && "EyeDropper" in window;
  async function go() {
    setErr("");
    try {
      const ed = new (window as any).EyeDropper();
      const r = await ed.open();
      setPicked(r.sRGBHex);
    } catch (e: any) {
      setErr(e?.message || "Cancelled");
    }
  }
  return (
    <div className="grid gap-6">
      <Section>
        {supported ? (
          <Button onClick={go}>Open eyedropper</Button>
        ) : (
          <p className="text-sm text-muted-foreground">EyeDropper API is not supported in this browser. Try Chrome, Edge or Opera.</p>
        )}
        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      </Section>
      {picked && <Swatch color={picked} label="Picked" size="lg" />}
    </div>
  );
}

/* ===================== Palettes ===================== */

function RandomPalette({ generator, label }: { generator: () => string[]; label: string }) {
  const [colors, setColors] = useState<string[]>([]);
  // Callers pass an inline arrow, so `generator` is a new identity each render; a ref keeps
  // the mount effect from re-firing without needing a dependency-array suppression.
  const generatorRef = useRef(generator);
  generatorRef.current = generator;

  useEffect(() => {
    setColors(generatorRef.current());
  }, []);

  return (
    <div className="grid gap-6">
      <Button onClick={() => setColors(generator())}>{label}</Button>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {colors.map((c, i) => <Swatch key={i} color={c} />)}
      </div>
    </div>
  );
}

export function RandomPaletteGenerator() {
  return <RandomPalette generator={() => Array.from({ length: 5 }, randomHex)} label="Generate random palette" />;
}

export function LuckyColorGenerator() {
  return <RandomPalette generator={() => [randomHex()]} label="Roll a lucky color" />;
}

export function PastelPaletteGenerator() {
  const gen = () => Array.from({ length: 5 }, () => {
    const h = Math.floor(Math.random() * 360);
    return toHex(`oklch(0.88 0.08 ${h})`);
  });
  return <RandomPalette generator={gen} label="Generate pastel palette" />;
}

export function NeonPaletteGenerator() {
  const gen = () => Array.from({ length: 5 }, () => {
    const h = Math.floor(Math.random() * 360);
    return toHex(`oklch(0.75 0.3 ${h})`);
  });
  return <RandomPalette generator={gen} label="Generate neon palette" />;
}

const SEASONS: Record<string, number[]> = {
  spring: [80, 110, 50, 160, 200],
  summer: [200, 220, 180, 30, 60],
  autumn: [25, 40, 15, 60, 350],
  winter: [240, 260, 220, 280, 200],
};
export function SeasonalPaletteGenerator() {
  const [season, setSeason] = useState<string>("spring");
  const colors = SEASONS[season].map((h, i) => toHex(`oklch(${0.55 + (i % 3) * 0.12} 0.14 ${h})`));
  return (
    <div className="grid gap-6">
      <Section>
        <Label>Season</Label>
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.keys(SEASONS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </Section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {colors.map((c, i) => <Swatch key={i} color={c} />)}
      </div>
    </div>
  );
}

function tailwindShadesFor(c: string): Array<[string, string]> {
  const steps = [
    ["50", 0.97], ["100", 0.93], ["200", 0.85], ["300", 0.75], ["400", 0.65],
    ["500", 0.55], ["600", 0.47], ["700", 0.4], ["800", 0.32], ["900", 0.22], ["950", 0.14],
  ] as const;
  const o = toOklchObj(c);
  return steps.map(([k, l]) => [k as string, toHex(`oklch(${l} ${o.c} ${o.h})`)]);
}

export function TailwindPaletteGenerator() {
  const [c, setC] = useState("#3B82F6");
  const palette = tailwindShadesFor(c);
  return (
    <div className="grid gap-6">
      <Section><ColorField value={c} onChange={setC} /></Section>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 lg:grid-cols-11">
        {palette.map(([k, h]) => (
          <div key={k} className="overflow-hidden rounded-md border border-border">
            <div className="h-16" style={{ background: h }} />
            <div className="bg-card px-2 py-1.5">
              <p className="text-xs font-semibold">{k}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{h}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MATERIAL_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;
export function MaterialPaletteGenerator() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const palette = MATERIAL_STEPS.map((k, i) => {
    const l = 0.95 - i * 0.08;
    return [k, toHex(`oklch(${Math.max(0.1, l)} ${o.c} ${o.h})`)] as [string, string];
  });
  return (
    <div className="grid gap-6">
      <Section><ColorField value={c} onChange={setC} /></Section>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {palette.map(([k, h]) => (
          <div key={k} className="overflow-hidden rounded-md border border-border">
            <div className="h-16" style={{ background: h }} />
            <div className="bg-card px-2 py-1.5">
              <p className="text-xs font-semibold">{k}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{h}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrandPaletteGenerator() {
  const [name, setName] = useState("acme");
  const seed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name]);
  const palette = [
    toHex(`oklch(0.55 0.18 ${seed})`),
    toHex(`oklch(0.7 0.15 ${(seed + 30) % 360})`),
    toHex(`oklch(0.5 0.16 ${(seed + 180) % 360})`),
    toHex(`oklch(0.95 0.02 ${seed})`),
    toHex(`oklch(0.2 0.04 ${seed})`),
  ];
  return (
    <div className="grid gap-6">
      <Section>
        <Label htmlFor="bname">Brand name</Label>
        <Input id="bname" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 max-w-sm" />
      </Section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {palette.map((c, i) => <Swatch key={i} color={c} label={["Primary","Accent","Secondary","Surface","Foreground"][i]} />)}
      </div>
    </div>
  );
}

/* ===================== Design System References ===================== */

function PaletteRef({ groups }: { groups: Array<{ name: string; colors: Array<[string, string]> }> }) {
  return (
    <div className="grid gap-6">
      {groups.map((g) => (
        <Section key={g.name} title={g.name}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
            {g.colors.map(([k, h]) => (
              <div key={k} className="overflow-hidden rounded-md border border-border">
                <div className="h-14" style={{ background: h }} />
                <div className="bg-card px-2 py-1">
                  <p className="text-xs font-semibold">{k}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{h}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function refFromBases(bases: Record<string, string>) {
  return Object.entries(bases).map(([name, hex]) => ({
    name,
    colors: tailwindShadesFor(hex),
  }));
}

export function TailwindColorReference() {
  return <PaletteRef groups={refFromBases({
    slate: "#64748b", red: "#ef4444", orange: "#f97316", amber: "#f59e0b",
    yellow: "#eab308", lime: "#84cc16", green: "#22c55e", emerald: "#10b981",
    teal: "#14b8a6", cyan: "#06b6d4", sky: "#0ea5e9", blue: "#3b82f6",
    indigo: "#6366f1", violet: "#8b5cf6", purple: "#a855f7", fuchsia: "#d946ef",
    pink: "#ec4899", rose: "#f43f5e",
  })} />;
}

export function MaterialColorReference() {
  return <PaletteRef groups={refFromBases({
    red: "#f44336", pink: "#e91e63", purple: "#9c27b0", "deep-purple": "#673ab7",
    indigo: "#3f51b5", blue: "#2196f3", "light-blue": "#03a9f4", cyan: "#00bcd4",
    teal: "#009688", green: "#4caf50", "light-green": "#8bc34a", lime: "#cddc39",
    yellow: "#ffeb3b", amber: "#ffc107", orange: "#ff9800", "deep-orange": "#ff5722",
    brown: "#795548", gray: "#9e9e9e", "blue-gray": "#607d8b",
  })} />;
}

export function BootstrapColorReference() {
  return <PaletteRef groups={refFromBases({
    primary: "#0d6efd", secondary: "#6c757d", success: "#198754", danger: "#dc3545",
    warning: "#ffc107", info: "#0dcaf0", light: "#f8f9fa", dark: "#212529",
  })} />;
}

export function FluentColorReference() {
  return <PaletteRef groups={refFromBases({
    "communication-blue": "#0078d4", "navy-blue": "#001e60", "royal-blue": "#004e8c",
    teal: "#038387", green: "#107c10", "dark-green": "#054b16",
    red: "#d13438", "dark-red": "#a4262c", magenta: "#b4009e", purple: "#5c2d91",
    orange: "#ff8c00", yellow: "#fce100",
  })} />;
}

export function ChakraColorReference() {
  return <PaletteRef groups={refFromBases({
    gray: "#718096", red: "#e53e3e", orange: "#dd6b20", yellow: "#d69e2e",
    green: "#38a169", teal: "#319795", blue: "#3182ce", cyan: "#00b5d8",
    purple: "#805ad5", pink: "#d53f8c",
  })} />;
}

/* ===================== CSS Color Tools ===================== */

export function CssColorGenerator() {
  const [c, setC] = useState("#3B82F6");
  const r = toRgb255(c);
  const formats = [
    ["hex", toHex(c).toUpperCase()],
    ["rgb", toRgbString(c)],
    ["rgba", `rgba(${r.r}, ${r.g}, ${r.b}, 1)`],
    ["hsl", toHslString(c)],
    ["oklch", toOklchString(c)],
  ];
  return (
    <div className="grid gap-6">
      <Section><ColorField value={c} onChange={setC} /></Section>
      <Section title="CSS values">
        <div className="grid gap-2">
          {formats.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
              <span className="text-xs uppercase text-muted-foreground">{k}</span>
              <code className="font-mono text-sm">{v}</code>
              <CopyButton value={v} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export const CssColorConverter = CssColorGenerator;
export const CssColorFormatter = CssColorGenerator;

export function CssColorPreview() {
  const [v, setV] = useState("rgb(59, 130, 246)");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <Label htmlFor="cv">CSS color value</Label>
        <Input id="cv" value={v} onChange={(e) => setV(e.target.value)} className="mt-2 font-mono" />
      </Section>
      <div className="h-48 rounded-xl border border-border" style={{ background: v }} />
    </div>
  );
}

export function CssVariableGenerator() {
  const [colors, setColors] = useState<Array<{ name: string; value: string }>>([
    { name: "primary", value: "#3B82F6" },
    { name: "background", value: "#FFFFFF" },
    { name: "foreground", value: "#0F172A" },
  ]);
  const css = `:root {\n${colors.map((c) => `  --${c.name}: ${c.value};`).join("\n")}\n}`;
  return (
    <div className="grid gap-6">
      <Section title="Variables">
        <div className="grid gap-3">
          {colors.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <Input value={c.name} onChange={(e) => { const n = [...colors]; n[i] = { ...n[i], name: e.target.value }; setColors(n); }} />
              <ColorField value={c.value} onChange={(v) => { const n = [...colors]; n[i] = { ...n[i], value: v }; setColors(n); }} label="" />
              <Button variant="outline" size="sm" onClick={() => setColors(colors.filter((_, j) => j !== i))}>×</Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setColors([...colors, { name: `color-${colors.length + 1}`, value: randomHex() }])}>Add variable</Button>
        </div>
      </Section>
      <Section title="CSS">
        <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre>
        <CopyButton value={css} className="mt-2" />
      </Section>
    </div>
  );
}

/* ===================== Design Effects ===================== */

export function GlassmorphismGenerator() {
  const [bg, setBg] = useState("#3B82F6");
  const [tint, setTint] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState(20);
  const [blur, setBlur] = useState(20);
  const css = `background: ${tint}${Math.round((opacity / 100) * 255).toString(16).padStart(2, "0").toUpperCase()};\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(255,255,255,0.2);\nborder-radius: 16px;`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField label="Backdrop" value={bg} onChange={setBg} />
        <div className="mt-3" /><ColorField label="Glass tint" value={tint} onChange={setTint} />
        <div className="mt-4"><Label>Opacity: {opacity}%</Label><Slider min={0} max={100} value={[opacity]} onValueChange={(v) => setOpacity(v[0])} className="mt-2" /></div>
        <div className="mt-3"><Label>Blur: {blur}px</Label><Slider min={0} max={60} value={[blur]} onValueChange={(v) => setBlur(v[0])} className="mt-2" /></div>
      </Section>
      <div className="relative h-72 overflow-hidden rounded-xl" style={{ background: bg }}>
        <div className="absolute inset-6 flex items-center justify-center text-white font-semibold"
          style={{ background: tint + Math.round((opacity / 100) * 255).toString(16).padStart(2, "0"), backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16 }}>
          Glass
        </div>
      </div>
      <Section title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Section>
    </div>
  );
}

export function NeumorphismGenerator() {
  const [bg, setBg] = useState("#E0E5EC");
  const [dist, setDist] = useState(12);
  const [blur, setBlur] = useState(24);
  const light = lighten(bg, 0.08);
  const dark = darken(bg, 0.08);
  const css = `background: ${bg};\nbox-shadow: ${dist}px ${dist}px ${blur}px ${dark}, -${dist}px -${dist}px ${blur}px ${light};\nborder-radius: 20px;`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField label="Background" value={bg} onChange={setBg} />
        <div className="mt-3"><Label>Distance: {dist}px</Label><Slider min={2} max={40} value={[dist]} onValueChange={(v) => setDist(v[0])} className="mt-2" /></div>
        <div className="mt-3"><Label>Blur: {blur}px</Label><Slider min={2} max={80} value={[blur]} onValueChange={(v) => setBlur(v[0])} className="mt-2" /></div>
      </Section>
      <div className="flex h-72 items-center justify-center rounded-xl" style={{ background: bg }}>
        <div className="h-32 w-32" style={{ background: bg, boxShadow: `${dist}px ${dist}px ${blur}px ${dark}, -${dist}px -${dist}px ${blur}px ${light}`, borderRadius: 20 }} />
      </div>
      <Section title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Section>
    </div>
  );
}

export function ShadowColorGenerator() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const shadow = toHex(`oklch(${Math.max(0.15, o.l - 0.35)} ${o.c} ${o.h})`);
  const css = `box-shadow: 0 10px 30px -10px ${shadow}80;`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section><ColorField value={c} onChange={setC} /></Section>
      <div className="flex h-72 items-center justify-center rounded-xl bg-background">
        <div className="h-32 w-32 rounded-2xl" style={{ background: c, boxShadow: `0 16px 40px -10px ${shadow}` }} />
      </div>
      <Section title="Shadow color"><Swatch color={shadow} /><pre className="mt-3 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Section>
    </div>
  );
}

export function ColorOverlayGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [c, setC] = useState("#3B82F6");
  const [a, setA] = useState(40);
  const [blend, setBlend] = useState<string>("multiply");
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            <Section>
              <ColorField label="Overlay" value={c} onChange={setC} />
              <div className="mt-3"><Label>Opacity: {a}%</Label><Slider min={0} max={100} value={[a]} onValueChange={(v) => setA(v[0])} className="mt-2" /></div>
              <div className="mt-3">
                <Label>Blend mode</Label>
                <Select value={blend} onValueChange={setBlend}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["multiply","screen","overlay","darken","lighten","color-dodge","color-burn","difference","exclusion","hue","saturation","color","luminosity"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setFile(null)} className="mt-4 w-full">Replace image</Button>
            </Section>
            <Section>
              <div className="relative overflow-hidden rounded-lg">
                {url && <img src={url} alt="" className="w-full" />}
                <div className="absolute inset-0" style={{ background: c, opacity: a / 100, mixBlendMode: blend as any }} />
              </div>
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

/* ===================== Developer Utilities ===================== */

function usePaletteEditor(initial?: string[]) {
  const [colors, setColors] = useState<string[]>(initial ?? ["#3B82F6", "#A855F7", "#EF4444", "#10B981", "#F59E0B"]);
  return { colors, ui: (
    <Section title="Palette">
      <div className="grid gap-2">
        {colors.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <ColorField value={c} onChange={(v) => { const n = [...colors]; n[i] = v; setColors(n); }} label="" />
            <Button variant="outline" size="sm" onClick={() => setColors(colors.filter((_, j) => j !== i))}>×</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => setColors([...colors, randomHex()])}>Add color</Button>
      </div>
    </Section>
  ) };
}

export function ColorJsonGenerator() {
  const ed = usePaletteEditor();
  const json = JSON.stringify(
    Object.fromEntries(ed.colors.map((c, i) => [`color-${i + 1}`, c.toUpperCase()])),
    null, 2,
  );
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {ed.ui}
      <Section title="JSON"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{json}</pre><CopyButton value={json} className="mt-2" /></Section>
    </div>
  );
}

export function ColorTokenGenerator() {
  const ed = usePaletteEditor();
  const tokens = ed.colors.map((c, i) => {
    const r = toRgb255(c);
    return { name: `color.brand.${i + 1}`, hex: c.toUpperCase(), rgb: `${r.r}, ${r.g}, ${r.b}`, hsl: toHslString(c) };
  });
  const json = JSON.stringify(tokens, null, 2);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {ed.ui}
      <Section title="Tokens"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{json}</pre><CopyButton value={json} className="mt-2" /></Section>
    </div>
  );
}

export function DesignTokenGenerator() {
  const ed = usePaletteEditor();
  const obj = {
    color: Object.fromEntries(ed.colors.map((c, i) => [`brand-${i + 1}`, { value: c.toUpperCase(), type: "color" }])),
  };
  const json = JSON.stringify(obj, null, 2);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {ed.ui}
      <Section title="W3C Design Tokens"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{json}</pre><CopyButton value={json} className="mt-2" /></Section>
    </div>
  );
}

export function CssVariablesExporter() {
  const ed = usePaletteEditor();
  const css = `:root {\n${ed.colors.map((c, i) => `  --brand-${i + 1}: ${c.toUpperCase()};`).join("\n")}\n}`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {ed.ui}
      <Section title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Section>
    </div>
  );
}

export function TailwindColorExporter() {
  const [c, setC] = useState("#3B82F6");
  const palette = tailwindShadesFor(c);
  const js = `// tailwind.config.js\nmodule.exports = {\n  theme: { extend: { colors: { brand: {\n${palette.map(([k, h]) => `      "${k}": "${h}",`).join("\n")}\n  }}}}}`;
  return (
    <div className="grid gap-6">
      <Section><ColorField value={c} onChange={setC} /></Section>
      <Section title="Tailwind config"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{js}</pre><CopyButton value={js} className="mt-2" /></Section>
    </div>
  );
}

/* ===================== Color Wheel ===================== */

export function ColorWheel() {
  const HUES = 12;
  const colors = Array.from({ length: HUES }, (_, i) => toHex(`oklch(0.65 0.2 ${(i * 360) / HUES})`));
  const [picked, setPicked] = useState(colors[0]);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <Section>
        <div className="relative mx-auto h-72 w-72">
          {colors.map((c, i) => {
            const angle = (i * 360) / HUES;
            return (
              <button key={i} onClick={() => setPicked(c)}
                className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border"
                style={{ background: c, transform: `translate(-50%, -50%) rotate(${angle}deg) translate(110px) rotate(-${angle}deg)` }}
                title={c} />
            );
          })}
        </div>
      </Section>
      <Section title="Selected"><Swatch color={picked} size="lg" /></Section>
    </div>
  );
}
