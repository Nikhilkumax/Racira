"use client";
import { useEffect, useMemo, useState } from "react";
import { ColorField } from "@/components/colors/color-field";
import { Swatch } from "@/components/colors/swatch";
import { CopyButton } from "@/components/colors/copy-button";
import { ImageDropzone } from "@/components/colors/image-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  contrastRatio, darken, lighten, mix, randomHex, rgbToHex, toHex, toHslObj,
  toHslString, toOklchObj, toOklchString, toRgb255, toRgbString, toCmyk,
} from "@/lib/colors/color";

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>}
      {children}
    </div>
  );
}

/* ===================== Themed palette generator ===================== */

function buildPalette(hues: number[], lRange: [number, number] = [0.5, 0.75], cRange: [number, number] = [0.1, 0.2]) {
  return hues.map((h, i) => {
    const l = lRange[0] + ((lRange[1] - lRange[0]) * (i / Math.max(1, hues.length - 1)));
    const c = cRange[0] + ((cRange[1] - cRange[0]) * Math.random());
    return toHex(`oklch(${l} ${c} ${h})`);
  });
}

export function makeThemedPalette(presets: Record<string, { hues: number[]; l?: [number, number]; c?: [number, number] }>) {
  return function ThemedPalette() {
    const keys = Object.keys(presets);
    const [k, setK] = useState(keys[0]);
    const [seed, setSeed] = useState(0);
    const p = presets[k];
    const colors = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = seed;
      return buildPalette(p.hues, p.l, p.c);
    }, [k, seed, p]);
    return (
      <div className="grid gap-6">
        <Card>
          <div className="flex flex-wrap items-end gap-3">
            {keys.length > 1 && (
              <div>
                <Label>Preset</Label>
                <Select value={k} onValueChange={setK}>
                  <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>{keys.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={() => setSeed((s) => s + 1)}>Regenerate</Button>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {colors.map((c, i) => <Swatch key={i} color={c} />)}
        </div>
        <Card title="CSS">
          <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{colors.map((c, i) => `--color-${i + 1}: ${c.toUpperCase()};`).join("\n")}</pre>
          <CopyButton value={colors.map((c, i) => `--color-${i + 1}: ${c.toUpperCase()};`).join("\n")} className="mt-2" />
        </Card>
      </div>
    );
  };
}

/* ===================== Single-color generator with style ===================== */

export function makeStyledColor(style: "warm" | "cool" | "muted" | "vibrant") {
  return function StyledColor() {
    const ranges: Record<typeof style, { h: [number, number]; l: [number, number]; c: [number, number] }> = {
      warm: { h: [-20, 80], l: [0.55, 0.75], c: [0.12, 0.2] },
      cool: { h: [180, 280], l: [0.5, 0.75], c: [0.1, 0.2] },
      muted: { h: [0, 360], l: [0.4, 0.7], c: [0.03, 0.07] },
      vibrant: { h: [0, 360], l: [0.6, 0.75], c: [0.22, 0.32] },
    };
    const r = ranges[style];
    const [seed, setSeed] = useState(0);
    const colors = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = seed;
      return Array.from({ length: 5 }, () => {
        const h = r.h[0] + Math.random() * (r.h[1] - r.h[0]);
        const l = r.l[0] + Math.random() * (r.l[1] - r.l[0]);
        const cc = r.c[0] + Math.random() * (r.c[1] - r.c[0]);
        return toHex(`oklch(${l} ${cc} ${(h + 360) % 360})`);
      });
    }, [seed]);
    return (
      <div className="grid gap-6">
        <Button onClick={() => setSeed((s) => s + 1)}>Generate {style} palette</Button>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {colors.map((c, i) => <Swatch key={i} color={c} />)}
        </div>
      </div>
    );
  };
}

/* ===================== Image filter adjuster ===================== */

export function makeImageFilter(filter: "grayscale" | "sepia" | "brightness" | "contrast" | "hue-rotate") {
  return function ImageFilter() {
    const [file, setFile] = useState<File | null>(null);
    const [v, setV] = useState(filter === "brightness" || filter === "contrast" ? 100 : filter === "hue-rotate" ? 0 : 100);
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
      if (!file) { setUrl(null); return; }
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }, [file]);
    const unit = filter === "hue-rotate" ? "deg" : "%";
    const css = `filter: ${filter}(${v}${unit});`;
    const max = filter === "hue-rotate" ? 360 : filter === "brightness" || filter === "contrast" ? 200 : 100;
    return (
      <div className="grid gap-6">
        {!file ? <ImageDropzone onFile={setFile} /> : (
          <>
            <Card>
              <Label>{filter}: {v}{unit}</Label>
              <Slider min={0} max={max} value={[v]} onValueChange={(x) => setV(x[0])} className="mt-2" />
              <Button variant="outline" onClick={() => setFile(null)} className="mt-4">Replace image</Button>
            </Card>
            <div className="overflow-hidden rounded-lg border border-border">
              {url && <img src={url} alt="" className="w-full" style={{ filter: `${filter}(${v}${unit})` }} />}
            </div>
            <Card title="CSS">
              <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre>
              <CopyButton value={css} className="mt-2" />
            </Card>
          </>
        )}
      </div>
    );
  };
}

/* ===================== Plain color filter (no image) ===================== */

export function makeColorFilter(mode: "grayscale" | "sepia" | "brightness" | "contrast") {
  return function ColorFilterTool() {
    const [c, setC] = useState("#3B82F6");
    const [v, setV] = useState(100);
    function apply(hex: string, m: typeof mode, val: number) {
      const r = toRgb255(hex);
      if (m === "grayscale") {
        const g = Math.round((r.r + r.g + r.b) / 3);
        const t = val / 100;
        return rgbToHex(Math.round(r.r * (1 - t) + g * t), Math.round(r.g * (1 - t) + g * t), Math.round(r.b * (1 - t) + g * t));
      }
      if (m === "sepia") {
        const t = val / 100;
        const nr = 0.393 * r.r + 0.769 * r.g + 0.189 * r.b;
        const ng = 0.349 * r.r + 0.686 * r.g + 0.168 * r.b;
        const nb = 0.272 * r.r + 0.534 * r.g + 0.131 * r.b;
        return rgbToHex(
          Math.round(Math.min(255, r.r * (1 - t) + nr * t)),
          Math.round(Math.min(255, r.g * (1 - t) + ng * t)),
          Math.round(Math.min(255, r.b * (1 - t) + nb * t)),
        );
      }
      if (m === "brightness") return val >= 100 ? lighten(hex, (val - 100) / 200) : darken(hex, (100 - val) / 200);
      // contrast: pull away or toward mid-gray
      const t = (val - 100) / 100;
      return rgbToHex(
        Math.max(0, Math.min(255, Math.round(128 + (r.r - 128) * (1 + t)))),
        Math.max(0, Math.min(255, Math.round(128 + (r.g - 128) * (1 + t)))),
        Math.max(0, Math.min(255, Math.round(128 + (r.b - 128) * (1 + t)))),
      );
    }
    const out = apply(c, mode, v);
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <ColorField value={c} onChange={setC} />
          <div className="mt-4"><Label>{mode}: {v}%</Label>
            <Slider min={0} max={200} value={[v]} onValueChange={(x) => setV(x[0])} className="mt-2" />
          </div>
        </Card>
        <Card title="Result">
          <Swatch color={out} size="lg" />
        </Card>
      </div>
    );
  };
}

/* ===================== Two-color blend ===================== */

export function ColorBlender() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#EF4444");
  const [t, setT] = useState(50);
  const out = mix(a, b, t / 100);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <ColorField label="Color A" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="Color B" value={b} onChange={setB} />
        <div className="mt-4"><Label>Mix: {t}%</Label>
          <Slider min={0} max={100} value={[t]} onValueChange={(v) => setT(v[0])} className="mt-2" />
        </div>
      </Card>
      <Card title="Result"><Swatch color={out} size="lg" /></Card>
    </div>
  );
}

/* ===================== Scale generator (value / chroma / hue) ===================== */

export function makeScale(axis: "value" | "chroma" | "hue") {
  return function ScaleTool() {
    const [c, setC] = useState("#3B82F6");
    const o = toOklchObj(c);
    const steps = 11;
    const colors = Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1);
      if (axis === "value") return toHex(`oklch(${0.15 + t * 0.8} ${o.c} ${o.h})`);
      if (axis === "chroma") return toHex(`oklch(${o.l} ${t * 0.35} ${o.h})`);
      return toHex(`oklch(${o.l} ${o.c} ${Math.round(t * 360)})`);
    });
    return (
      <div className="grid gap-6">
        <Card><ColorField value={c} onChange={setC} /></Card>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-11">
          {colors.map((cc, i) => <Swatch key={i} color={cc} label={String(i)} />)}
        </div>
      </div>
    );
  };
}

/* ===================== Additive / Subtractive mixers ===================== */

export function AdditiveMixer() {
  const [a, setA] = useState("#FF0000");
  const [b, setB] = useState("#00FF00");
  const ra = toRgb255(a), rb = toRgb255(b);
  const out = rgbToHex(Math.min(255, ra.r + rb.r), Math.min(255, ra.g + rb.g), Math.min(255, ra.b + rb.b));
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card><ColorField label="Light A" value={a} onChange={setA} /></Card>
      <Card><ColorField label="Light B" value={b} onChange={setB} /></Card>
      <Card title="Sum (RGB)"><Swatch color={out} size="lg" /></Card>
    </div>
  );
}

export function SubtractiveMixer() {
  const [a, setA] = useState("#00FFFF");
  const [b, setB] = useState("#FFFF00");
  const ra = toRgb255(a), rb = toRgb255(b);
  const out = rgbToHex(Math.round((ra.r * rb.r) / 255), Math.round((ra.g * rb.g) / 255), Math.round((ra.b * rb.b) / 255));
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card><ColorField label="Pigment A" value={a} onChange={setA} /></Card>
      <Card><ColorField label="Pigment B" value={b} onChange={setB} /></Card>
      <Card title="Mixed (subtractive)"><Swatch color={out} size="lg" /></Card>
    </div>
  );
}

/* ===================== Channel slider tool ===================== */

export function RGBChannelMixer() {
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const hex = rgbToHex(r, g, b);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <Label>R: {r}</Label><Slider min={0} max={255} value={[r]} onValueChange={(v) => setR(v[0])} className="mt-2" />
        <Label className="mt-4">G: {g}</Label><Slider min={0} max={255} value={[g]} onValueChange={(v) => setG(v[0])} className="mt-2" />
        <Label className="mt-4">B: {b}</Label><Slider min={0} max={255} value={[b]} onValueChange={(v) => setB(v[0])} className="mt-2" />
      </Card>
      <Card title="Result"><Swatch color={hex} size="lg" /></Card>
    </div>
  );
}

export function CMYKChannelMixer() {
  const [c, setC] = useState(70);
  const [m, setM] = useState(40);
  const [y, setY] = useState(0);
  const [k, setK] = useState(0);
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        {([["C", c, setC], ["M", m, setM], ["Y", y, setY], ["K", k, setK]] as const).map(([n, val, set]) => (
          <div key={n} className="mt-2">
            <Label>{n}: {val}%</Label>
            <Slider min={0} max={100} value={[val as number]} onValueChange={(v) => (set as any)(v[0])} className="mt-2" />
          </div>
        ))}
      </Card>
      <Card title="Result"><Swatch color={rgbToHex(r, g, b)} size="lg" /></Card>
    </div>
  );
}

/* ===================== Color relationship explorer ===================== */

export function RelationshipExplorer() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const rels: Array<[string, number[]]> = [
    ["Complementary", [180]],
    ["Analogous", [-30, 30]],
    ["Triadic", [120, 240]],
    ["Tetradic", [90, 180, 270]],
    ["Split Complementary", [150, 210]],
  ];
  return (
    <div className="grid gap-6">
      <Card><ColorField value={c} onChange={setC} /></Card>
      {rels.map(([name, offs]) => (
        <Card key={name} title={name}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Swatch color={c} label="Base" />
            {offs.map((d) => <Swatch key={d} color={toHex(`oklch(${o.l} ${o.c} ${(o.h + d + 360) % 360})`)} />)}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ===================== Warm vs cool / weight / saturation explorers ===================== */

export function WarmCoolAnalyzer() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const warm = (o.h >= 0 && o.h <= 70) || o.h >= 320;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /><div className="mt-3"><Swatch color={c} size="lg" /></div></Card>
      <Card title="Temperature">
        <p className="text-3xl font-bold">{warm ? "Warm" : "Cool"}</p>
        <p className="mt-2 text-sm text-muted-foreground">Hue {Math.round(o.h)}° — {warm ? "reds, oranges, yellows" : "blues, greens, purples"}</p>
      </Card>
    </div>
  );
}

export function SaturationExplorer() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const steps = Array.from({ length: 9 }, (_, i) => toHex(`oklch(${o.l} ${(i / 8) * 0.35} ${o.h})`));
  return (
    <div className="grid gap-6">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
        {steps.map((cc, i) => <Swatch key={i} color={cc} label={`${Math.round((i / 8) * 100)}%`} />)}
      </div>
    </div>
  );
}

export function BrightnessExplorer() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const steps = Array.from({ length: 9 }, (_, i) => toHex(`oklch(${0.15 + (i / 8) * 0.8} ${o.c} ${o.h})`));
  return (
    <div className="grid gap-6">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
        {steps.map((cc, i) => <Swatch key={i} color={cc} label={`${Math.round(15 + (i / 8) * 80)}%`} />)}
      </div>
    </div>
  );
}

/* ===================== Color psychology / meanings ===================== */

const PSYCH: Array<{ hue: [number, number]; name: string; meaning: string }> = [
  { hue: [0, 20], name: "Red", meaning: "Energy, passion, urgency" },
  { hue: [20, 50], name: "Orange", meaning: "Friendliness, confidence, warmth" },
  { hue: [50, 70], name: "Yellow", meaning: "Optimism, clarity, attention" },
  { hue: [70, 170], name: "Green", meaning: "Growth, health, balance" },
  { hue: [170, 250], name: "Blue", meaning: "Trust, calm, stability" },
  { hue: [250, 290], name: "Purple", meaning: "Creativity, luxury, wisdom" },
  { hue: [290, 340], name: "Magenta", meaning: "Imagination, bold, playful" },
  { hue: [340, 361], name: "Red", meaning: "Energy, passion, urgency" },
];
function meaningFor(hex: string) {
  const h = toOklchObj(hex).h;
  return PSYCH.find((p) => h >= p.hue[0] && h < p.hue[1]) || PSYCH[0];
}
export function ColorPsychology() {
  const [c, setC] = useState("#3B82F6");
  const m = meaningFor(c);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /><div className="mt-3"><Swatch color={c} size="lg" /></div></Card>
      <Card title={m.name}>
        <p className="text-base">{m.meaning}</p>
      </Card>
    </div>
  );
}

/* ===================== Quiz / mood / zodiac / birth-month / personality ===================== */

function PaletteFromHash({ input, label }: { input: string; label: string }) {
  const colors = useMemo(() => {
    let h = 0;
    for (let i = 0; i < input.length; i++) h = (h * 33 + input.charCodeAt(i)) % 360;
    return Array.from({ length: 5 }, (_, i) => toHex(`oklch(${0.55 + (i % 3) * 0.1} 0.14 ${(h + i * 47) % 360})`));
  }, [input]);
  return (
    <Card title={`${label} palette`}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{colors.map((c, i) => <Swatch key={i} color={c} />)}</div>
    </Card>
  );
}

export function MoodColorGenerator() {
  const moods = ["Calm", "Energetic", "Romantic", "Mysterious", "Cheerful", "Melancholy", "Focused", "Playful"];
  const [m, setM] = useState(moods[0]);
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Mood</Label>
        <Select value={m} onValueChange={setM}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{moods.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      </Card>
      <PaletteFromHash input={m} label={m} />
    </div>
  );
}

export function EmotionColorFinder() {
  const emotions = ["Joy", "Sadness", "Anger", "Trust", "Fear", "Surprise", "Anticipation", "Disgust"];
  const [e, setE] = useState(emotions[0]);
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Emotion</Label>
        <Select value={e} onValueChange={setE}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{emotions.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      </Card>
      <PaletteFromHash input={e} label={e} />
    </div>
  );
}

const ZODIAC = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export function ZodiacColor() {
  const [z, setZ] = useState(ZODIAC[0]);
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Zodiac sign</Label>
        <Select value={z} onValueChange={setZ}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{ZODIAC.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      </Card>
      <PaletteFromHash input={z} label={z} />
    </div>
  );
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export function BirthMonthColor() {
  const [m, setM] = useState(MONTHS[0]);
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Birth month</Label>
        <Select value={m} onValueChange={setM}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{MONTHS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
        </Select>
      </Card>
      <PaletteFromHash input={m} label={m} />
    </div>
  );
}

export function PersonalityQuiz() {
  const [a, setA] = useState("introvert");
  const [b, setB] = useState("logical");
  const [c, setC] = useState("calm");
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Are you more…</Label>
        <Select value={a} onValueChange={setA}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="introvert">Introvert</SelectItem><SelectItem value="extrovert">Extrovert</SelectItem></SelectContent>
        </Select>
        <Label className="mt-4">You decide with…</Label>
        <Select value={b} onValueChange={setB}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="logical">Logic</SelectItem><SelectItem value="emotional">Emotion</SelectItem></SelectContent>
        </Select>
        <Label className="mt-4">Your default mood is…</Label>
        <Select value={c} onValueChange={setC}>
          <SelectTrigger className="mt-2 w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="calm">Calm</SelectItem><SelectItem value="energetic">Energetic</SelectItem></SelectContent>
        </Select>
      </Card>
      <PaletteFromHash input={`${a}-${b}-${c}`} label="Your" />
    </div>
  );
}

export function LuckyNumberColor() {
  const [n, setN] = useState("7");
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Lucky number</Label>
        <Input value={n} onChange={(e) => setN(e.target.value)} className="mt-2 max-w-xs" />
      </Card>
      <PaletteFromHash input={`number-${n}`} label={`Number ${n}`} />
    </div>
  );
}

/* ===================== Naming generators ===================== */

const ADJ = ["Royal", "Mystic", "Velvet", "Electric", "Faded", "Golden", "Frozen", "Burning", "Hidden", "Lush", "Quiet", "Bold", "Sacred", "Wild"];
const NOUN = ["Mist", "Ember", "Tide", "Amethyst", "Dawn", "Storm", "Ocean", "Sunset", "Forest", "Comet", "Bloom", "Whisper", "Aurora", "Quartz"];
function pick<T>(a: T[], seed: number) { return a[seed % a.length]; }

export function makeNameGenerator(label: string, prefix?: string) {
  return function NameGen() {
    const [c, setC] = useState("#3B82F6");
    const [seed, setSeed] = useState(0);
    const o = toOklchObj(c);
    const baseSeed = Math.floor(o.h + o.l * 100 + seed * 7);
    const name = `${prefix ? prefix + " " : ""}${pick(ADJ, baseSeed)} ${pick(NOUN, baseSeed * 3 + 1)}`;
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <ColorField value={c} onChange={setC} />
          <Button variant="outline" onClick={() => setSeed((s) => s + 1)} className="mt-4">Roll new name</Button>
        </Card>
        <Card title={label}>
          <Swatch color={c} size="lg" />
          <p className="mt-3 text-2xl font-semibold">{name}</p>
        </Card>
      </div>
    );
  };
}

/* ===================== Palette editor + actions (mix/shuffle/sort/export/import/compare/balance/access) ===================== */

function usePalette(initial?: string[]) {
  const [colors, setColors] = useState<string[]>(initial ?? ["#3B82F6", "#A855F7", "#EF4444", "#10B981", "#F59E0B"]);
  return [colors, setColors] as const;
}

function PaletteEditor({ colors, setColors }: { colors: string[]; setColors: (c: string[]) => void }) {
  return (
    <Card title="Palette">
      <div className="grid gap-2">
        {colors.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <ColorField value={c} onChange={(v) => { const n = [...colors]; n[i] = v; setColors(n); }} label="" />
            <Button variant="outline" size="sm" onClick={() => setColors(colors.filter((_, j) => j !== i))}>×</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => setColors([...colors, randomHex()])}>Add color</Button>
      </div>
    </Card>
  );
}

export function PaletteMixer() {
  const [colors, setColors] = usePalette();
  function mixAll() {
    if (colors.length < 2) return;
    const out: string[] = [];
    for (let i = 0; i < colors.length - 1; i++) out.push(mix(colors[i], colors[i + 1], 0.5));
    setColors(out);
  }
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PaletteEditor colors={colors} setColors={setColors} />
      <Card title="Actions"><Button onClick={mixAll}>Mix adjacent pairs</Button></Card>
    </div>
  );
}
export function PaletteShuffler() {
  const [colors, setColors] = usePalette();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PaletteEditor colors={colors} setColors={setColors} />
      <Card title="Actions">
        <Button onClick={() => setColors([...colors].sort(() => Math.random() - 0.5))}>Shuffle</Button>
      </Card>
    </div>
  );
}
export function PaletteSorter() {
  const [colors, setColors] = usePalette();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PaletteEditor colors={colors} setColors={setColors} />
      <Card title="Sort">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setColors([...colors].sort((a, b) => toOklchObj(a).h - toOklchObj(b).h))}>By hue</Button>
          <Button onClick={() => setColors([...colors].sort((a, b) => toOklchObj(a).l - toOklchObj(b).l))}>By lightness</Button>
          <Button onClick={() => setColors([...colors].sort((a, b) => toOklchObj(a).c - toOklchObj(b).c))}>By chroma</Button>
        </div>
      </Card>
    </div>
  );
}
export function PaletteExporter() {
  const [colors, setColors] = usePalette();
  const json = JSON.stringify(colors, null, 2);
  const css = colors.map((c, i) => `--color-${i + 1}: ${c.toUpperCase()};`).join("\n");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PaletteEditor colors={colors} setColors={setColors} />
      <Card title="Export">
        <Label>JSON</Label><pre className="mt-2 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{json}</pre><CopyButton value={json} className="mt-2" />
        <Label className="mt-4">CSS</Label><pre className="mt-2 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" />
      </Card>
    </div>
  );
}
export function PaletteImporter() {
  const [text, setText] = useState('["#3B82F6","#A855F7","#EF4444"]');
  const [colors, setColors] = useState<string[]>([]);
  function load() {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) setColors(arr.filter((x) => typeof x === "string"));
    } catch {
      const arr = text.split(/[\s,]+/).filter(Boolean);
      setColors(arr);
    }
  }
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Paste palette (JSON array or comma-separated)</Label>
        <Input value={text} onChange={(e) => setText(e.target.value)} className="mt-2 font-mono" />
        <Button onClick={load} className="mt-3">Import</Button>
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">{colors.map((c, i) => <Swatch key={i} color={c} />)}</div>
    </div>
  );
}
export function PaletteComparison() {
  const [a, setA] = usePalette(["#3B82F6", "#A855F7", "#EF4444"]);
  const [b, setB] = usePalette(["#10B981", "#F59E0B", "#06B6D4"]);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div><h4 className="mb-2 font-semibold">Palette A</h4><PaletteEditor colors={a} setColors={setA} /></div>
      <div><h4 className="mb-2 font-semibold">Palette B</h4><PaletteEditor colors={b} setColors={setB} /></div>
    </div>
  );
}
export function PaletteBalance() {
  const [colors, setColors] = usePalette();
  const avgL = colors.reduce((s, c) => s + toOklchObj(c).l, 0) / colors.length;
  const avgC = colors.reduce((s, c) => s + toOklchObj(c).c, 0) / colors.length;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PaletteEditor colors={colors} setColors={setColors} />
      <Card title="Balance">
        <p className="text-sm text-muted-foreground">Average lightness</p>
        <p className="text-3xl font-bold">{avgL.toFixed(2)}</p>
        <p className="mt-4 text-sm text-muted-foreground">Average chroma</p>
        <p className="text-3xl font-bold">{avgC.toFixed(2)}</p>
      </Card>
    </div>
  );
}
export function PaletteAccessibility() {
  const [colors, setColors] = usePalette();
  const bg = "#FFFFFF";
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PaletteEditor colors={colors} setColors={setColors} />
      <Card title="Contrast vs white">
        <div className="grid gap-2">
          {colors.map((c, i) => {
            const ratio = contrastRatio(c, bg);
            const passAA = ratio >= 4.5;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded border" style={{ background: c }} />
                <code className="font-mono text-sm">{c.toUpperCase()}</code>
                <span className="ml-auto text-sm">{ratio.toFixed(2)}:1 {passAA ? "✓" : "✗"}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
export function PaletteFromSingle() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const palette = [-30, -15, 0, 15, 30].map((d) => toHex(`oklch(${o.l} ${o.c} ${(o.h + d + 360) % 360})`));
  return (
    <div className="grid gap-6">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{palette.map((cc, i) => <Swatch key={i} color={cc} />)}</div>
    </div>
  );
}

/* ===================== Accessibility — variant pages ===================== */

export function makeContrastChecker(thresh: number, label: string) {
  return function CCVariant() {
    const [a, setA] = useState("#1F2937");
    const [b, setB] = useState("#FFFFFF");
    const r = contrastRatio(a, b);
    const pass = r >= thresh;
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <ColorField label="Foreground" value={a} onChange={setA} />
          <div className="mt-3" /><ColorField label="Background" value={b} onChange={setB} />
        </Card>
        <Card title={label}>
          <p className="text-5xl font-bold">{r.toFixed(2)}:1</p>
          <p className={`mt-3 text-lg font-semibold ${pass ? "text-emerald-600" : "text-red-600"}`}>{pass ? "Pass" : "Fail"} (≥ {thresh}:1)</p>
          <div className="mt-4 rounded-lg p-6" style={{ background: b, color: a }}>Sample text here</div>
        </Card>
      </div>
    );
  };
}

export function AccessiblePaletteGenerator() {
  const [bg, setBg] = useState("#FFFFFF");
  const colors = useMemo(() => {
    const out: string[] = [];
    let tries = 0;
    while (out.length < 5 && tries < 200) {
      const c = randomHex();
      if (contrastRatio(c, bg) >= 4.5) out.push(c);
      tries++;
    }
    return out;
  }, [bg]);
  return (
    <div className="grid gap-6">
      <Card><ColorField label="Background" value={bg} onChange={setBg} /></Card>
      <Card title="Accessible foreground colors (AA)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {colors.map((c, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-border">
              <div className="p-4 text-center text-sm font-semibold" style={{ background: bg, color: c }}>Sample</div>
              <div className="bg-card px-2 py-1 text-center font-mono text-xs">{c.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export const CVDProtanopia = function () { return <CVDPreview type="protanopia" />; };
export const CVDDeuteranopia = function () { return <CVDPreview type="deuteranopia" />; };
export const CVDTritanopia = function () { return <CVDPreview type="tritanopia" />; };
export const CVDAchromatopsia = function () { return <CVDPreview type="achromatopsia" />; };

function CVDPreview({ type }: { type: "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia" }) {
  const [c, setC] = useState("#3B82F6");
  const r = toRgb255(c);
  function sim(): { r: number; g: number; b: number } {
    if (type === "achromatopsia") {
      const g = Math.round(0.299 * r.r + 0.587 * r.g + 0.114 * r.b);
      return { r: g, g, b: g };
    }
    const M: Record<string, number[]> = {
      protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
      deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
      tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
    };
    const m = M[type];
    return {
      r: Math.round(Math.min(255, m[0] * r.r + m[1] * r.g + m[2] * r.b)),
      g: Math.round(Math.min(255, m[3] * r.r + m[4] * r.g + m[5] * r.b)),
      b: Math.round(Math.min(255, m[6] * r.r + m[7] * r.g + m[8] * r.b)),
    };
  }
  const s = sim();
  const hex = rgbToHex(s.r, s.g, s.b);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /><div className="mt-3"><Swatch color={c} label="Original" size="lg" /></div></Card>
      <Card title={type}><Swatch color={hex} label="Simulated" size="lg" /></Card>
    </div>
  );
}

/* ===================== Temperature & gamut ===================== */

export function ColorTemperature() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const kelvin = Math.round(2000 + ((o.h + 180) % 360) * (8000 / 360));
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /><div className="mt-3"><Swatch color={c} size="lg" /></div></Card>
      <Card title="Estimated temperature">
        <p className="text-5xl font-bold">{kelvin}K</p>
        <p className="mt-3 text-sm text-muted-foreground">Heuristic based on hue.</p>
      </Card>
    </div>
  );
}

export function ColorGamutChecker() {
  const [c, setC] = useState("#3B82F6");
  const r = toRgb255(c);
  const k = toCmyk(c);
  const cmyk = `C${k.c} M${k.m} Y${k.y} K${k.k}`;
  const inSrgb = r.r >= 0 && r.r <= 255 && r.g >= 0 && r.g <= 255 && r.b >= 0 && r.b <= 255;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /><div className="mt-3"><Swatch color={c} size="lg" /></div></Card>
      <Card title="Gamut">
        <p className="text-sm text-muted-foreground">sRGB</p>
        <p className="text-2xl font-bold">{inSrgb ? "In gamut" : "Out of gamut"}</p>
        <p className="mt-4 text-sm text-muted-foreground">CMYK approx</p>
        <code className="font-mono">{cmyk}</code>
      </Card>
    </div>
  );
}

export function PrintColorAccuracy() {
  const [c, setC] = useState("#3B82F6");
  const r = toRgb255(c);
  const k = toCmyk(c);
  const cmyk = `C${k.c} M${k.m} Y${k.y} K${k.k}`;
  const safe = r.r >= 5 && r.r <= 250 && r.g >= 5 && r.g <= 250 && r.b >= 5 && r.b <= 250;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /><div className="mt-3"><Swatch color={c} size="lg" /></div></Card>
      <Card title="Print check">
        <p className="text-sm text-muted-foreground">CMYK approximation</p>
        <code className="font-mono text-lg">{cmyk}</code>
        <p className={`mt-3 font-semibold ${safe ? "text-emerald-600" : "text-orange-600"}`}>{safe ? "Likely prints close to screen" : "May shift in print"}</p>
      </Card>
    </div>
  );
}

/* ===================== CSS Shadow / Border / Filter / Backdrop / Token / Code generators ===================== */

export function CssShadowGenerator() {
  const [c, setC] = useState("#3B82F6");
  const [x, setX] = useState(0);
  const [y, setY] = useState(10);
  const [b, setB] = useState(30);
  const [s, setS] = useState(-10);
  const css = `box-shadow: ${x}px ${y}px ${b}px ${s}px ${c}80;`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <ColorField value={c} onChange={setC} />
        {([["X", x, setX, -40, 40], ["Y", y, setY, -40, 40], ["Blur", b, setB, 0, 80], ["Spread", s, setS, -40, 40]] as const).map(([n, val, set, mn, mx]) => (
          <div key={n} className="mt-3"><Label>{n}: {val}px</Label><Slider min={mn} max={mx} value={[val as number]} onValueChange={(v) => (set as any)(v[0])} className="mt-2" /></div>
        ))}
      </Card>
      <div className="flex h-72 items-center justify-center rounded-xl bg-background">
        <div className="h-32 w-32 rounded-2xl bg-card" style={{ boxShadow: `${x}px ${y}px ${b}px ${s}px ${c}80` }} />
      </div>
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Card>
    </div>
  );
}

export function CssBorderGenerator() {
  const [c, setC] = useState("#3B82F6");
  const [w, setW] = useState(2);
  const [r, setR] = useState(12);
  const [style, setStyle] = useState("solid");
  const css = `border: ${w}px ${style} ${c};\nborder-radius: ${r}px;`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <ColorField value={c} onChange={setC} />
        <div className="mt-3"><Label>Width: {w}px</Label><Slider min={0} max={20} value={[w]} onValueChange={(v) => setW(v[0])} className="mt-2" /></div>
        <div className="mt-3"><Label>Radius: {r}px</Label><Slider min={0} max={48} value={[r]} onValueChange={(v) => setR(v[0])} className="mt-2" /></div>
        <div className="mt-3"><Label>Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="mt-2 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{["solid","dashed","dotted","double"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Card>
      <div className="flex h-72 items-center justify-center rounded-xl bg-background">
        <div className="h-32 w-32 bg-card" style={{ border: `${w}px ${style} ${c}`, borderRadius: r }} />
      </div>
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Card>
    </div>
  );
}

export function CssFilterGenerator() {
  const [blur, setBlur] = useState(0);
  const [bright, setBright] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [sat, setSat] = useState(100);
  const [hue, setHue] = useState(0);
  const css = `filter: blur(${blur}px) brightness(${bright}%) contrast(${contrast}%) saturate(${sat}%) hue-rotate(${hue}deg);`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        {([["Blur", blur, setBlur, 0, 20, "px"], ["Brightness", bright, setBright, 0, 200, "%"], ["Contrast", contrast, setContrast, 0, 200, "%"], ["Saturate", sat, setSat, 0, 200, "%"], ["Hue rotate", hue, setHue, 0, 360, "deg"]] as const).map(([n, val, set, mn, mx, u]) => (
          <div key={n} className="mt-3"><Label>{n}: {val}{u}</Label><Slider min={mn} max={mx} value={[val as number]} onValueChange={(v) => (set as any)(v[0])} className="mt-2" /></div>
        ))}
      </Card>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="h-64 bg-gradient-to-br from-rose-400 via-violet-400 to-sky-400" style={{ filter: css.replace("filter: ", "").replace(";", "") }} />
      </div>
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Card>
    </div>
  );
}

export function CssBackdropFilter() {
  const [blur, setBlur] = useState(12);
  const [sat, setSat] = useState(120);
  const css = `backdrop-filter: blur(${blur}px) saturate(${sat}%);`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <Label>Blur: {blur}px</Label><Slider min={0} max={40} value={[blur]} onValueChange={(v) => setBlur(v[0])} className="mt-2" />
        <Label className="mt-3">Saturate: {sat}%</Label><Slider min={0} max={200} value={[sat]} onValueChange={(v) => setSat(v[0])} className="mt-2" />
      </Card>
      <div className="relative h-64 overflow-hidden rounded-xl bg-gradient-to-br from-rose-400 to-sky-400">
        <div className="absolute inset-6 flex items-center justify-center rounded-xl text-white font-semibold" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: `blur(${blur}px) saturate(${sat}%)` }}>Backdrop</div>
      </div>
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Card>
    </div>
  );
}

export function TailwindClassGenerator() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const palette = ["50","100","200","300","400","500","600","700","800","900","950"].map((k, i) => {
    const l = [0.97,0.93,0.85,0.75,0.65,0.55,0.47,0.4,0.32,0.22,0.14][i];
    return [k, toHex(`oklch(${l} ${o.c} ${o.h})`)] as [string, string];
  });
  const config = `// tailwind.config.js\nmodule.exports = {\n  theme: { extend: { colors: { brand: {\n${palette.map(([k, h]) => `      "${k}": "${h}",`).join("\n")}\n  }}}}}`;
  return (
    <div className="grid gap-6">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 lg:grid-cols-11">
        {palette.map(([k, h]) => (
          <div key={k} className="overflow-hidden rounded-md border border-border">
            <div className="h-12" style={{ background: h }} />
            <div className="bg-card px-2 py-1"><p className="text-xs font-semibold">bg-brand-{k}</p></div>
          </div>
        ))}
      </div>
      <Card title="Config"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{config}</pre><CopyButton value={config} className="mt-2" /></Card>
    </div>
  );
}

export function makeVarGenerator(syntax: "scss" | "less" | "styled") {
  return function VarGen() {
    const [colors, setColors] = useState<Array<{ name: string; value: string }>>([
      { name: "primary", value: "#3B82F6" }, { name: "danger", value: "#EF4444" },
    ]);
    let out = "";
    if (syntax === "scss") out = colors.map((c) => `$${c.name}: ${c.value};`).join("\n");
    else if (syntax === "less") out = colors.map((c) => `@${c.name}: ${c.value};`).join("\n");
    else out = `import { css } from 'styled-components';\nexport const colors = {\n${colors.map((c) => `  ${c.name}: '${c.value}',`).join("\n")}\n};`;
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          {colors.map((c, i) => (
            <div key={i} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <Input value={c.name} onChange={(e) => { const n = [...colors]; n[i] = { ...n[i], name: e.target.value }; setColors(n); }} />
              <ColorField value={c.value} onChange={(v) => { const n = [...colors]; n[i] = { ...n[i], value: v }; setColors(n); }} label="" />
              <Button variant="outline" size="sm" onClick={() => setColors(colors.filter((_, j) => j !== i))}>×</Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setColors([...colors, { name: `color-${colors.length + 1}`, value: randomHex() }])} className="mt-3">Add</Button>
        </Card>
        <Card title={syntax.toUpperCase()}><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{out}</pre><CopyButton value={out} className="mt-2" /></Card>
      </div>
    );
  };
}

export function makeNativeColorExport(kind: "android" | "ios" | "flutter" | "figma") {
  return function NativeExport() {
    const [colors, setColors] = useState<Array<{ name: string; value: string }>>([
      { name: "primary", value: "#3B82F6" }, { name: "danger", value: "#EF4444" },
    ]);
    let out = "";
    if (kind === "android") {
      out = `<resources>\n${colors.map((c) => `  <color name="${c.name}">${c.value}</color>`).join("\n")}\n</resources>`;
    } else if (kind === "ios") {
      out = colors.map((c) => {
        const r = toRgb255(c.value);
        return `static let ${c.name} = UIColor(red: ${(r.r/255).toFixed(3)}, green: ${(r.g/255).toFixed(3)}, blue: ${(r.b/255).toFixed(3)}, alpha: 1)`;
      }).join("\n");
    } else if (kind === "flutter") {
      out = colors.map((c) => `static const Color ${c.name} = Color(0xFF${c.value.replace("#", "").toUpperCase()});`).join("\n");
    } else {
      out = JSON.stringify({ color: Object.fromEntries(colors.map((c) => [c.name, { value: c.value, type: "color" }])) }, null, 2);
    }
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          {colors.map((c, i) => (
            <div key={i} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <Input value={c.name} onChange={(e) => { const n = [...colors]; n[i] = { ...n[i], name: e.target.value }; setColors(n); }} />
              <ColorField value={c.value} onChange={(v) => { const n = [...colors]; n[i] = { ...n[i], value: v }; setColors(n); }} label="" />
              <Button variant="outline" size="sm" onClick={() => setColors(colors.filter((_, j) => j !== i))}>×</Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setColors([...colors, { name: `color${colors.length + 1}`, value: randomHex() }])} className="mt-3">Add</Button>
        </Card>
        <Card title={kind}><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{out}</pre><CopyButton value={out} className="mt-2" /></Card>
      </div>
    );
  };
}

/* ===================== Gradient extras ===================== */

export function GradientStopEditor() {
  const [stops, setStops] = useState<Array<{ c: string; p: number }>>([{ c: "#3B82F6", p: 0 }, { c: "#A855F7", p: 50 }, { c: "#EF4444", p: 100 }]);
  const css = `linear-gradient(90deg, ${stops.map((s) => `${s.c} ${s.p}%`).join(", ")})`;
  return (
    <div className="grid gap-6">
      <Card>
        {stops.map((s, i) => (
          <div key={i} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <ColorField value={s.c} onChange={(v) => { const n = [...stops]; n[i] = { ...n[i], c: v }; setStops(n); }} label="" />
            <div><Label>{s.p}%</Label><Slider min={0} max={100} value={[s.p]} onValueChange={(v) => { const n = [...stops]; n[i] = { ...n[i], p: v[0] }; setStops(n); }} className="mt-2" /></div>
            <Button variant="outline" size="sm" onClick={() => setStops(stops.filter((_, j) => j !== i))}>×</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => setStops([...stops, { c: randomHex(), p: 100 }])} className="mt-3">Add stop</Button>
      </Card>
      <div className="h-32 rounded-xl border border-border" style={{ background: css }} />
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{`background: ${css};`}</pre><CopyButton value={`background: ${css};`} className="mt-2" /></Card>
    </div>
  );
}

export function MeshGradient() {
  const [seed, setSeed] = useState(0);
  const blobs = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = seed;
    return Array.from({ length: 5 }, () => ({
      c: randomHex(),
      x: Math.round(Math.random() * 100),
      y: Math.round(Math.random() * 100),
    }));
  }, [seed]);
  const bg = blobs.map((b) => `radial-gradient(at ${b.x}% ${b.y}%, ${b.c}, transparent 50%)`).join(", ");
  return (
    <div className="grid gap-6">
      <Button onClick={() => setSeed((s) => s + 1)}>Regenerate mesh</Button>
      <div className="h-72 rounded-xl border border-border" style={{ background: bg }} />
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{`background: ${bg};`}</pre><CopyButton value={`background: ${bg};`} className="mt-2" /></Card>
    </div>
  );
}

const GRADIENT_PRESETS = [
  ["#FF512F","#DD2476"], ["#1A2980","#26D0CE"], ["#FDC830","#F37335"], ["#42275A","#734B6D"],
  ["#11998E","#38EF7D"], ["#7F00FF","#E100FF"], ["#F2994A","#F2C94C"], ["#56CCF2","#2F80ED"],
  ["#834D9B","#D04ED6"], ["#283C86","#45A247"], ["#FF6E7F","#BFE9FF"], ["#16222A","#3A6073"],
];
export function GradientPresets() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {GRADIENT_PRESETS.map(([a, b], i) => {
        const css = `linear-gradient(135deg, ${a}, ${b})`;
        return (
          <div key={i} className="overflow-hidden rounded-xl border border-border">
            <div className="h-32" style={{ background: css }} />
            <div className="flex items-center justify-between gap-3 bg-card px-3 py-2">
              <code className="font-mono text-xs">{a} → {b}</code>
              <CopyButton value={`background: ${css};`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GradientInterpolator() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#EF4444");
  const [steps, setSteps] = useState(7);
  const colors = Array.from({ length: steps }, (_, i) => mix(a, b, i / (steps - 1)));
  return (
    <div className="grid gap-6">
      <Card>
        <ColorField label="From" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="To" value={b} onChange={setB} />
        <div className="mt-3"><Label>Steps: {steps}</Label><Slider min={3} max={15} value={[steps]} onValueChange={(v) => setSteps(v[0])} className="mt-2" /></div>
      </Card>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))` }}>
        {colors.map((c, i) => <Swatch key={i} color={c} />)}
      </div>
    </div>
  );
}

export function GradientPaletteGenerator() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#EF4444");
  const palette = [0, 0.25, 0.5, 0.75, 1].map((t) => mix(a, b, t));
  return (
    <div className="grid gap-6">
      <Card>
        <ColorField label="From" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="To" value={b} onChange={setB} />
      </Card>
      <div className="grid grid-cols-5 gap-2">{palette.map((c, i) => <Swatch key={i} color={c} />)}</div>
    </div>
  );
}

export function TransparentGradient() {
  const [c, setC] = useState("#3B82F6");
  const css = `linear-gradient(180deg, ${c}, transparent)`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="h-64 rounded-xl border border-border" style={{ background: css }} />
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{`background: ${css};`}</pre><CopyButton value={`background: ${css};`} className="mt-2" /></Card>
    </div>
  );
}

export function TextGradient() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#A855F7");
  const css = `background: linear-gradient(90deg, ${a}, ${b});\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;\nbackground-clip: text;\ncolor: transparent;`;
  return (
    <div className="grid gap-6">
      <Card>
        <ColorField label="From" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="To" value={b} onChange={setB} />
      </Card>
      <div className="rounded-xl border border-border p-8 text-center">
        <h2 className="text-5xl font-bold" style={{ background: `linear-gradient(90deg, ${a}, ${b})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Gradient Text</h2>
      </div>
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Card>
    </div>
  );
}

export function BackgroundGradient() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#A855F7");
  const [ang, setAng] = useState(135);
  const css = `background: linear-gradient(${ang}deg, ${a}, ${b});`;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <ColorField label="From" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="To" value={b} onChange={setB} />
        <div className="mt-3"><Label>Angle: {ang}°</Label><Slider min={0} max={360} value={[ang]} onValueChange={(v) => setAng(v[0])} className="mt-2" /></div>
      </Card>
      <div className="h-64 rounded-xl border border-border" style={{ background: `linear-gradient(${ang}deg, ${a}, ${b})` }} />
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Card>
    </div>
  );
}

export function AnimatedGradient() {
  const css = `@keyframes shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }\n.animated-bg { background: linear-gradient(270deg,#3B82F6,#A855F7,#EF4444); background-size:600% 600%; animation: shift 12s ease infinite; }`;
  return (
    <div className="grid gap-6">
      <div className="h-64 rounded-xl border border-border" style={{ background: "linear-gradient(270deg,#3B82F6,#A855F7,#EF4444)", backgroundSize: "600% 600%", animation: "shift 12s ease infinite" }}>
        <style>{`@keyframes shift {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
      </div>
      <Card title="CSS"><pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs">{css}</pre><CopyButton value={css} className="mt-2" /></Card>
    </div>
  );
}

export function GradientReverser() {
  const [g, setG] = useState("linear-gradient(90deg, #3B82F6, #A855F7, #EF4444)");
  const reversed = useMemo(() => {
    const m = g.match(/linear-gradient\(([^)]+)\)/i);
    if (!m) return g;
    const parts = m[1].split(",").map((s) => s.trim());
    const head = parts[0].includes("deg") || parts[0].includes("to ") ? parts.shift() : null;
    const r = parts.reverse();
    return `linear-gradient(${head ? head + ", " : ""}${r.join(", ")})`;
  }, [g]);
  return (
    <div className="grid gap-6">
      <Card>
        <Label>Gradient CSS</Label>
        <Input value={g} onChange={(e) => setG(e.target.value)} className="mt-2 font-mono" />
      </Card>
      <div className="h-24 rounded-xl border border-border" style={{ background: g }} />
      <div className="h-24 rounded-xl border border-border" style={{ background: reversed }} />
      <Card title="Reversed"><code className="font-mono text-sm">{reversed}</code><CopyButton value={`background: ${reversed};`} className="mt-2" /></Card>
    </div>
  );
}

export function GradientNoise() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#A855F7");
  return (
    <div className="grid gap-6">
      <Card>
        <ColorField label="From" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="To" value={b} onChange={setB} />
      </Card>
      <div className="relative h-64 overflow-hidden rounded-xl border border-border" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
        <svg className="absolute inset-0 h-full w-full opacity-30 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
          <filter id="n"><feTurbulence baseFrequency="0.9" numOctaves="2" /></filter>
          <rect width="100%" height="100%" filter="url(#n)" />
        </svg>
      </div>
    </div>
  );
}

export function GradientCollection() {
  return <GradientPresets />;
}

/* ===================== Design system references — extra ===================== */

function Group({ name, swatches }: { name: string; swatches: Array<[string, string]> }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="mb-2 text-sm font-semibold">{name}</h4>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-10">
        {swatches.map(([k, h]) => (
          <div key={k} className="overflow-hidden rounded-md border border-border">
            <div className="h-12" style={{ background: h }} />
            <div className="bg-card px-2 py-1"><p className="text-[10px] font-semibold">{k}</p><p className="font-mono text-[10px] text-muted-foreground">{h}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AntColorReference() {
  const bases: Record<string, string> = { red: "#f5222d", volcano: "#fa541c", orange: "#fa8c16", gold: "#faad14", yellow: "#fadb14", lime: "#a0d911", green: "#52c41a", cyan: "#13c2c2", blue: "#1677ff", geekblue: "#2f54eb", purple: "#722ed1", magenta: "#eb2f96" };
  return <div className="grid gap-3">{Object.entries(bases).map(([n, h]) => <Group key={n} name={n} swatches={shadesOf(h)} />)}</div>;
}

export function RadixColorReference() {
  const bases: Record<string, string> = { tomato: "#e54d2e", red: "#e5484d", crimson: "#e93d82", pink: "#d6409f", plum: "#ab4aba", purple: "#8e4ec6", violet: "#6e56cf", indigo: "#3e63dd", blue: "#0090ff", cyan: "#00a2c7", teal: "#12a594", green: "#30a46c" };
  return <div className="grid gap-3">{Object.entries(bases).map(([n, h]) => <Group key={n} name={n} swatches={shadesOf(h)} />)}</div>;
}

export function OpenColorReference() {
  const bases: Record<string, string> = { gray: "#868e96", red: "#fa5252", pink: "#e64980", grape: "#be4bdb", violet: "#7950f2", indigo: "#4c6ef5", blue: "#228be6", cyan: "#15aabf", teal: "#12b886", green: "#40c057", lime: "#82c91e", yellow: "#fab005", orange: "#fd7e14" };
  return <div className="grid gap-3">{Object.entries(bases).map(([n, h]) => <Group key={n} name={n} swatches={shadesOf(h)} />)}</div>;
}

export function CarbonColorReference() {
  const bases: Record<string, string> = { blue: "#0f62fe", "cool-gray": "#697077", "warm-gray": "#7c7975", green: "#198038", red: "#da1e28", magenta: "#d12771", purple: "#8a3ffc", cyan: "#1192e8", teal: "#009d9a", yellow: "#f1c21b", orange: "#ff832b" };
  return <div className="grid gap-3">{Object.entries(bases).map(([n, h]) => <Group key={n} name={n} swatches={shadesOf(h)} />)}</div>;
}

export function SalesforceColorReference() {
  const bases: Record<string, string> = { brand: "#0176d3", success: "#2e844a", warning: "#fe9339", error: "#ea001e", info: "#0176d3", neutral: "#747474" };
  return <div className="grid gap-3">{Object.entries(bases).map(([n, h]) => <Group key={n} name={n} swatches={shadesOf(h)} />)}</div>;
}

function shadesOf(base: string): Array<[string, string]> {
  const o = toOklchObj(base);
  return ["50","100","200","300","400","500","600","700","800","900"].map((k, i) => {
    const l = [0.97,0.92,0.85,0.75,0.65,0.55,0.47,0.4,0.3,0.2][i];
    return [k, toHex(`oklch(${l} ${o.c} ${o.h})`)];
  });
}

/* ===================== Naming look-ups ===================== */

export function HtmlColorReference() {
  const list: Array<[string, string]> = [
    ["AliceBlue","#F0F8FF"],["AntiqueWhite","#FAEBD7"],["Aqua","#00FFFF"],["Aquamarine","#7FFFD4"],["Azure","#F0FFFF"],
    ["Beige","#F5F5DC"],["Bisque","#FFE4C4"],["Black","#000000"],["BlanchedAlmond","#FFEBCD"],["Blue","#0000FF"],
    ["Brown","#A52A2A"],["Coral","#FF7F50"],["Crimson","#DC143C"],["Cyan","#00FFFF"],["Gold","#FFD700"],
    ["Gray","#808080"],["Green","#008000"],["Indigo","#4B0082"],["Ivory","#FFFFF0"],["Khaki","#F0E68C"],
    ["Lavender","#E6E6FA"],["Lime","#00FF00"],["Magenta","#FF00FF"],["Maroon","#800000"],["Navy","#000080"],
    ["Olive","#808000"],["Orange","#FFA500"],["Pink","#FFC0CB"],["Purple","#800080"],["Red","#FF0000"],
    ["Salmon","#FA8072"],["SeaGreen","#2E8B57"],["Silver","#C0C0C0"],["SkyBlue","#87CEEB"],["Tan","#D2B48C"],
    ["Teal","#008080"],["Tomato","#FF6347"],["Turquoise","#40E0D0"],["Violet","#EE82EE"],["Yellow","#FFFF00"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {list.map(([n, h]) => (
        <div key={n} className="overflow-hidden rounded-md border border-border">
          <div className="h-16" style={{ background: h }} />
          <div className="bg-card px-2 py-1"><p className="text-xs font-semibold">{n}</p><p className="font-mono text-[10px] text-muted-foreground">{h}</p></div>
        </div>
      ))}
    </div>
  );
}

export function WebSafeColors() {
  const safe: string[] = [];
  const steps = [0, 51, 102, 153, 204, 255];
  for (const r of steps) for (const g of steps) for (const b of steps) safe.push(rgbToHex(r, g, b));
  return (
    <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
      {safe.map((c, i) => <div key={i} className="h-10 rounded" style={{ background: c }} title={c} />)}
    </div>
  );
}

/* ===================== Color of the year / cultural / flag ===================== */

export function ColorOfTheYear() {
  const data: Array<[number, string, string]> = [
    [2020, "Classic Blue", "#0F4C81"], [2021, "Illuminating", "#F5DF4D"], [2021, "Ultimate Gray", "#939597"],
    [2022, "Very Peri", "#6667AB"], [2023, "Viva Magenta", "#BB2649"], [2024, "Peach Fuzz", "#FFBE98"],
    [2025, "Mocha Mousse", "#A47864"], [2026, "Future Dusk", "#4C5578"],
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {data.map(([y, n, h]) => (
        <div key={y + n} className="overflow-hidden rounded-xl border border-border">
          <div className="h-32" style={{ background: h }} />
          <div className="bg-card p-3"><p className="text-xs text-muted-foreground">{y}</p><p className="font-semibold">{n}</p><p className="font-mono text-xs">{h}</p></div>
        </div>
      ))}
    </div>
  );
}

export function CulturalPalettes() {
  const groups: Array<{ name: string; colors: string[] }> = [
    { name: "Japanese", colors: ["#E60012","#F8B500","#003F88","#222222","#F2EFE9"] },
    { name: "Scandinavian", colors: ["#F5F2EB","#A8B5A0","#2C2C2C","#D88C5E","#E8DCC4"] },
    { name: "Indian", colors: ["#E63946","#F4A261","#2A9D8F","#264653","#FFD166"] },
    { name: "Mexican", colors: ["#E63946","#F1FAEE","#A8DADC","#457B9D","#1D3557"] },
    { name: "Moroccan", colors: ["#1B4965","#62B6CB","#BEE9E8","#FFA552","#CC2936"] },
  ];
  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <Card key={g.name} title={g.name}>
          <div className="grid grid-cols-5 gap-2">{g.colors.map((c, i) => <Swatch key={i} color={c} />)}</div>
        </Card>
      ))}
    </div>
  );
}

export function FlagExplorer() {
  const flags: Array<{ name: string; colors: string[] }> = [
    { name: "USA", colors: ["#B22234","#FFFFFF","#3C3B6E"] },
    { name: "Germany", colors: ["#000000","#DD0000","#FFCE00"] },
    { name: "Japan", colors: ["#FFFFFF","#BC002D"] },
    { name: "Brazil", colors: ["#009C3B","#FFDF00","#002776","#FFFFFF"] },
    { name: "India", colors: ["#FF9933","#FFFFFF","#138808","#000080"] },
    { name: "France", colors: ["#0055A4","#FFFFFF","#EF4135"] },
    { name: "UK", colors: ["#012169","#FFFFFF","#C8102E"] },
    { name: "Italy", colors: ["#009246","#FFFFFF","#CE2B37"] },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {flags.map((f) => (
        <Card key={f.name} title={f.name}>
          <div className="flex gap-2">{f.colors.map((c, i) => <div key={i} className="h-16 flex-1 rounded" style={{ background: c }} />)}</div>
        </Card>
      ))}
    </div>
  );
}

export function BrandColorLibrary() {
  const brands: Array<[string, string]> = [
    ["Facebook","#1877F2"],["Twitter","#1DA1F2"],["Instagram","#E1306C"],["YouTube","#FF0000"],
    ["LinkedIn","#0A66C2"],["Spotify","#1DB954"],["Slack","#4A154B"],["Discord","#5865F2"],
    ["Netflix","#E50914"],["Airbnb","#FF5A5F"],["Stripe","#635BFF"],["Notion","#000000"],
    ["Figma","#F24E1E"],["GitHub","#24292E"],["Vercel","#000000"],["Tailwind","#06B6D4"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {brands.map(([n, h]) => (
        <div key={n} className="overflow-hidden rounded-md border border-border">
          <div className="h-16" style={{ background: h }} />
          <div className="bg-card px-2 py-1"><p className="text-xs font-semibold">{n}</p><p className="font-mono text-[10px] text-muted-foreground">{h}</p></div>
        </div>
      ))}
    </div>
  );
}

/* ===================== Visual / context / hierarchy explorers ===================== */

export function SimultaneousContrast() {
  const [c, setC] = useState("#A855F7");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex h-40 items-center justify-center" style={{ background: "#000" }}><div className="h-16 w-16 rounded-full" style={{ background: c }} /></div>
        <div className="flex h-40 items-center justify-center" style={{ background: "#fff" }}><div className="h-16 w-16 rounded-full" style={{ background: c }} /></div>
      </div>
    </div>
  );
}

export function AfterimageSimulator() {
  const [c, setC] = useState("#EF4444");
  const r = toRgb255(c);
  const after = rgbToHex(255 - r.r, 255 - r.g, 255 - r.b);
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <Card title="Stare for 20s"><div className="h-40 rounded" style={{ background: c }} /></Card>
      <Card title="Then look here"><div className="h-40 rounded bg-white border border-border" /><p className="mt-2 text-sm text-muted-foreground">You'll see ≈ {after}</p></Card>
    </div>
  );
}

export function OpticalMixing() {
  const [a, setA] = useState("#3B82F6");
  const [b, setB] = useState("#EF4444");
  return (
    <div className="grid gap-6">
      <Card>
        <ColorField label="Color A" value={a} onChange={setA} />
        <div className="mt-3" /><ColorField label="Color B" value={b} onChange={setB} />
      </Card>
      <div className="h-40 rounded-xl border border-border" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${a} 0 4px, ${b} 4px 8px)` }} />
      <p className="text-sm text-muted-foreground">Step back — your eye blends these into {mix(a, b, 0.5)}.</p>
    </div>
  );
}

export function ColorContext() {
  const [c, setC] = useState("#A855F7");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="grid grid-cols-2 gap-3">
        {["#ffffff", "#000000", "#3b82f6", "#22c55e"].map((bg) => (
          <div key={bg} className="flex h-32 items-center justify-center" style={{ background: bg }}>
            <div className="h-16 w-16 rounded-full" style={{ background: c }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisualWeight() {
  const [colors, setColors] = useState<string[]>(["#000000","#3B82F6","#A855F7","#22C55E","#FFFFFF"]);
  const weighted = [...colors].sort((a, b) => toOklchObj(a).l - toOklchObj(b).l);
  return (
    <div className="grid gap-6">
      <Card><PaletteEditor colors={colors} setColors={setColors} /></Card>
      <Card title="Heaviest → lightest">
        <div className="flex items-end gap-2">
          {weighted.map((c, i) => {
            const l = toOklchObj(c).l;
            const size = Math.round(30 + (1 - l) * 80);
            return <div key={i} className="rounded" style={{ background: c, width: size, height: size }} title={c} />;
          })}
        </div>
      </Card>
    </div>
  );
}

export function ColorHierarchy() {
  const [primary, setPrimary] = useState("#3B82F6");
  const [secondary, setSecondary] = useState("#10B981");
  const [muted, setMuted] = useState("#94A3B8");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <ColorField label="Primary" value={primary} onChange={setPrimary} />
        <div className="mt-3" /><ColorField label="Secondary" value={secondary} onChange={setSecondary} />
        <div className="mt-3" /><ColorField label="Muted" value={muted} onChange={setMuted} />
      </Card>
      <Card title="Preview">
        <button className="rounded-md px-6 py-3 text-lg font-semibold text-white" style={{ background: primary }}>Primary CTA</button>
        <button className="ml-2 rounded-md px-6 py-3 text-base font-medium text-white" style={{ background: secondary }}>Secondary</button>
        <p className="mt-3" style={{ color: muted }}>Muted supporting text…</p>
      </Card>
    </div>
  );
}

export function ColorStrategy() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const palette = {
    primary: c,
    primaryDark: toHex(`oklch(${Math.max(0.2, o.l - 0.15)} ${o.c} ${o.h})`),
    accent: toHex(`oklch(${o.l} ${o.c} ${(o.h + 180) % 360})`),
    surface: toHex(`oklch(0.97 0.01 ${o.h})`),
    text: toHex(`oklch(0.2 0.02 ${o.h})`),
  };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <Card title="Brand strategy">
        {Object.entries(palette).map(([k, v]) => (
          <div key={k} className="flex items-center gap-3"><div className="h-6 w-6 rounded border" style={{ background: v }} /><span className="text-sm">{k}</span><code className="ml-auto font-mono text-xs">{v.toUpperCase()}</code></div>
        ))}
      </Card>
    </div>
  );
}

export function ColorPlayground() {
  const [l, setL] = useState(60);
  const [c, setC] = useState(20);
  const [h, setH] = useState(260);
  const hex = toHex(`oklch(${l / 100} ${c / 100} ${h})`);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <Label>Lightness: {l}%</Label><Slider min={0} max={100} value={[l]} onValueChange={(v) => setL(v[0])} className="mt-2" />
        <Label className="mt-4">Chroma: {c}%</Label><Slider min={0} max={40} value={[c]} onValueChange={(v) => setC(v[0])} className="mt-2" />
        <Label className="mt-4">Hue: {h}°</Label><Slider min={0} max={360} value={[h]} onValueChange={(v) => setH(v[0])} className="mt-2" />
      </Card>
      <Card title="Result"><Swatch color={hex} size="lg" /></Card>
    </div>
  );
}

export function PrimarySecondaryTertiary() {
  const groups = [
    { name: "Primary", colors: ["#FF0000","#00FF00","#0000FF"] },
    { name: "Secondary", colors: ["#FFFF00","#FF00FF","#00FFFF"] },
    { name: "Tertiary", colors: ["#FF8000","#80FF00","#0080FF","#8000FF","#FF0080","#00FF80"] },
  ];
  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <Card key={g.name} title={g.name}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{g.colors.map((c, i) => <Swatch key={i} color={c} />)}</div>
        </Card>
      ))}
    </div>
  );
}

export function HarmonyVisualizer() {
  return <RelationshipExplorer />;
}

export function InteractiveColorWheel() {
  const HUES = 24;
  const [l, setL] = useState(0.65);
  const colors = Array.from({ length: HUES }, (_, i) => toHex(`oklch(${l} 0.2 ${(i * 360) / HUES})`));
  return (
    <div className="grid gap-6">
      <Card><Label>Lightness: {Math.round(l * 100)}%</Label><Slider min={20} max={90} value={[l * 100]} onValueChange={(v) => setL(v[0] / 100)} className="mt-2" /></Card>
      <div className="relative mx-auto h-96 w-96">
        {colors.map((c, i) => {
          const angle = (i * 360) / HUES;
          return <button key={i} className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border" style={{ background: c, transform: `translate(-50%, -50%) rotate(${angle}deg) translate(150px) rotate(-${angle}deg)` }} title={c} />;
        })}
      </div>
    </div>
  );
}

export function ColorLearningPlayground() {
  return (
    <div className="grid gap-6">
      <Card title="Pick anything to explore">
        <p className="text-sm text-muted-foreground">Try the playground sliders below, then check harmonies, simultaneous contrast, and the color wheel.</p>
      </Card>
      <ColorPlayground />
    </div>
  );
}

/* ===================== Alpha generator ===================== */

export function AlphaColorGenerator() {
  const [c, setC] = useState("#3B82F6");
  const [a, setA] = useState(50);
  const hex = toHex(c).toUpperCase();
  const r = toRgb255(c);
  const out = `rgba(${r.r}, ${r.g}, ${r.b}, ${(a / 100).toFixed(2)})`;
  const hex8 = hex + Math.round((a / 100) * 255).toString(16).padStart(2, "0").toUpperCase();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <ColorField value={c} onChange={setC} />
        <div className="mt-3"><Label>Alpha: {a}%</Label><Slider min={0} max={100} value={[a]} onValueChange={(v) => setA(v[0])} className="mt-2" /></div>
      </Card>
      <Card title="Result">
        <div className="h-32 rounded-xl border border-border" style={{ background: out, backgroundImage: "conic-gradient(#e5e7eb 0 25%, #fff 25% 50%, #e5e7eb 50% 75%, #fff 75% 100%)", backgroundSize: "20px 20px" }} />
        <div className="mt-3 grid gap-2">
          <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2"><span className="text-xs uppercase text-muted-foreground">rgba</span><code className="font-mono text-sm">{out}</code><CopyButton value={out} /></div>
          <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2"><span className="text-xs uppercase text-muted-foreground">hex8</span><code className="font-mono text-sm">{hex8}</code><CopyButton value={hex8} /></div>
        </div>
      </Card>
    </div>
  );
}

/* ===================== Color variations ===================== */

export function ColorVariations() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const rows = [
    { name: "Tints", colors: [0.85, 0.9, 0.93, 0.96, 0.98].map((l) => toHex(`oklch(${l} ${o.c * 0.4} ${o.h})`)) },
    { name: "Shades", colors: [0.5, 0.4, 0.3, 0.2, 0.12].map((l) => toHex(`oklch(${l} ${o.c} ${o.h})`)) },
    { name: "Tones", colors: [0.05, 0.08, 0.12, 0.16, 0.2].map((cc) => toHex(`oklch(${o.l} ${cc} ${o.h})`)) },
  ];
  return (
    <div className="grid gap-6">
      <Card><ColorField value={c} onChange={setC} /></Card>
      {rows.map((r) => (
        <Card key={r.name} title={r.name}>
          <div className="grid grid-cols-5 gap-2">{r.colors.map((cc, i) => <Swatch key={i} color={cc} />)}</div>
        </Card>
      ))}
    </div>
  );
}

/* ===================== Color shift generator ===================== */

export function ColorShiftGenerator() {
  const [c, setC] = useState("#3B82F6");
  const o = toOklchObj(c);
  const shifts = [-60, -30, -15, 0, 15, 30, 60].map((d) => ({ d, hex: toHex(`oklch(${o.l} ${o.c} ${(o.h + d + 360) % 360})`) }));
  return (
    <div className="grid gap-6">
      <Card><ColorField value={c} onChange={setC} /></Card>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {shifts.map(({ d, hex }) => <Swatch key={d} color={hex} label={`${d > 0 ? "+" : ""}${d}°`} />)}
      </div>
    </div>
  );
}

/* ===================== Nearest named identifiers ===================== */
export { ColorNameLookup as HexToColorName } from "./extra";
export { ColorNameLookup as RgbToColorName } from "./extra";
export { ColorNameLookup as ColorNameFinder } from "./extra";
export { ColorNameLookup as CssNamedColorFinder } from "./extra";
