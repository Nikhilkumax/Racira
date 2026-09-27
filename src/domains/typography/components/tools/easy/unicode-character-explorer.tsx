"use client";

import { useMemo, useState } from "react";
import { CalcLayout, CopyBtn, Panel, PanelTitle, RefTable, Res, ResBox, TextInput } from "../ui";

/**
 * Unicode Character Explorer — browse the blocks that matter to typography,
 * with the code point range, block size and a printable sample. Samples are
 * curated, not generated: an entire block rendered blindly is mostly tofu.
 */
interface Block {
  name: string;
  start: number;
  end: number;
  sample: string;
}

const BLOCKS: Block[] = [
  { name: "Basic Latin", start: 0x0000, end: 0x007f, sample: "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789" },
  { name: "Latin-1 Supplement", start: 0x0080, end: 0x00ff, sample: "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏ ÑÒÓÔÕÖØÙÚÛÜÝ ßàáâãäåæçèéêëìíîï ñòóôõöøùúûüýÿ" },
  { name: "Latin Extended-A", start: 0x0100, end: 0x017f, sample: "ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ" },
  { name: "Greek and Coptic", start: 0x0370, end: 0x03ff, sample: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ αβγδεζηθικλμνξοπρστυφχψω" },
  { name: "Cyrillic", start: 0x0400, end: 0x04ff, sample: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ абвгдежзийклмнопрстуфхцчшщъыьэюя" },
  { name: "Hebrew", start: 0x0590, end: 0x05ff, sample: "אבגדהוזחטיכלמנסעפצקרשת" },
  { name: "Arabic", start: 0x0600, end: 0x06ff, sample: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي" },
  { name: "Devanagari", start: 0x0900, end: 0x097f, sample: "अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह" },
  { name: "Thai", start: 0x0e00, end: 0x0e7f, sample: "กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ" },
  { name: "Hiragana", start: 0x3040, end: 0x309f, sample: "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん" },
  { name: "Katakana", start: 0x30a0, end: 0x30ff, sample: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" },
  { name: "CJK Unified Ideographs", start: 0x4e00, end: 0x9fff, sample: "永字体设计排版汉字書体文字" },
  { name: "General Punctuation", start: 0x2000, end: 0x206f, sample: "– — ‘ ’ “ ” „ … † ‡ • ‰ ‱ ′ ″ ‹ › ⁄ ⁊ ⁐ ⁓" },
  { name: "Currency Symbols", start: 0x20a0, end: 0x20cf, sample: "€ £ ¥ ₩ ₪ ₫ ₭ ₮ ₱ ₲ ₴ ₵ ₸ ₹ ₺ ₼ ₽ ₾" },
  { name: "Letterlike Symbols", start: 0x2100, end: 0x214f, sample: "℀ ℁ ℂ ℃ ℉ ℊ ℋ ℌ ℍ ℎ ℏ ℐ ℑ ℒ ℓ ℔ ℕ № ℗ ℘ ℙ ℚ ℛ ℜ ℝ ℞ ℟ ℠ ℡ ™ ℣ ℤ Ω" },
  { name: "Arrows", start: 0x2190, end: 0x21ff, sample: "← ↑ → ↓ ↔ ↕ ↖ ↗ ↘ ↙ ↚ ↛ ↜ ↝ ↞ ↟ ↠ ↡ ↢ ↣ ↤ ↥ ↦ ↧" },
  { name: "Mathematical Operators", start: 0x2200, end: 0x22ff, sample: "∀ ∁ ∂ ∃ ∄ ∅ ∆ ∇ ∈ ∉ ∊ ∋ ∌ ∍ ∎ ∏ ∐ ∑ − ∓ ∔ ∕ ∖ ∗ ∘ ∙ √ ∛ ∜ ∝ ∞ ∟" },
  { name: "Box Drawing", start: 0x2500, end: 0x257f, sample: "─ ━ │ ┃ ┄ ┅ ┆ ┇ ┈ ┉ ┊ ┋ ┌ ┍ ┎ ┏ ┐ ┑ ┒ ┓ └ ┕ ┖ ┗ ┘ ┙ ┚ ┛" },
  { name: "Geometric Shapes", start: 0x25a0, end: 0x25ff, sample: "■ □ ▢ ▣ ▤ ▥ ▦ ▧ ▨ ▩ ▪ ▫ ▬ ▭ ▮ ▯ ▲ △ ▴ ▵ ▶ ▷ ▸ ▹ ▼ ▽ ▾ ▿ ◀ ◁" },
  { name: "Dingbats", start: 0x2700, end: 0x27bf, sample: "✁ ✂ ✃ ✄ ✅ ✆ ✇ ✈ ✉ ✊ ✋ ✌ ✍ ✎ ✏ ✐ ✑ ✒ ✓ ✔ ✕ ✖ ✗ ✘ ✙ ✚ ✛ ✜ ✝ ✞ ✟" },
  { name: "Emoji (pictographs)", start: 0x1f300, end: 0x1f5ff, sample: "🌀 🌈 🌍 🌞 🌟 🌠 🌰 🌱 🌲 🌳 🌴 🌵 🌶 🌷 🌸 🌹 🌺 🌻 🌼 🌽 🌾 🌿" },
  { name: "Emoji (symbols)", start: 0x1f600, end: 0x1f64f, sample: "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚" },
];

const hex = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");

export default function UnicodeCharacterExplorer() {
  const [query, setQuery] = useState("");
  const [inspect, setInspect] = useState("“");

  const blocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BLOCKS;
    return BLOCKS.filter(
      (b) => b.name.toLowerCase().includes(q) || hex(b.start).toLowerCase().includes(q) || hex(b.end).toLowerCase().includes(q),
    );
  }, [query]);

  const inspectChar = Array.from(inspect)[0] ?? "";
  const cp = inspectChar ? inspectChar.codePointAt(0) ?? 0 : NaN;
  const blockHit = inspectChar ? BLOCKS.find((b) => cp >= b.start && cp <= b.end) : undefined;

  const rows = blocks.map((b) => [
    <span key="n" className="font-medium text-foreground">{b.name}</span>,
    `U+${hex(b.start)} – U+${hex(b.end)}`,
    String(b.end - b.start + 1),
    <span key="s" className="break-all text-base leading-relaxed">{b.sample}</span>,
  ]);

  return (
    <div className="space-y-4">
      <CalcLayout>
        <Panel>
          <PanelTitle>Search & inspect</PanelTitle>
          <TextInput name="query" label="Filter blocks" value={query} onChange={setQuery} placeholder="latin, arrows, 1F600…" />
          <div className="mt-3">
            <TextInput name="inspect" label="Inspect a character" value={inspect} onChange={setInspect} placeholder="Paste any character" />
          </div>
          <ResBox>
            <Res name="count" label="Blocks shown" value={String(blocks.length)} />
            <Res name="cp" label="Code point" value={inspectChar ? `U+${hex(cp)} (${cp})` : "—"} />
            <Res name="block" label="Block" value={blockHit?.name ?? "—"} />
            <Res name="bytes" label="UTF-8 bytes" value={inspectChar ? [...new TextEncoder().encode(inspectChar)].map((x) => x.toString(16).padStart(2, "0")).join(" ") : "—"} />
            <Res name="entity" label="HTML entity" value={inspectChar ? `&#x${hex(cp)};` : "—"} />
          </ResBox>
          {inspectChar && (
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-16 w-16 place-items-center rounded-lg border border-border bg-background text-4xl">{inspectChar}</span>
              <CopyBtn text={inspectChar} label="Copy character" testid="copy-inspect" />
            </div>
          )}
        </Panel>
        <Panel>
          <PanelTitle>Why blocks matter</PanelTitle>
          <p className="text-sm leading-relaxed text-foreground">
            A font is not one file of glyphs — it is a set of coverage claims. Each Unicode block a face covers costs
            design time and file size, which is why display fonts rarely cover more than Basic Latin plus a few
            punctuation blocks, while text families extend through Latin Extended, Greek and Cyrillic.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            When a glyph is missing, the browser falls back down the font stack for that character only. That is why a
            mixed-script page can render with three different typefaces and look fine — or terrible, if the fallbacks
            fight each other.
          </p>
        </Panel>
      </CalcLayout>

      <Panel>
        <PanelTitle>Blocks ({blocks.length})</PanelTitle>
        <RefTable cols={["Block", "Range", "Code points", "Sample"]} rows={rows} minWidth={720} note="Samples list printable characters only — every block contains unassigned or control code points too." />
      </Panel>
    </div>
  );
}
