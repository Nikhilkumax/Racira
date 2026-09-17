"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown, Printer, Clock, Settings, HardDrive } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

const DEFAULTS = {
  duration: "3.5",
  bitrate: "320",
  channels: "2",
  sampleRate: "44.1",
  bitDepth: "16",
  compression: "none",
  showAdvanced: false,
};

interface ResultType {
  fileSizeMB: number;
  fileSizeGB: number;
  fileSizeBytes: number;
  effectiveBitrateKbps: number;
  rawBitrateBps: number;
  compressionRatio: number;
  uncompressedMB: number;
  chartData: { name: string; mb: number; fill: string }[];
}

function safeParse(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function calculate(v: typeof DEFAULTS): ResultType {
  const duration = safeParse(v.duration);
  const bitrateKbps = safeParse(v.bitrate);
  const channels = safeParse(v.channels) === 0 ? 1 : safeParse(v.channels);
  const sampleRateKHz = safeParse(v.sampleRate);
  const bitDepth = safeParse(v.bitDepth) === 0 ? 1 : safeParse(v.bitDepth);
  const compression = v.compression;

  const durationSec = duration * 60;

  let rawBitrateBps = 0;
  let effectiveBitrateKbps = 0;
  let uncompressedBps = 0;

  if (compression === "none") {
    const sampleRateHz = sampleRateKHz * 1000;
    uncompressedBps = sampleRateHz * bitDepth * channels;
    rawBitrateBps = uncompressedBps;
    effectiveBitrateKbps = rawBitrateBps / 1000;
  } else {
    rawBitrateBps = bitrateKbps * 1000;
    effectiveBitrateKbps = bitrateKbps;
  }

  const fileSizeBytes = (rawBitrateBps * durationSec) / 8;
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  const fileSizeGB = fileSizeMB / 1024;

  const uncompressedMB = ((sampleRateKHz * 1000 * bitDepth * channels * durationSec) / 8) / (1024 * 1024);
  const compressionRatio = uncompressedMB > 0 && fileSizeMB < uncompressedMB && compression !== "none"
    ? uncompressedMB / Math.max(fileSizeMB, 0.0001)
    : 1;

  const commonBitrates = [64, 128, 192, 256, 320];
  const chartData = commonBitrates.map((br) => {
    const sizeMB = ((br * 1000 * durationSec) / 8) / (1024 * 1024);
    return {
      name: `${br}`,
      mb: Math.round(sizeMB * 100) / 100,
      fill: br === Math.round(effectiveBitrateKbps) ? "hsl(var(--primary))" : "#cbd5e1",
    };
  });

  return {
    fileSizeMB,
    fileSizeGB,
    fileSizeBytes,
    effectiveBitrateKbps,
    rawBitrateBps,
    compressionRatio,
    uncompressedMB,
    chartData,
  };
}

const fmtSize = (mb: number): string => {
  if (mb >= 1024) return (mb / 1024).toFixed(2) + " GB";
  return mb.toFixed(2) + " MB";
};

const CompactInput = ({ id, label, value, onChange, suffix, onKeyDown }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-base font-medium mb-1.5 text-foreground">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      <input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  </div>
);

const SelectInput = ({ id, label, value, onChange, options, onKeyDown }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-base font-medium mb-1.5 text-foreground">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className="h-10 px-3 text-base rounded-md border border-input bg-background shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export default function AudioFileSizeCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ResultType>(calculate(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(vals));
  }, []);

  const handleCalculate = () => setResult(calculate(vals));
  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const updateVal = (key: keyof typeof DEFAULTS, val: any) => setVals(prev => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is the best bitrate for MP3 audio?", answer: "320 kbps is the maximum MP3 bitrate and is considered 'near CD quality'. Most listeners cannot distinguish between 256 kbps and 320 kbps files and the original source, whereas 128 kbps is standard radio quality." },
    { question: "How large is an uncompressed WAV file?", answer: "CD-quality WAV uses 44.1 kHz sample rate, 16-bit depth, and 2 channels, producing a 1,411 kbps bitrate — roughly 10.5 MB per minute of stereo audio." },
    { question: "What is lossless compression (FLAC)?", answer: "FLAC and ALAC reduce file size by 30-50% without discarding any audio data, so playback is bit-for-bit identical to the uncompressed source." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Audio File Size Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Audio File Size Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* Left Column - Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="duration" label="Duration" value={vals.duration} onChange={(v: string) => updateVal('duration', v)} suffix="min" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleCalculate(); }} />
              <CompactInput id="bitrate" label="Bitrate" value={vals.bitrate} onChange={(v: string) => updateVal('bitrate', v)} suffix="kbps" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleCalculate(); }} />
            </div>

            {/* Advanced Tier */}
            <div>
              <button
                type="button"
                onClick={() => updateVal('showAdvanced', !vals.showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-3"
              >
                Advanced Options {vals.showAdvanced ? <ChevronDown className="h-3 w-3 rotate-180" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {vals.showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5" /> Format Details
                  </div>
                  <SelectInput
                    id="channels"
                    label="Channels"
                    value={vals.channels}
                    onChange={(v: string) => updateVal('channels', v)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => { if (e.key === 'Enter') handleCalculate(); }}
                    options={[
                      { value: "1", label: "1 — Mono" },
                      { value: "2", label: "2 — Stereo" },
                      { value: "5.1", label: "5.1 — Surround" },
                      { value: "7.1", label: "7.1 — Surround" },
                    ]}
                  />
                  <CompactInput id="sampleRate" label="Sample Rate" value={vals.sampleRate} onChange={(v: string) => updateVal('sampleRate', v)} suffix="kHz" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleCalculate(); }} />
                  <CompactInput id="bitDepth" label="Bit Depth" value={vals.bitDepth} onChange={(v: string) => updateVal('bitDepth', v)} suffix="bit" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleCalculate(); }} />
                  <SelectInput
                    id="compression"
                    label="Compression"
                    value={vals.compression}
                    onChange={(v: string) => updateVal('compression', v)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => { if (e.key === 'Enter') handleCalculate(); }}
                    options={[
                      { value: "none", label: "None (WAV)" },
                      { value: "lossless", label: "Lossless (FLAC)" },
                      { value: "lossy", label: "Lossy (MP3/AAC)" },
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button onClick={handleCalculate} className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="flex flex-col gap-4">
            {/* Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5" /> File Size
              </div>
              <div className="text-4xl font-bold text-primary my-1">{fmtSize(result.fileSizeMB)}</div>
              <div className="text-sm text-muted-foreground">Effective Bitrate: {result.effectiveBitrateKbps.toFixed(0)} kbps</div>
            </div>

            {/* 3-Stat Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Raw Bitrate</div>
                <div className="text-lg font-bold text-foreground">{(result.rawBitrateBps / 1000).toFixed(0)} kbps</div>
              </div>
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Channels</div>
                <div className="text-lg font-bold text-foreground">{vals.channels}</div>
              </div>
              <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Compression</div>
                <div className="text-lg font-bold text-foreground">{vals.compression === "none" ? "WAV" : vals.compression === "lossless" ? "FLAC" : "MP3"}</div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">Duration</td>
                    <td className="text-base py-2.5 px-3 text-right">{(safeParse(vals.duration) * 60).toFixed(0)} sec</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">Effective Bitrate</td>
                    <td className="text-base py-2.5 px-3 text-right">{result.effectiveBitrateKbps.toFixed(0)} kbps</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">File Size (Bytes)</td>
                    <td className="text-base py-2.5 px-3 text-right">{result.fileSizeBytes.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td className="text-base py-2.5 px-3 font-medium">File Size (MB)</td>
                    <td className="text-base py-2.5 px-3 text-right">{result.fileSizeMB.toFixed(2)} MB</td>
                  </tr>
                  {vals.compression !== "none" && (
                    <tr>
                      <td className="text-base py-2.5 px-3 font-medium">Uncompressed Equivalent</td>
                      <td className="text-base py-2.5 px-3 text-right">{result.uncompressedMB.toFixed(2)} MB</td>
                    </tr>
                  )}
                  {vals.compression !== "none" && result.compressionRatio > 1 && (
                    <tr className="bg-secondary/20 font-bold border-t-2 border-border">
                      <td className="text-base py-2.5 px-3">Compression Ratio</td>
                      <td className="text-base py-2.5 px-3 text-right">{result.compressionRatio.toFixed(1)}× smaller</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Recharts Bar Chart */}
            {mounted && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-4">File Size at Common Bitrates ({safeParse(vals.duration) * 60 > 0 ? (safeParse(vals.duration) * 60).toFixed(0) + "s" : "current length"})</h3>
                <LazyView minHeight={250}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v} MB`} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} formatter={(v: any) => [`${v} MB`, "Size"]} />
                      <Bar dataKey="mb" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </LazyView>
              </div>
            )}

            {/* Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Duration</span>
                  <span className="text-base font-bold text-foreground">{safeParse(vals.duration).toFixed(2)} min</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bitrate</span>
                  <span className="text-base font-bold text-foreground">{safeParse(vals.bitrate).toFixed(0)} kbps</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">File Size</span>
                  <span className="text-base font-bold text-primary">{fmtSize(result.fileSizeMB)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective Bitrate</span>
                  <span className="text-base font-bold text-foreground">{result.effectiveBitrateKbps.toFixed(0)} kbps</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sample Rate</span>
                  <span className="text-base font-bold text-foreground">{safeParse(vals.sampleRate).toFixed(1)} kHz</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bit Depth</span>
                  <span className="text-base font-bold text-foreground">{safeParse(vals.bitDepth).toFixed(0)} bit</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Article section */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Audio File Size Calculator?</h2>
            <p>
              An audio file size calculator estimates how much disk space or bandwidth a recording will consume based on its duration and bitrate. The core relationship is simple: file size in bytes equals the bitrate in bits per second multiplied by the duration in seconds, then divided by eight. For uncompressed formats such as WAV, the bitrate itself is derived from the sample rate, bit depth, and number of channels (for example 44.1 kHz × 16 bits × 2 channels ≈ 1,411 kbps). For compressed formats like MP3 or AAC, you supply the bitrate directly, and the calculator converts that into the resulting megabyte footprint.
            </p>
            <p>
              This tool is useful the moment you need to plan storage or delivery rather than just play audio. Whether you are a podcaster budgeting monthly hosting, a musician exporting a release, or an engineer sizing a streaming pipeline, knowing the file size up front lets you choose the right format and bitrate before you ever render the final file.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works and What the Outputs Mean</h2>
            <p>
              The primary output is the <strong>File Size</strong> in MB (or GB for long recordings), derived directly from your duration and bitrate in the formula <strong>(Duration × Bitrate × 1000) / 8 / 1024 / 1024</strong>. Directly beneath it the calculator reports the <strong>Effective Bitrate</strong> in kbps — the true data rate being applied — so you can confirm the trade-off you are making between quality and size. The 3-stat bar summarizes the raw bitrate, channel count, and compression format at a glance.
            </p>
            <p>
              The breakdown table reconciles every component: duration in seconds, effective bitrate, byte count, megabyte total, and — for compressed audio — the uncompressed equivalent plus a <strong>compression ratio</strong> showing how many times smaller your file is than raw PCM. The bar chart then plots your recording's size across common bitrates (64, 128, 192, 256, 320 kbps), highlighting your selected rate so you can immediately see how lowering or raising quality changes the footprint.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results and Next Steps</h2>
            <p>
              A larger file size means better fidelity but higher storage and streaming costs, so the result should drive a deliberate decision. At 320 kbps a three-and-a-half-minute track is about 8.4 MB, whereas the same track as a 44.1 kHz/16-bit WAV exceeds 35 MB — roughly four times larger for marginal audible benefit on most playback systems. Use the compression format control to model WAV, lossless FLAC, or lossy MP3/AAC and watch the compression ratio update. From there, plan your next move: size your podcast hosting tier by multiplying per-episode MB by your release cadence and listener count, or estimate streaming bandwidth by pairing your bitrate with expected monthly listens — both follow directly from the bitrate and size figures this calculator produces.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/audio-file-size-calculator" />
          <PopularCalculators exclude="/calculator/audio-file-size-calculator" />
        </div>
      </div>
    </>
  );
}
