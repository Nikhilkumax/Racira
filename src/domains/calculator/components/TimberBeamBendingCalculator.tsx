"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface BeamInputs {
  spanFt: number;
  size: string;
  species: string;
  livePlf: number;
  deadPlf: number;
  pointLb: number;
  duration: number;
  repetitive: number;
  wetService: number;
  deflLimit: number;
  includeSelf: string;
}

const DEFAULTS: BeamInputs = {
  spanFt: 12,
  size: "2x10",
  species: "dfl",
  livePlf: 40,
  deadPlf: 10,
  pointLb: 0,
  duration: 1,
  repetitive: 1.15,
  wetService: 1,
  deflLimit: 360,
  includeSelf: "yes",
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const psi = (v: number) => (Number.isFinite(v) ? fmt(v, 0) + " psi" : "—");

// Surfaced (dressed) dimensions in inches, NDS Supplement 2018 Table 1B.
const SIZES: { key: string; label: string; b: number; d: number }[] = [
  { key: "2x6", label: "2x6 — 1.5 x 5.5 in", b: 1.5, d: 5.5 },
  { key: "2x8", label: "2x8 — 1.5 x 7.25 in", b: 1.5, d: 7.25 },
  { key: "2x10", label: "2x10 — 1.5 x 9.25 in", b: 1.5, d: 9.25 },
  { key: "2x12", label: "2x12 — 1.5 x 11.25 in", b: 1.5, d: 11.25 },
  { key: "4x8", label: "4x8 — 3.5 x 7.25 in", b: 3.5, d: 7.25 },
  { key: "4x10", label: "4x10 — 3.5 x 9.25 in", b: 3.5, d: 9.25 },
  { key: "4x12", label: "4x12 — 3.5 x 11.25 in", b: 3.5, d: 11.25 },
  { key: "6x10", label: "6x10 — 5.5 x 9.5 in", b: 5.5, d: 9.5 },
  { key: "6x12", label: "6x12 — 5.5 x 11.5 in", b: 5.5, d: 11.5 },
  { key: "2x10x2", label: "2x10 doubled — 3 x 9.25 in", b: 3, d: 9.25 },
  { key: "2x12x2", label: "2x12 doubled — 3 x 11.25 in", b: 3, d: 11.25 },
  { key: "2x10x3", label: "2x10 tripled — 4.5 x 9.25 in", b: 4.5, d: 9.25 },
];

// NDS Supplement 2018 Table 4A, visually graded No.2, 2 in and wider, normal duration.
const SPECIES: { key: string; label: string; fb: number; fv: number; e: number; g: number }[] = [
  { key: "dfl", label: "Douglas Fir-Larch No.2", fb: 900, fv: 180, e: 1600000, g: 0.5 },
  { key: "hf", label: "Hem-Fir No.2", fb: 850, fv: 150, e: 1300000, g: 0.43 },
  { key: "sp", label: "Southern Pine No.2", fb: 850, fv: 175, e: 1400000, g: 0.55 },
  { key: "spf", label: "Spruce-Pine-Fir No.2", fb: 875, fv: 135, e: 1400000, g: 0.42 },
  { key: "wrc", label: "Western Red Cedar No.2", fb: 850, fv: 155, e: 1100000, g: 0.32 },
];

const DURATION_OPTIONS = [
  { value: "0.9", label: "0.9 — permanent load" },
  { value: "1", label: "1.0 — normal (10 yr)" },
  { value: "1.15", label: "1.15 — snow (2 month)" },
  { value: "1.25", label: "1.25 — floor live (7 day)" },
  { value: "1.6", label: "1.6 — wind / seismic (10 min)" },
];

// NDS Supplement 2018 Table 4A footnote: size factor for Fb by depth, 2-4 in thick members.
function sizeFactor(depth: number, thickness: number): number {
  if (thickness > 4) return 1;
  if (depth <= 4) return 1.5;
  if (depth <= 6) return 1.3;
  if (depth <= 8) return 1.2;
  if (depth <= 10) return 1.1;
  if (depth <= 12) return 1;
  return 0.9;
}

interface BeamResult {
  ok: boolean;
  b: number;
  d: number;
  area: number;
  s: number;
  i: number;
  selfPlf: number;
  totalPlf: number;
  momentLbFt: number;
  shear: number;
  fb: number;
  cf: number;
  fbAllow: number;
  fv: number;
  fvAllow: number;
  bendingUc: number;
  shearUc: number;
  deflLive: number;
  deflTotal: number;
  limitLive: number;
  limitTotal: number;
  deflUc: number;
  deflRatio: number;
  governing: string;
  governingUc: number;
  e: number;
  fiberStressRaw: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateBeam(i: BeamInputs): BeamResult {
  const blank = (): BeamResult => ({
    ok: false,
    b: 0,
    d: 0,
    area: 0,
    s: 0,
    i: 0,
    selfPlf: 0,
    totalPlf: 0,
    momentLbFt: 0,
    shear: 0,
    fb: 0,
    cf: 1,
    fbAllow: 0,
    fv: 0,
    fvAllow: 0,
    bendingUc: 0,
    shearUc: 0,
    deflLive: 0,
    deflTotal: 0,
    limitLive: 0,
    limitTotal: 0,
    deflUc: 0,
    deflRatio: 0,
    governing: "",
    governingUc: 0,
    e: 0,
    fiberStressRaw: 0,
    breakdown: [],
  });

  const nums = [
    i.spanFt,
    i.livePlf,
    i.deadPlf,
    i.pointLb,
    i.duration,
    i.repetitive,
    i.wetService,
    i.deflLimit,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank();
  if (i.spanFt <= 0 || i.spanFt > 60) return blank();
  if (i.livePlf < 0 || i.livePlf > 5000) return blank();
  if (i.deadPlf < 0 || i.deadPlf > 5000) return blank();
  if (i.pointLb < 0 || i.pointLb > 100000) return blank();
  if (i.duration <= 0 || i.duration > 1.6) return blank();
  if (i.repetitive <= 0 || i.repetitive > 1.15) return blank();
  if (i.wetService <= 0 || i.wetService > 1) return blank();
  if (i.deflLimit < 120 || i.deflLimit > 600) return blank();
  if (i.livePlf + i.deadPlf <= 0 && i.pointLb <= 0) return blank();

  const size = SIZES.find((s) => s.key === i.size) || SIZES[2];
  const sp = SPECIES.find((s) => s.key === i.species) || SPECIES[0];
  const b = size.b;
  const d = size.d;

  const area = b * d;
  const s = (b * d * d) / 6;
  const inertia = (b * d * d * d) / 12;

  const gamma = 62.4 * sp.g; // lb per cubic foot
  const selfPlf = (b * d * gamma) / 144;
  const useSelf = i.includeSelf === "yes";
  const totalPlf = i.livePlf + i.deadPlf + (useSelf ? selfPlf : 0);

  const spanIn = i.spanFt * 12;
  const wLbIn = totalPlf / 12; // lb per inch
  const wLiveLbIn = i.livePlf / 12;

  const momentUniform = (wLbIn * spanIn * spanIn) / 8; // lb-in
  const momentPoint = (i.pointLb * spanIn) / 4; // lb-in
  const momentTotal = momentUniform + momentPoint;
  const shear = (totalPlf * i.spanFt) / 2 + i.pointLb / 2;

  const fb = momentTotal / s;
  const cf = sizeFactor(d, b);
  const fbAllow = sp.fb * i.duration * cf * i.repetitive * i.wetService;
  const fv = (1.5 * shear) / area;
  const fvAllow = sp.fv * i.duration * i.wetService;

  const deflLiveUniform = (5 * wLiveLbIn * Math.pow(spanIn, 4)) / (384 * sp.e * inertia);
  const deflLivePoint = (i.pointLb * Math.pow(spanIn, 3)) / (48 * sp.e * inertia);
  const deflLive = deflLiveUniform + deflLivePoint;
  const deflTotal = (5 * wLbIn * Math.pow(spanIn, 4)) / (384 * sp.e * inertia) + deflLivePoint;

  const limitLive = spanIn / i.deflLimit;
  const limitTotal = spanIn / 240;

  const bendingUc = fbAllow > 0 ? fb / fbAllow : 0;
  const shearUc = fvAllow > 0 ? fv / fvAllow : 0;
  const deflUc = limitLive > 0 ? deflLive / limitLive : 0;
  const totalUc = limitTotal > 0 ? deflTotal / limitTotal : 0;

  const govern = [
    { name: "Bending stress", uc: bendingUc },
    { name: "Shear", uc: shearUc },
    { name: `Live deflection (L/${i.deflLimit})`, uc: deflUc },
    { name: "Total deflection (L/240)", uc: totalUc },
  ].sort((a, x) => x.uc - a.uc)[0];

  const breakdown = [
    { label: `Beam section — ${size.label}`, value: `${fmt(b, 2)} x ${fmt(d, 2)} in` },
    { label: "Cross-section area", value: fmt(area, 2) + " in²" },
    { label: "Section modulus (S)", value: fmt(s, 2) + " in³" },
    { label: "Moment of inertia (I)", value: fmt(inertia, 2) + " in⁴" },
    { label: `Beam self-weight at ${fmt(gamma, 1)} lb/ft³`, value: fmt(selfPlf, 2) + " lb/ft" },
    { label: "Total uniform load carried", value: fmt(totalPlf, 1) + " lb/ft", highlight: true },
    { label: "Max bending moment (M)", value: fmt(momentTotal / 12, 0) + " lb-ft" },
    { label: "Max shear (V)", value: fmt(shear, 0) + " lb" },
    { label: `Actual bending stress fb (CF ${fmt(cf, 2)})`, value: psi(fb) },
    {
      label: `Allowable Fb' — ${fmt(sp.fb, 0)} x CD ${fmt(i.duration, 2)} x CF ${fmt(cf, 2)} x Cr ${fmt(i.repetitive, 2)} x CM ${fmt(i.wetService, 2)}`,
      value: psi(fbAllow),
      highlight: true,
    },
    { label: "Bending unity check fb / Fb'", value: fmt(bendingUc, 2) },
    { label: "Shear unity check fv / Fv'", value: fmt(shearUc, 2) },
    { label: `Live deflection vs L/${i.deflLimit}`, value: `${fmt(deflLive, 3)} in / ${fmt(limitLive, 3)} in` },
    { label: "Total deflection vs L/240", value: `${fmt(deflTotal, 3)} in / ${fmt(limitTotal, 3)} in` },
    { label: "Governing limit state", value: govern.name, highlight: true },
  ];

  return {
    ok: true,
    b,
    d,
    area,
    s,
    i: inertia,
    selfPlf,
    totalPlf,
    momentLbFt: momentTotal / 12,
    shear,
    fb,
    cf,
    fbAllow,
    fv,
    fvAllow,
    bendingUc,
    shearUc,
    deflLive,
    deflTotal,
    limitLive,
    limitTotal,
    deflUc,
    deflRatio: deflLive > 0 ? spanIn / deflLive : 0,
    governing: govern.name,
    governingUc: govern.uc,
    e: sp.e,
    fiberStressRaw: sp.fb,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function TimberBeamBendingCalculator() {
  const [spanFt, setSpanFt] = useState(String(DEFAULTS.spanFt));
  const [size, setSize] = useState(DEFAULTS.size);
  const [species, setSpecies] = useState(DEFAULTS.species);
  const [livePlf, setLivePlf] = useState(String(DEFAULTS.livePlf));
  const [deadPlf, setDeadPlf] = useState(String(DEFAULTS.deadPlf));
  const [pointLb, setPointLb] = useState(String(DEFAULTS.pointLb));
  const [duration, setDuration] = useState(String(DEFAULTS.duration));
  const [repetitive, setRepetitive] = useState(String(DEFAULTS.repetitive));
  const [wetService, setWetService] = useState(String(DEFAULTS.wetService));
  const [deflLimit, setDeflLimit] = useState(String(DEFAULTS.deflLimit));
  const [includeSelf, setIncludeSelf] = useState(DEFAULTS.includeSelf);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BeamInputs => ({
    spanFt: parseFloat(spanFt) || 0,
    size,
    species,
    livePlf: parseFloat(livePlf) || 0,
    deadPlf: parseFloat(deadPlf) || 0,
    pointLb: parseFloat(pointLb) || 0,
    duration: parseFloat(duration) || 1,
    repetitive: parseFloat(repetitive) || 1,
    wetService: parseFloat(wetService) || 1,
    deflLimit: parseFloat(deflLimit) || 360,
    includeSelf,
  });

  const [calcInputs, setCalcInputs] = useState<BeamInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BeamResult>(() => calculateBeam(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateBeam(inputs));
  };

  const reset = () => {
    setSpanFt(String(DEFAULTS.spanFt));
    setSize(DEFAULTS.size);
    setSpecies(DEFAULTS.species);
    setLivePlf(String(DEFAULTS.livePlf));
    setDeadPlf(String(DEFAULTS.deadPlf));
    setPointLb(String(DEFAULTS.pointLb));
    setDuration(String(DEFAULTS.duration));
    setRepetitive(String(DEFAULTS.repetitive));
    setWetService(String(DEFAULTS.wetService));
    setDeflLimit(String(DEFAULTS.deflLimit));
    setIncludeSelf(DEFAULTS.includeSelf);
    setCalcInputs(DEFAULTS);
    setResults(calculateBeam(DEFAULTS));
  };

  const spanNum = parseFloat(spanFt);
  const liveNum = parseFloat(livePlf);
  const deadNum = parseFloat(deadPlf);

  const errors = {
    span: !Number.isFinite(spanNum) || spanNum <= 0 || spanNum > 60 ? "Enter a span of 0.1–60 ft" : "",
    live: !Number.isFinite(liveNum) || liveNum < 0 ? "Live load cannot be negative" : "",
    dead: !Number.isFinite(deadNum) || deadNum < 0 ? "Dead load cannot be negative" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const verdict = results.ok ? (results.governingUc <= 1 ? "Passes all four limit states" : "Fails — resize the beam") : "";
  const passColor = results.governingUc <= 1 ? "text-emerald-600" : "text-destructive";

  const faqs = [
    {
      question: "How do I know if a 2x10 beam is big enough for my span?",
      answer:
        "Compare the four unity checks in the breakdown table against 1.00. Bending and deflection almost always govern on residential spans, and deflection usually wins as the span grows: deflection scales with the fourth power of span while bending stress only scales with the square. A 2x10 in Douglas Fir-Larch carrying 40 lb/ft live plus 10 lb/ft dead passes bending at 12 ft with a ratio near 0.45, but the same beam at 20 ft approaches its live-deflection limit before its bending limit. Shear rarely governs on slender sawn beams except on very short, heavily loaded spans.",
    },
    {
      question: "What is the allowable bending stress of a wood beam?",
      answer:
        "It is the tabulated reference value from the grading rules multiplied by the applicable adjustment factors. Reference values for visually graded No.2 lumber at normal duration come from the NDS Supplement 2018 Table 4A — 900 psi for Douglas Fir-Larch, 850 psi for Hem-Fir and Southern Pine, 875 psi for Spruce-Pine-Fir. On top of that, this calculator applies the load duration factor, the size factor that ranges from 1.5 for a 2x4 down to 1.0 for a 2x12, the repetitive member factor of 1.15 when three or more members are spaced 24 inches or less on centre, and the wet service factor when the beam stays above 19 percent moisture content.",
    },
    {
      question: "What deflection limit should I use for a floor beam?",
      answer:
        "The International Residential Code sets a live-load limit of L/360 for floors and L/240 for the combined live plus dead deflection; roof members default to L/180 for live load with L/240 total. L/360 on a 12 foot span means the floor cannot deflect more than 0.4 inches under live load. Use L/480 or L/600 when the beam supports tile, stone, or a brittle ceiling finish, because those materials crack well before the code minimum is reached. The total-deflection figure is checked against L/240 automatically, so both limits are always visible.",
    },
    {
      question: "Does the beam's own weight matter?",
      answer:
        "On long spans it does. Self-weight follows from density: Douglas Fir-Larch is roughly 0.50 specific gravity, about 31 pounds per cubic foot, so a 2x10 adds only 3 pounds per foot while a 6x12 adds almost 23 pounds per foot. That extra load sits at the worst possible place from the beam's point of view — spread along the whole span — so it increases both bending moment and deflection. Over a 20 foot span a 6x12 contributes more than 460 pounds of load that the design must carry, which is why the field is included in the calculation rather than left out.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator/engineering" },
          { label: "Timber Beam Bending Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Timber Beam Bending Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Beam & Span">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="span"
                  label="Span"
                  value={spanFt}
                  onChange={setSpanFt}
                  onEnter={runCalculate}
                  min="0.1"
                  max="60"
                  step="0.5"
                  suffix="ft"
                  error={errors.span}
                  hint="Clear span between supports."
                  tooltip="Distance between bearing points, not the total lumber length."
                />
                <CompactSelect
                  id="size"
                  label="Beam Size"
                  value={size}
                  onChange={setSize}
                  options={SIZES.map((s) => ({ value: s.key, label: s.label }))}
                  tooltip="Surfaced dimensions used for section properties. Doubled and tripled members assume load sharing."
                />
              </div>
            </SubSection>

            <SubSection title="Loading">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="live"
                  label="Live Load"
                  value={livePlf}
                  onChange={setLivePlf}
                  onEnter={runCalculate}
                  min="0"
                  step="0.5"
                  suffix="lb/ft"
                  error={errors.live}
                  hint="Occupancy or snow load."
                  tooltip="Uniform live load in pounds per lineal foot. Floors 40, decks 40-60, roofs from the ground snow load."
                />
                <CompactInput
                  id="dead"
                  label="Dead Load"
                  value={deadPlf}
                  onChange={setDeadPlf}
                  onEnter={runCalculate}
                  min="0"
                  step="0.5"
                  suffix="lb/ft"
                  error={errors.dead}
                  hint="Floor build-up above."
                  tooltip="Permanent uniform load: subfloor, joists, ceiling and finishes carried by the beam."
                />
              </div>
            </SubSection>

            <SubSection title="Species">
              <CompactSelect
                id="species"
                label="Species & Grade"
                value={species}
                onChange={setSpecies}
                options={SPECIES.map((s) => ({ value: s.key, label: s.label }))}
                tooltip="Reference design values from the NDS Supplement 2018, Table 4A, visually graded No.2."
              />
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Extra Loading">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="point"
                        label="Point Load"
                        value={pointLb}
                        onChange={setPointLb}
                        onEnter={runCalculate}
                        min="0"
                        step="50"
                        suffix="lb"
                        hint="Mid-span, leave 0 if none."
                        tooltip="A concentrated load at mid-span, such as a post, hoist or hanging load. Adds P times L divided by 4 to the moment."
                      />
                      <CompactSelect
                        id="self"
                        label="Beam Self-Weight"
                        value={includeSelf}
                        onChange={setIncludeSelf}
                        options={[
                          { value: "yes", label: "Include in design load" },
                          { value: "no", label: "Exclude" },
                        ]}
                        tooltip="Self-weight is computed from the species density and the surfaced dimensions."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Adjustment Factors">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="duration"
                        label="Load Duration CD"
                        value={duration}
                        onChange={setDuration}
                        options={DURATION_OPTIONS}
                        tooltip="NDS load duration factor applied to both bending and shear allowables."
                      />
                      <CompactInput
                        id="repetitive"
                        label="Repetitive Cr"
                        value={repetitive}
                        onChange={setRepetitive}
                        onEnter={runCalculate}
                        min="1"
                        max="1.15"
                        step="0.05"
                        hint="1.15 for 3+ members."
                        tooltip="Use 1.15 when three or more sawn members are spaced 24 inches or less on centre and share the load."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="wet"
                        label="Wet Service CM"
                        value={wetService}
                        onChange={setWetService}
                        onEnter={runCalculate}
                        min="0.8"
                        max="1"
                        step="0.05"
                        hint="1.0 dry, 0.85 wet."
                        tooltip="Use 1.0 for dry service and about 0.85 for bending in wet service above 19 percent moisture content."
                      />
                      <CompactSelect
                        id="deflLimit"
                        label="Live Deflection Limit"
                        value={deflLimit}
                        onChange={setDeflLimit}
                        options={[
                          { value: "180", label: "L/180 — roof" },
                          { value: "240", label: "L/240 — roof or ceiling" },
                          { value: "360", label: "L/360 — floor" },
                          { value: "480", label: "L/480 — tile or stone" },
                          { value: "600", label: "L/600 — brittle finish" },
                        ]}
                        tooltip="International Residential Code Table R301.7 live-load deflection limits."
                      />
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.ok && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">
                  Enter a span up to 60 ft and a live or dead load above zero.
                </div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Governing Utilization</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.ok ? fmt(results.governingUc, 2) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.ok
                  ? `${results.governing} governs · ${verdict}`
                  : "Fill in the beam, span and loads to run the check"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bending fb / Fb'</span>
                <span className={`font-extrabold ${results.bendingUc <= 1 ? "text-foreground" : "text-destructive"}`}>
                  {fmt(results.bendingUc, 2)}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Live Deflection</span>
                <span className="font-extrabold text-foreground">{fmt(results.deflLive, 3)} in</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Moment</span>
                <span className="font-extrabold text-foreground">{fmt(results.momentLbFt, 0)} lb-ft</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Design Quantity</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                    <td className="p-2.5 pl-3 text-foreground">Result</td>
                    <td className={`p-2.5 pr-3 text-right ${passColor}`}>
                      {results.ok ? (results.governingUc <= 1 ? "Adequate" : "Overstressed") : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Section modulus S</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.s, 2)} in³</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Moment of inertia I</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.i, 2)} in⁴</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Modulus E</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(results.e / 1000000, 2)} × 10⁶ psi
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Size factor CF</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.cf, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Actual fb</span>
                  <span className="text-base font-bold text-foreground">{psi(results.fb)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Allowable Fb'</span>
                  <span className="text-base font-bold text-foreground">{psi(results.fbAllow)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Shear fv / Fv'</span>
                  <span className="text-base font-bold text-foreground">
                    {psi(results.fv)} / {psi(results.fvAllow)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Live deflection ratio</span>
                  <span className="text-base font-bold text-foreground">
                    L/{results.deflRatio > 0 ? fmt(results.deflRatio, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Deflection limit</span>
                  <span className="text-base font-bold text-foreground">
                    L/{fmt(calcInputs.deflLimit, 0)} live, L/240 total
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total load carried</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.totalPlf, 1)} lb/ft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Timber Beam Bending Calculator?</h2>
            <p>
              A timber beam bending calculator checks whether a sawn lumber beam is strong and stiff enough for the span and load it has
              to carry. You enter the span, the beam size, the species and grade, and the uniform and concentrated loads, and it returns
              the bending stress, the allowable stress, the shear stress, and the deflection of the beam under load. Every quantity is
              computed from the section properties of the actual surfacing dimensions of the member, so a nominal 2x10 is analysed as the
              1.5 inch by 9.25 inch rectangle it really is rather than the name it is sold under.
            </p>
            <p>
              It is the check a builder makes before opening a wall, notching a floor joist or hanging a load from a ridge beam, and it
              is also the fastest way to answer the question everybody actually asks: is this beam big enough? Because the output is
              expressed as a utilization ratio against the governing limit state, the answer comes with the margin attached — a beam at
              0.45 has more than twice the stiffness the code asks for, while a beam at 1.30 is twenty percent over its allowable bending
              stress no matter how solid it looks in the yard.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator treats the beam as a simply supported member spanning between two bearing points. A uniform load produces a
              maximum bending moment of wL²/8, where the load is expressed in pounds per inch and the span in inches, and a mid-span
              point load adds PL/4 to that moment. Maximum shear is half the total load for a uniform load plus half the point load.
              Section modulus and moment of inertia follow from the rectangle geometry, with S equal to bd²/6 and I equal to bd³/12, and
              the actual bending stress is simply the moment divided by the section modulus.
            </p>
            <p>
              The allowable stress is where the engineering lives. Reference design values are taken from the NDS Supplement 2018 Table
              4A for visually graded No.2 lumber — 900 psi for Douglas Fir-Larch, 850 psi for Hem-Fir and Southern Pine, 875 psi for
              Spruce-Pine-Fir — and each is adjusted by four factors. The load duration factor ranges from 0.9 for permanent loading to
              1.6 for a ten-minute wind gust, reflecting that wood carries a short overload better than a permanent one. The size factor
              reduces the allowable stress as the member gets deeper, from 1.5 on a 2x4 down to 1.0 on a 2x12, because the odds of a
              strength-reducing defect being present in the critical zone increase with volume. The repetitive member factor of 1.15
              credits load sharing between three or more closely spaced members, and the wet service factor reduces capacity where
              moisture content stays above 19 percent.
            </p>
            <p>
              Deflection is calculated separately for the live load alone and for the combined live plus dead load, using the standard
              uniform-load formula 5wL⁴/384EI plus the point-load term PL³/48EI. Both are compared with the code limits: the live load
              against the selected limit of L/180, L/240, L/360, L/480 or L/600, and the total load against L/240. Beam self-weight is
              included by default, computed from the species density — about 31 pounds per cubic foot for Douglas Fir-Larch — so the
              answer already accounts for the weight of the beam that carries it.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The headline is the governing utilization ratio, the largest of the four checks: bending, shear, live deflection and total
              deflection. A ratio at or below 1.00 means the beam passes every limit state; above 1.00 the number tells you by how much
              it fails, and the summary panel names the limit state that governs. The three-stat bar puts bending ratio, live deflection
              and maximum moment side by side, which is usually enough to see whether strength or stiffness is driving the design.
            </p>
            <p>
              Read the breakdown table to see which adjustment factors are doing the work. Moving from a 2x10 to a doubled 2x10 changes
              the section modulus and the moment of inertia, and both the size factor and the tabulated values change with the species.
              If bending governs, the fix is stiffness in depth or a stronger species; if deflection governs, depth matters far more than
              width, since deflection falls with the cube of depth. Where the ratio sits between 0.85 and 1.00 the beam is passing but
              with little margin — worth revisiting if the loading assumptions were approximate. This tool is a design aid, not a sealed
              structural design; stamped plans and a qualified engineer are still required for anything load-bearing.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/timber-beam-bending-calculator" />
          <PopularCalculators exclude="/calculator/timber-beam-bending-calculator" />
        </div>
      </div>
    </>
  );
}
