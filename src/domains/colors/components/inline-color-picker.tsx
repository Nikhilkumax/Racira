"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isCompleteHex, isValidColor, rgbToHex, toHex, toRgb255 } from "@/domains/colors/lib/color";
import { cn } from "@/lib/utils";

/* ======================= HSV helpers ======================= */

/** Hue in degrees (0-360); saturation and brightness, both 0-1. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] :
    hp < 2 ? [x, c, 0] :
    hp < 3 ? [0, c, x] :
    hp < 4 ? [0, x, c] :
    hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = v - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

export function hexToHsv(hex: string): Hsv {
  const { r, g, b } = toRgb255(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/* ======================= Channel input ======================= */

function ChannelInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <Input
        value={text}
        inputMode="numeric"
        aria-label={`${label} channel`}
        className="h-8 px-2 font-mono text-xs"
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
          setText(next);
          if (next !== "") onChange(Math.max(0, Math.min(255, Number(next))));
        }}
      />
    </div>
  );
}

/* ======================= Picker ======================= */

/**
 * A colour picker that lives in the page rather than in a popup: the saturation /
 * brightness canvas, the hue bar, the screen eyedropper and the hex / RGB fields
 * are always rendered and there is no open, close or dismiss state at all.
 *
 * The visual parts mirror the browser's own colour picker so the control keeps the
 * look it had as a popup; only the popup wrapper and its close behaviour are gone.
 */
export function InlineColorPicker({
  value,
  onChange,
  className,
  fieldWidth = "max-w-[264px]",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  /** Shared cap for the canvas, hue bar and field rows so they line up. */
  fieldWidth?: string;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(toHex(value)));
  const [text, setText] = useState(() => toHex(value).toUpperCase());
  const [canPick, setCanPick] = useState(false);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  // Remembers the last hex this picker emitted itself. A saturation or brightness
  // of zero encodes to a hue-less hex, so re-deriving HSV from the hex we just
  // produced would throw the user's hue away mid-drag.
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    const next = toHex(value);
    // The draft text is only replaced when the colour changed from elsewhere;
    // if the current text already decodes to this colour it is what this field
    // (or the hex field above) just committed, so the raw typing stays put.
    setText((prev) => (isValidColor(prev) && toHex(prev) === next ? prev : next.toUpperCase()));
    if (next === lastEmitted.current) return;
    setHsv(hexToHsv(next));
  }, [value]);

  useEffect(() => {
    setCanPick(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  // The saturation/brightness field: a hue wash, white toward the left edge and
  // black toward the bottom.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { width, height } = canvas;
    const { r, g, b } = hsvToRgb(hsv.h, 1, 1);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, width, height);
    const white = ctx.createLinearGradient(0, 0, width, 0);
    white.addColorStop(0, "rgba(255, 255, 255, 1)");
    white.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = white;
    ctx.fillRect(0, 0, width, height);
    const black = ctx.createLinearGradient(0, 0, 0, height);
    black.addColorStop(0, "rgba(0, 0, 0, 0)");
    black.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = black;
    ctx.fillRect(0, 0, width, height);
  }, [hsv.h]);

  const hex = hsvToHex(hsv);
  const rgb = toRgb255(value);
  const width = cn("w-full", fieldWidth);

  function apply(next: Hsv) {
    setHsv(next);
    const nextHex = hsvToHex(next);
    lastEmitted.current = nextHex;
    onChange(nextHex);
  }

  function moveSv(clientX: number, clientY: number) {
    const el = svRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    apply({
      h: hsv.h,
      s: clamp01((clientX - rect.left) / rect.width),
      v: 1 - clamp01((clientY - rect.top) / rect.height),
    });
  }

  function moveHue(clientX: number) {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    apply({ h: clamp01((clientX - rect.left) / rect.width) * 360, s: hsv.s, v: hsv.v });
  }

  async function pickFromScreen() {
    const Ctor = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!Ctor) return;
    try {
      const result = await new Ctor().open();
      if (!result?.sRGBHex || !isValidColor(result.sRGBHex)) return;
      const next = toHex(result.sRGBHex);
      lastEmitted.current = next;
      setHsv(hexToHsv(next));
      onChange(next);
    } catch {
      /* the user dismissed the eyedropper without picking */
    }
  }

  function commitText(next: string) {
    setText(next);
    if (isCompleteHex(next)) onChange(toHex(next));
  }

  function setChannel(channel: "R" | "G" | "B", n: number) {
    const next = { r: rgb.r, g: rgb.g, b: rgb.b };
    next[channel.toLowerCase() as "r" | "g" | "b"] = n;
    onChange(rgbToHex(next.r, next.g, next.b));
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <div
        ref={svRef}
        role="img"
        aria-label={`Saturation and brightness field, current colour ${hex.toUpperCase()}`}
        className={cn("relative aspect-square cursor-crosshair touch-none overflow-hidden rounded-lg border border-border", width)}
        onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveSv(e.clientX, e.clientY);
        }}
        onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
          if (dragging.current) moveSv(e.clientX, e.clientY);
        }}
        onPointerUp={(e: ReactPointerEvent<HTMLDivElement>) => {
          dragging.current = false;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => { dragging.current = false; }}
      >
        <canvas ref={canvasRef} width={264} height={264} className="block h-full w-full" />
        <span
          aria-hidden
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: hex }}
        />
      </div>

      <div
        ref={hueRef}
        role="slider"
        tabIndex={0}
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        className={cn(
          "relative h-4 cursor-pointer touch-none rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          width,
        )}
        style={{ background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
        onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveHue(e.clientX);
        }}
        onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
          if (dragging.current) moveHue(e.clientX);
        }}
        onPointerUp={(e: ReactPointerEvent<HTMLDivElement>) => {
          dragging.current = false;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => { dragging.current = false; }}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 1;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") apply({ ...hsv, h: (hsv.h - step + 360) % 360 });
          else if (e.key === "ArrowRight" || e.key === "ArrowUp") apply({ ...hsv, h: (hsv.h + step) % 360 });
          else return;
          e.preventDefault();
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
        />
      </div>

      <div className={cn("flex items-center gap-2", width)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={pickFromScreen}
          disabled={!canPick}
          title={canPick ? "Pick a colour from anywhere on screen" : "Screen colour picking is not supported in this browser"}
        >
          <Pipette />
          <span className="sr-only">Pick a colour from the screen</span>
        </Button>
        <Input
          value={text}
          onChange={(e) => commitText(e.target.value)}
          aria-label="Hex colour"
          className="h-9 font-mono uppercase"
        />
        <span aria-hidden className="h-6 w-6 shrink-0 rounded-full border border-border" style={{ backgroundColor: hex }} />
      </div>

      <div className={cn("grid grid-cols-3 gap-2", width)}>
        <ChannelInput label="R" value={rgb.r} onChange={(n) => setChannel("R", n)} />
        <ChannelInput label="G" value={rgb.g} onChange={(n) => setChannel("G", n)} />
        <ChannelInput label="B" value={rgb.b} onChange={(n) => setChannel("B", n)} />
      </div>
    </div>
  );
}
