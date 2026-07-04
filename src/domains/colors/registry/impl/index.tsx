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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CSS_NAMED_COLORS, CVD_TYPES, applyCVDToImageData, contrastRatio, darken,
  fileToImage, harmonyColors, imageFileToPixels, invertColor, isValidColor,
  kmeansPalette, lighten, mix, parseColor, randomHex, rgbToHex, saturate,
  shades, shiftHue, simulateCVD, tints, toCmyk, toHex, toHslObj, toHslString,
  toHwbObj, toLabObj, toLchObj, toOklchObj, toOklchString, toRgb255,
  toRgbString, tones, wcag,
} from "@/domains/colors/lib/color";

/* ======================= Helpers ======================= */

function Section({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>}
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

/* ======================= Converters ======================= */

export function ColorConverter() {
  const [c, setC] = useState("#3B82F6");
  const rgb = toRgb255(c);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
      <Section>
        <ColorField value={c} onChange={setC} />
        <div className="mt-4 h-32 rounded-lg border border-border" style={{ backgroundColor: c }} />
      </Section>
      <Section title="Formats">
        <Row label="HEX" value={toHex(c).toUpperCase()} />
        <Row label="RGB" value={toRgbString(c)} />
        <Row label="HSL" value={toHslString(c)} />
        <Row label="OKLCH" value={toOklchString(c)} />
        <Row label="HWB" value={`hwb(${toHwbObj(c).h} ${toHwbObj(c).w}% ${toHwbObj(c).b}%)`} />
        <Row label="LAB" value={`lab(${toLabObj(c).l} ${toLabObj(c).a} ${toLabObj(c).b})`} />
        <Row label="LCH" value={`lch(${toLchObj(c).l} ${toLchObj(c).c} ${toLchObj(c).h})`} />
        <Row label="CMYK" value={`cmyk(${toCmyk(c).c}%, ${toCmyk(c).m}%, ${toCmyk(c).y}%, ${toCmyk(c).k}%)`} />
        <Row label="Int" value={String((rgb.r << 16) + (rgb.g << 8) + rgb.b)} />
      </Section>
    </div>
  );
}

export const ColorInfo = ColorConverter;

export function NamedColors() {
  const [q, setQ] = useState("");
  const filtered = CSS_NAMED_COLORS.filter(([n]) => n.includes(q.toLowerCase()));
  return (
    <div>
      <Input placeholder="Search named colors…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-md" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {filtered.map(([name, hex]) => (
          <div key={name} className="overflow-hidden rounded-lg border border-border">
            <div className="h-16" style={{ backgroundColor: hex }} />
            <div className="bg-card px-2 py-1.5">
              <p className="truncate text-sm font-medium">{name}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{hex}</span>
                <CopyButton value={hex} label="" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RandomColor() {
  const [colors, setColors] = useState<string[]>(() => Array.from({ length: 10 }, randomHex));
  return (
    <div>
      <Button onClick={() => setColors(Array.from({ length: 10 }, randomHex))}>Generate again</Button>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {colors.map((c, i) => <Swatch key={i} color={c} />)}
      </div>
    </div>
  );
}

export function ColorFormatValidator() {
  const [v, setV] = useState("rgb(59, 130, 246)");
  const valid = isValidColor(v);
  return (
    <Section>
      <Label htmlFor="vfield">Color string</Label>
      <Input id="vfield" value={v} onChange={(e) => setV(e.target.value)} className="mt-2 font-mono" />
      <div className="mt-4 flex items-center gap-3">
        <div className={`rounded-md px-3 py-1.5 text-sm font-medium ${valid ? "bg-green-500/15 text-green-600" : "bg-destructive/15 text-destructive"}`}>
          {valid ? "Valid" : "Invalid"}
        </div>
        {valid && <div className="h-10 w-10 rounded-md border border-border" style={{ backgroundColor: v }} />}
        {valid && <span className="font-mono text-sm">{toHex(v).toUpperCase()}</span>}
      </div>
    </Section>
  );
}

/* ======================= Manipulation ======================= */

export function ColorMixer() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#EF4444");
  const [t, setT] = useState(50);
  const mixed = mix(a, b, t / 100);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField label="Color A" value={a} onChange={setA} />
        <div className="mt-4" />
        <ColorField label="Color B" value={b} onChange={setB} />
        <div className="mt-6">
          <Label>Mix ratio: {t}% B</Label>
          <Slider min={0} max={100} step={1} value={[t]} onValueChange={(v) => setT(v[0])} className="mt-2" />
        </div>
      </Section>
      <Section title="Result">
        <Swatch color={mixed} size="lg" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Swatch color={mix(a, b, 0.25)} label="25%" size="sm" />
          <Swatch color={mix(a, b, 0.5)} label="50%" size="sm" />
          <Swatch color={mix(a, b, 0.75)} label="75%" size="sm" />
        </div>
      </Section>
    </div>
  );
}

function variantList(c: string, fn: (c: string, i: number) => string, n: number) {
  return Array.from({ length: n }, (_, i) => fn(c, i));
}

function PaletteStrip({ colors }: { colors: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {colors.map((c, i) => <Swatch key={i} color={c} />)}
    </div>
  );
}

export function ShadesGenerator() {
  const [c, setC] = useState("#3B82F6");
  return <ManipPage c={c} setC={setC} colors={shades(c, 10)} />;
}
export function TintGenerator() {
  const [c, setC] = useState("#3B82F6");
  return <ManipPage c={c} setC={setC} colors={tints(c, 10)} />;
}
export function ToneGenerator() {
  const [c, setC] = useState("#3B82F6");
  return <ManipPage c={c} setC={setC} colors={tones(c, 10)} />;
}

function ManipPage({ c, setC, colors }: { c: string; setC: (v: string) => void; colors: string[] }) {
  return (
    <div className="grid gap-6">
      <Section><ColorField value={c} onChange={setC} /></Section>
      <PaletteStrip colors={colors} />
    </div>
  );
}

function SliderTool({ label, min, max, step, fn, defaultV = 20 }: { label: string; min: number; max: number; step: number; fn: (c: string, n: number) => string; defaultV?: number }) {
  const [c, setC] = useState("#3B82F6");
  const [n, setN] = useState(defaultV);
  const result = fn(c, n);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField value={c} onChange={setC} />
        <div className="mt-6">
          <Label>{label}: {n}{step < 1 ? "" : "%"}</Label>
          <Slider min={min} max={max} step={step} value={[n]} onValueChange={(v) => setN(v[0])} className="mt-2" />
        </div>
      </Section>
      <Section title="Result">
        <Swatch color={result} size="lg" />
      </Section>
    </div>
  );
}

export function LightenTool() { return <SliderTool label="Lighten" min={0} max={100} step={1} fn={(c, n) => lighten(c, n / 100)} />; }
export function DarkenTool() { return <SliderTool label="Darken" min={0} max={100} step={1} fn={(c, n) => darken(c, n / 100)} />; }
export function SaturationAdjuster() { return <SliderTool label="Saturation" min={-30} max={30} step={1} fn={(c, n) => saturate(c, n / 100)} defaultV={0} />; }
export function HueShift() { return <SliderTool label="Hue shift (deg)" min={-180} max={180} step={1} fn={(c, n) => shiftHue(c, n)} defaultV={30} />; }

export function OpacityCalculator() {
  const [bg, setBg] = useState("#FFFFFF");
  const [fg, setFg] = useState("#3B82F6");
  const [a, setA] = useState(50);
  const blended = mix(bg, fg, a / 100);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField label="Background" value={bg} onChange={setBg} />
        <div className="mt-4" />
        <ColorField label="Foreground" value={fg} onChange={setFg} />
        <div className="mt-6">
          <Label>Opacity: {a}%</Label>
          <Slider min={0} max={100} step={1} value={[a]} onValueChange={(v) => setA(v[0])} className="mt-2" />
        </div>
      </Section>
      <Section title="Blended result">
        <Swatch color={blended} label="Effective solid color" size="lg" />
        <p className="mt-3 text-sm text-muted-foreground">CSS:</p>
        <code className="mt-1 block rounded-md bg-muted p-3 font-mono text-xs">background: {toHex(fg).toUpperCase()}{Math.round((a / 100) * 255).toString(16).padStart(2, "0").toUpperCase()};</code>
      </Section>
    </div>
  );
}

export function ColorInverter() {
  const [c, setC] = useState("#3B82F6");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section><ColorField value={c} onChange={setC} /><div className="mt-4"><Swatch color={c} label="Original" /></div></Section>
      <Section title="Inverted"><Swatch color={invertColor(c)} size="lg" /></Section>
    </div>
  );
}

/* ======================= Image-based ======================= */

function useImageState() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return { file, setFile, url };
}

export function ColorReplacer() {
  const { file, setFile, url } = useImageState();
  const [target, setTarget] = useState("#FFFFFF");
  const [replace, setReplace] = useState("#3B82F6");
  const [tol, setTol] = useState(40);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file) return;
    fileToImage(file).then((img) => {
      const c = canvasRef.current!;
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const t = toRgb255(target);
      const r = toRgb255(replace);
      for (let i = 0; i < data.data.length; i += 4) {
        const d = data.data;
        if (Math.abs(d[i] - t.r) < tol && Math.abs(d[i + 1] - t.g) < tol && Math.abs(d[i + 2] - t.b) < tol) {
          d[i] = r.r; d[i + 1] = r.g; d[i + 2] = r.b;
        }
      }
      ctx.putImageData(data, 0, 0);
    });
  }, [file, target, replace, tol]);

  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <Section>
            <ColorField label="Target color" value={target} onChange={setTarget} />
            <div className="mt-3" />
            <ColorField label="Replace with" value={replace} onChange={setReplace} />
            <div className="mt-4"><Label>Tolerance: {tol}</Label><Slider min={0} max={200} value={[tol]} onValueChange={(v) => setTol(v[0])} className="mt-2" /></div>
            <Button onClick={() => setFile(null)} variant="outline" className="mt-4 w-full">Replace image</Button>
          </Section>
          <Section><canvas ref={canvasRef} className="max-w-full rounded-lg border border-border" /></Section>
        </div>
      )}
      {url && <img src={url} alt="" className="hidden" />}
    </div>
  );
}

export function ImageRecolor() {
  const { file, setFile } = useImageState();
  const [tint, setTint] = useState("#3B82F6");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!file) return;
    fileToImage(file).then((img) => {
      const c = canvasRef.current!;
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const t = toRgb255(tint);
      for (let i = 0; i < data.data.length; i += 4) {
        const lum = (0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2]) / 255;
        data.data[i] = t.r * lum;
        data.data[i + 1] = t.g * lum;
        data.data[i + 2] = t.b * lum;
      }
      ctx.putImageData(data, 0, 0);
    });
  }, [file, tint]);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <Section>
            <ColorField label="Tint color" value={tint} onChange={setTint} />
            <Button onClick={() => setFile(null)} variant="outline" className="mt-4 w-full">Replace image</Button>
          </Section>
          <Section><canvas ref={canvasRef} className="max-w-full rounded-lg border border-border" /></Section>
        </div>
      )}
    </div>
  );
}

/* ======================= Pickers ======================= */

export function ColorPicker() {
  const [c, setC] = useState("#3B82F6");
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("racira-recent") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    const next = [c, ...recent.filter((x) => x !== c)].slice(0, 12);
    setRecent(next);
    localStorage.setItem("racira-recent", JSON.stringify(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c]);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField value={c} onChange={setC} />
        <div className="mt-4 h-48 rounded-lg border border-border" style={{ backgroundColor: c }} />
      </Section>
      <Section title="Recent">
        <div className="grid grid-cols-6 gap-2">
          {recent.map((r, i) => (
            <button key={i} onClick={() => setC(r)} className="aspect-square rounded-md border border-border" style={{ backgroundColor: r }} title={r} />
          ))}
        </div>
      </Section>
    </div>
  );
}

export function ImageColorPicker() {
  const { file, setFile } = useImageState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [picked, setPicked] = useState<string>("#3B82F6");

  useEffect(() => {
    if (!file) return;
    fileToImage(file).then((img) => {
      const c = canvasRef.current!;
      const max = 800;
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      c.width = img.width * ratio; c.height = img.height * ratio;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    });
  }, [file]);

  function pick(e: React.MouseEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * c.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * c.height);
    const [r, g, b] = c.getContext("2d")!.getImageData(x, y, 1, 1).data;
    setPicked(rgbToHex(r, g, b));
  }

  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <Section>
            <canvas ref={canvasRef} onClick={pick} className="cursor-crosshair max-w-full rounded-lg border border-border" />
            <Button onClick={() => setFile(null)} variant="outline" className="mt-3">Replace image</Button>
          </Section>
          <Section title="Picked color"><Swatch color={picked} size="lg" /></Section>
        </div>
      )}
    </div>
  );
}

export function MultiColorPicker() {
  const [items, setItems] = useState<string[]>([]);
  const [c, setC] = useState("#3B82F6");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField value={c} onChange={setC} />
        <Button onClick={() => setItems([...items, c])} className="mt-4">Add to palette</Button>
      </Section>
      <Section title={`Palette (${items.length})`}>
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No colors yet.</p> : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((x, i) => (
              <div key={i} className="relative">
                <Swatch color={x} size="sm" />
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-md bg-background/80 px-1.5 text-xs">×</button>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <CopyButton value={items.map((x) => x.toUpperCase()).join(", ")} label="Copy all" className="mt-3" />
        )}
      </Section>
    </div>
  );
}

export const PixelColorPicker = ImageColorPicker;

/* ======================= Harmonies ======================= */

export function PaletteGenerator() {
  const [c, setC] = useState("#3B82F6");
  const [kind, setKind] = useState<string>("analogous");
  const colors = harmonyColors(c, kind);
  return (
    <div className="grid gap-6">
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <ColorField value={c} onChange={setC} />
          <div>
            <Label>Harmony</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="complementary">Complementary</SelectItem>
                <SelectItem value="analogous">Analogous</SelectItem>
                <SelectItem value="triadic">Triadic</SelectItem>
                <SelectItem value="tetradic">Tetradic</SelectItem>
                <SelectItem value="split">Split-complementary</SelectItem>
                <SelectItem value="mono">Monochromatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>
      <PaletteStrip colors={colors} />
    </div>
  );
}

export function makeHarmony(kind: string) {
  return function HarmonyTool() {
    const [c, setC] = useState("#3B82F6");
    const colors = harmonyColors(c, kind);
    return (
      <div className="grid gap-6">
        <Section><ColorField value={c} onChange={setC} /></Section>
        <PaletteStrip colors={colors} />
      </div>
    );
  };
}

/* ======================= Gradients ======================= */

interface Stop { color: string; pos: number }

function gradientCSS(kind: string, angle: number, stops: Stop[]) {
  const stopStr = stops.map((s) => `${s.color} ${s.pos}%`).join(", ");
  if (kind === "linear") return `linear-gradient(${angle}deg, ${stopStr})`;
  if (kind === "radial") return `radial-gradient(circle, ${stopStr})`;
  if (kind === "conic") return `conic-gradient(from ${angle}deg, ${stopStr})`;
  return `linear-gradient(${angle}deg, ${stopStr})`;
}

function GradientBuilder({ kind, initialAngle = 90, initialStops }: { kind: "linear" | "radial" | "conic" | "multi"; initialAngle?: number; initialStops?: Stop[] }) {
  const [angle, setAngle] = useState(initialAngle);
  const [stops, setStops] = useState<Stop[]>(initialStops ?? [
    { color: "#3B82F6", pos: 0 }, { color: "#EF4444", pos: 100 },
  ]);
  const css = gradientCSS(kind === "multi" ? "linear" : kind, angle, stops);

  return (
    <div className="grid gap-6">
      <div className="h-64 rounded-xl border border-border" style={{ background: css }} />
      <Section title="Stops">
        <div className="grid gap-3">
          {stops.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-end">
              <ColorField value={s.color} onChange={(v) => { const n = [...stops]; n[i] = { ...n[i], color: v }; setStops(n); }} label={`Stop ${i + 1}`} />
              <div>
                <Label>Position: {s.pos}%</Label>
                <Slider min={0} max={100} value={[s.pos]} onValueChange={(v) => { const n = [...stops]; n[i] = { ...n[i], pos: v[0] }; setStops(n); }} className="mt-2" />
              </div>
              {stops.length > 2 && <Button variant="outline" size="sm" onClick={() => setStops(stops.filter((_, j) => j !== i))}>Remove</Button>}
            </div>
          ))}
          <Button variant="outline" onClick={() => setStops([...stops, { color: randomHex(), pos: 50 }])}>Add stop</Button>
        </div>
      </Section>
      {kind !== "radial" && (
        <Section title="Angle">
          <Label>{angle}°</Label>
          <Slider min={0} max={360} value={[angle]} onValueChange={(v) => setAngle(v[0])} className="mt-2" />
        </Section>
      )}
      <Section title="CSS">
        <code className="block rounded-md bg-muted p-3 font-mono text-xs break-all">background: {css};</code>
        <CopyButton value={`background: ${css};`} className="mt-2" />
      </Section>
    </div>
  );
}

export function GradientGenerator() { return <GradientBuilder kind="linear" />; }
export function makeGradient(kind: "linear" | "radial" | "conic" | "multi") {
  return function GradientVariant() {
    const initial = kind === "multi"
      ? [{ color: "#3B82F6", pos: 0 }, { color: "#A855F7", pos: 50 }, { color: "#EF4444", pos: 100 }]
      : undefined;
    return <GradientBuilder kind={kind} initialStops={initial} />;
  };
}

export function GradientPreviewer() {
  const [css, setCss] = useState("linear-gradient(90deg, #3B82F6 0%, #EF4444 100%)");
  return (
    <div className="grid gap-6">
      <Section>
        <Label htmlFor="gcss">CSS gradient value</Label>
        <Textarea id="gcss" value={css} onChange={(e) => setCss(e.target.value)} className="mt-2 font-mono" rows={3} />
      </Section>
      <div className="h-64 rounded-xl border border-border" style={{ background: css }} />
    </div>
  );
}

export function CSSGradientExporter() {
  return <GradientBuilder kind="linear" />;
}

export function GradientAngleCalc() {
  const [angle, setAngle] = useState(90);
  const directionMap: Record<number, string> = {
    0: "to top", 45: "to top right", 90: "to right", 135: "to bottom right",
    180: "to bottom", 225: "to bottom left", 270: "to left", 315: "to top left",
  };
  const nearest = Object.keys(directionMap).map(Number).reduce((a, b) => Math.abs(b - angle) < Math.abs(a - angle) ? b : a);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <Label>Angle: {angle}°</Label>
        <Slider min={0} max={360} value={[angle]} onValueChange={(v) => setAngle(v[0])} className="mt-2" />
        <div className="mt-6 relative mx-auto h-48 w-48 rounded-full border border-border">
          <div className="absolute left-1/2 top-1/2 h-1 w-24 origin-left bg-primary" style={{ transform: `translateY(-50%) rotate(${angle - 90}deg)` }} />
        </div>
      </Section>
      <Section title="Equivalents">
        <Row label="degrees" value={`${angle}deg`} />
        <Row label="turn" value={`${(angle / 360).toFixed(3)}turn`} />
        <Row label="rad" value={`${((angle * Math.PI) / 180).toFixed(3)}rad`} />
        <Row label="nearest keyword" value={directionMap[nearest]} />
      </Section>
    </div>
  );
}

/* ======================= Accessibility ======================= */

export function ContrastChecker() {
  const [fg, setFg] = useState("#FFFFFF");
  const [bg, setBg] = useState("#3B82F6");
  const r = wcag(fg, bg);
  const Badge = ({ pass, label }: { pass: boolean; label: string }) => (
    <div className={`flex items-center justify-between rounded-md px-3 py-2 ${pass ? "bg-green-500/15 text-green-600" : "bg-destructive/15 text-destructive"}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-bold">{pass ? "Pass" : "Fail"}</span>
    </div>
  );
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section>
        <ColorField label="Text" value={fg} onChange={setFg} />
        <div className="mt-3" />
        <ColorField label="Background" value={bg} onChange={setBg} />
        <div className="mt-6 rounded-lg p-8 text-center" style={{ backgroundColor: bg, color: fg }}>
          <p className="text-3xl font-bold">Large heading</p>
          <p className="mt-2 text-sm">Smaller body text for preview.</p>
        </div>
      </Section>
      <Section title={`Contrast ratio: ${r.ratio}:1`}>
        <div className="grid gap-2">
          <Badge pass={r.aa_normal} label="WCAG AA — Normal text" />
          <Badge pass={r.aa_large} label="WCAG AA — Large text" />
          <Badge pass={r.aaa_normal} label="WCAG AAA — Normal text" />
          <Badge pass={r.aaa_large} label="WCAG AAA — Large text" />
        </div>
      </Section>
    </div>
  );
}

export function AccessiblePairFinder() {
  const [base, setBase] = useState("#3B82F6");
  const candidates = useMemo(() => {
    const list: Array<{ color: string; ratio: number }> = [];
    for (let l = 0; l <= 1; l += 0.05) {
      const c = toHex(`oklch(${l} 0 0)`);
      list.push({ color: c, ratio: contrastRatio(c, base) });
    }
    return list.filter((x) => x.ratio >= 4.5).sort((a, b) => b.ratio - a.ratio);
  }, [base]);
  return (
    <div className="grid gap-6">
      <Section><ColorField label="Base color" value={base} onChange={setBase} /></Section>
      <Section title="Accessible neutrals (AA contrast)">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {candidates.slice(0, 8).map((x, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-center p-6 text-lg font-semibold" style={{ background: base, color: x.color }}>Aa</div>
              <div className="px-3 py-2">
                <p className="font-mono text-xs uppercase">{x.color}</p>
                <p className="text-xs text-muted-foreground">{x.ratio}:1</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function ReadabilityChecker() {
  const [fg, setFg] = useState("#0F172A");
  const [bg, setBg] = useState("#FFFFFF");
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  return (
    <div className="grid gap-6">
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <ColorField label="Text" value={fg} onChange={setFg} />
          <ColorField label="Background" value={bg} onChange={setBg} />
        </div>
        <div className="mt-4">
          <Label htmlFor="t">Preview text</Label>
          <Input id="t" value={text} onChange={(e) => setText(e.target.value)} className="mt-2" />
        </div>
      </Section>
      <div className="rounded-xl p-6" style={{ backgroundColor: bg, color: fg }}>
        {[12, 14, 16, 20, 28, 40].map((s) => (
          <p key={s} style={{ fontSize: s }} className="mb-2">{s}px — {text}</p>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Contrast ratio: <span className="font-mono">{contrastRatio(fg, bg)}:1</span></p>
    </div>
  );
}

export function ColorBlindnessSim() {
  const [c, setC] = useState("#3B82F6");
  return (
    <div className="grid gap-6">
      <Section><ColorField value={c} onChange={setC} /></Section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <Swatch color={c} label="Normal" />
        {CVD_TYPES.map((t) => <Swatch key={t} color={simulateCVD(c, t)} label={t} />)}
      </div>
      <CVDImage />
    </div>
  );
}

function CVDImage() {
  const { file, setFile } = useImageState();
  const [type, setType] = useState<string>("deuteranopia");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!file) return;
    fileToImage(file).then((img) => {
      const c = canvasRef.current!;
      const max = 800;
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      c.width = img.width * ratio; c.height = img.height * ratio;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      applyCVDToImageData(data, type as any);
      ctx.putImageData(data, 0, 0);
    });
  }, [file, type]);
  return (
    <Section title="Image simulation">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{CVD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFile(null)}>Replace image</Button>
          </div>
          <canvas ref={canvasRef} className="max-w-full rounded-lg border border-border" />
        </div>
      )}
    </Section>
  );
}

export function DuotoneGenerator() {
  const { file, setFile } = useImageState();
  const [a, setA] = useState("#0F172A");
  const [b, setB] = useState("#3B82F6");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!file) return;
    fileToImage(file).then((img) => {
      const c = canvasRef.current!;
      const max = 800;
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      c.width = img.width * ratio; c.height = img.height * ratio;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      const ca = toRgb255(a), cb = toRgb255(b);
      for (let i = 0; i < data.data.length; i += 4) {
        const lum = (0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2]) / 255;
        data.data[i] = ca.r + (cb.r - ca.r) * lum;
        data.data[i + 1] = ca.g + (cb.g - ca.g) * lum;
        data.data[i + 2] = ca.b + (cb.b - ca.b) * lum;
      }
      ctx.putImageData(data, 0, 0);
    });
  }, [file, a, b]);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <Section>
            <ColorField label="Shadow" value={a} onChange={setA} />
            <div className="mt-3" /><ColorField label="Highlight" value={b} onChange={setB} />
            <Button variant="outline" onClick={() => setFile(null)} className="mt-4 w-full">Replace image</Button>
          </Section>
          <Section><canvas ref={canvasRef} className="max-w-full rounded-lg border border-border" /></Section>
        </div>
      )}
    </div>
  );
}

/* ======================= Image color extraction ======================= */

function useImagePalette(file: File | null, k: number) {
  const [palette, setPalette] = useState<string[]>([]);
  useEffect(() => {
    if (!file) { setPalette([]); return; }
    imageFileToPixels(file, 80).then(({ pixels }) => {
      const centers = kmeansPalette(pixels, k);
      setPalette(centers.map(([r, g, b]) => rgbToHex(r, g, b)));
    });
  }, [file, k]);
  return palette;
}

export function ExtractColors() {
  const { file, setFile, url } = useImageState();
  const [k, setK] = useState(8);
  const palette = useImagePalette(file, k);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            <Section>
              {url && <img src={url} alt="" className="rounded-lg border border-border max-h-64 mx-auto" />}
              <div className="mt-4"><Label>Colors: {k}</Label><Slider min={2} max={16} value={[k]} onValueChange={(v) => setK(v[0])} className="mt-2" /></div>
              <Button variant="outline" onClick={() => setFile(null)} className="mt-3 w-full">Replace image</Button>
            </Section>
            <Section title="Extracted palette">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {palette.map((c, i) => <Swatch key={i} color={c} size="sm" />)}
              </div>
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

export function PaletteFromImage() { return <ExtractColors />; }

export function GradientFromImage() {
  const { file, setFile } = useImageState();
  const palette = useImagePalette(file, 5);
  const css = palette.length ? `linear-gradient(90deg, ${palette.map((c, i) => `${c} ${(i / (palette.length - 1)) * 100}%`).join(", ")})` : "";
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          <div className="h-48 rounded-xl border border-border" style={{ background: css }} />
          <Section title="CSS"><code className="block break-all rounded-md bg-muted p-3 font-mono text-xs">background: {css};</code><CopyButton value={`background: ${css};`} className="mt-2" /></Section>
          <Button variant="outline" onClick={() => setFile(null)}>Replace image</Button>
        </>
      )}
    </div>
  );
}

export function ImageTheme() {
  const { file, setFile } = useImageState();
  const palette = useImagePalette(file, 6);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {palette.length >= 6 && (
              <>
                <Swatch color={palette[0]} label="background" />
                <Swatch color={palette[1]} label="surface" />
                <Swatch color={palette[2]} label="primary" />
                <Swatch color={palette[3]} label="secondary" />
                <Swatch color={palette[4]} label="accent" />
                <Swatch color={palette[5]} label="foreground" />
              </>
            )}
          </div>
          <Button variant="outline" onClick={() => setFile(null)}>Replace image</Button>
        </>
      )}
    </div>
  );
}

export function ColorHistogram() {
  const { file, setFile } = useImageState();
  const [data, setData] = useState<{ r: number[]; g: number[]; b: number[] }>({ r: [], g: [], b: [] });
  useEffect(() => {
    if (!file) return;
    imageFileToPixels(file, 200).then(({ pixels }) => {
      const r = new Array(256).fill(0), g = new Array(256).fill(0), b = new Array(256).fill(0);
      for (const [pr, pg, pb] of pixels) { r[pr]++; g[pg]++; b[pb]++; }
      setData({ r, g, b });
    });
  }, [file]);
  const max = Math.max(...data.r, ...data.g, ...data.b, 1);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          {(["r", "g", "b"] as const).map((k) => (
            <Section key={k} title={`${k.toUpperCase()} channel`}>
              <svg viewBox="0 0 256 80" className="w-full h-24">
                {data[k].map((v, i) => (
                  <rect key={i} x={i} y={80 - (v / max) * 80} width={1} height={(v / max) * 80}
                    fill={k === "r" ? "#ef4444" : k === "g" ? "#22c55e" : "#3b82f6"} />
                ))}
              </svg>
            </Section>
          ))}
          <Button variant="outline" onClick={() => setFile(null)}>Replace image</Button>
        </>
      )}
    </div>
  );
}

export function DominantColor() {
  const { file, setFile } = useImageState();
  const palette = useImagePalette(file, 1);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          {palette[0] && <Swatch color={palette[0]} label="Dominant" size="lg" />}
          <Button variant="outline" onClick={() => setFile(null)}>Replace image</Button>
        </>
      )}
    </div>
  );
}

export function AverageColor() {
  const { file, setFile } = useImageState();
  const [avg, setAvg] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setAvg(null); return; }
    imageFileToPixels(file, 150).then(({ pixels }) => {
      const s = pixels.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
      setAvg(rgbToHex(s[0] / pixels.length, s[1] / pixels.length, s[2] / pixels.length));
    });
  }, [file]);
  return (
    <div className="grid gap-6">
      {!file ? <ImageDropzone onFile={setFile} /> : (
        <>
          {avg && <Swatch color={avg} label="Average" size="lg" />}
          <Button variant="outline" onClick={() => setFile(null)}>Replace image</Button>
        </>
      )}
    </div>
  );
}
