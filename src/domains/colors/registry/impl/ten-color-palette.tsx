"use client";

import { useEffect, useState, type ReactNode } from "react";
import { InlineColorPicker } from "@/domains/colors/components/inline-color-picker";
import { Swatch } from "@/domains/colors/components/swatch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { harmonyColors, isCompleteHex, isValidColor, toHex } from "@/domains/colors/lib/color";
import { cn } from "@/lib/utils";

function Section({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>}
      {children}
    </div>
  );
}

/**
 * The strip wraps into as many columns as the right-hand column can hold, so a
 * larger harmony rule (up to five swatches) grows the grid downward instead of
 * overflowing the card.
 *
 * Single column on phones: below sm the swatches are narrower than the hex value
 * plus Copy button they have to hold, and the strip is inside the card here, so it
 * has less room than a full-width row would. Short rules pair up two-by-two from
 * sm, and the longer ones go three across from lg — which keeps the grid roughly
 * as tall as the picker beside it on desktop.
 */
function PaletteStrip({ colors }: { colors: string[] }) {
  const columns = colors.length <= 3
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={cn("grid gap-3", columns)}>
      {colors.map((c, i) => <Swatch key={i} color={c} size="lg" />)}
    </div>
  );
}

/**
 * The hex field keeps its own draft text so whatever the user is currently
 * typing sits in the field untouched. Only a complete 3- or 6-digit hex is
 * committed to the colour; partial or invalid text never is. The draft text is
 * replaced from the committed value only when the colour changes from
 * elsewhere (picker, eyedropper, RGB fields) — not when this field's own
 * commit is what changed it, which would snap a partial edit back into a full
 * colour mid-keystroke.
 */
function BaseHexField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => {
    setText((prev) => (isValidColor(prev) && toHex(prev) === value ? prev : value));
  }, [value]);
  return (
    <Input
      id="ten-color-base"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        if (isCompleteHex(e.target.value)) onChange(toHex(e.target.value));
      }}
      className="font-mono uppercase"
    />
  );
}

/**
 * 10-Color Palette Generator.
 *
 * A one-off page: every other palette generator keeps the shared
 * <PaletteGenerator>, whose swatch opens the browser colour picker as a popup.
 * Here that picker is rendered inline, permanently open, inside the Color card.
 *
 * The card is split into two columns from md up — the picker on the left, and the
 * Harmony control with the generated swatches on the right — so the whole tool
 * fits a desktop viewport instead of running past the fold. Below md the same two
 * blocks simply stack.
 */
export function TenColorPaletteGenerator() {
  const [base, setBase] = useState("#3B82F6");
  const [kind, setKind] = useState<string>("analogous");
  const colors = harmonyColors(base, kind);

  return (
    <Section>
      <div className="grid gap-6 md:grid-cols-[264px_minmax(0,1fr)]">
        {/* Left: base color + the always-open picker, unchanged. */}
        <div className="grid content-start gap-6">
          <div className="grid gap-2">
            <Label htmlFor="ten-color-base">Color</Label>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-10 w-12 shrink-0 rounded-md border border-input"
                style={{ backgroundColor: base }}
              />
              <BaseHexField value={base} onChange={setBase} />
            </div>
          </div>

          <InlineColorPicker value={base} onChange={setBase} />
        </div>

        {/* Right: the space beside the picker now holds Harmony and the palette. */}
        <div className="grid content-start gap-4">
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

          <PaletteStrip colors={colors} />
        </div>
      </div>
    </Section>
  );
}
