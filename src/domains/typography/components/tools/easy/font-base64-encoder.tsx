"use client";

import { useRef, useState } from "react";
import { Btn, CodeOut, Panel, PanelTitle, Res, ResBox, Sel, TextInput, fmt, fmtTrim } from "../ui";

const MIMES = [
  { value: "auto", label: "Detect from extension" },
  { value: "font/woff2", label: "font/woff2" },
  { value: "font/woff", label: "font/woff" },
  { value: "font/ttf", label: "font/ttf" },
  { value: "font/otf", label: "font/otf" },
];

const MIME_BY_EXT: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
};

/**
 * Font Base64 Encoder — reads a font file locally in the browser and emits a
 * `data:` URI that can be pasted straight into `src: url(...)`. The panel
 * reports the base64 inflation (~33% over the binary) so the cost of inlining
 * a font is visible before it is committed to a stylesheet. Nothing is
 * uploaded — the FileReader API runs on the local file only.
 */
export default function FontBase64Encoder() {
  const [name, setName] = useState("");
  const [mime, setMime] = useState("auto");
  const [data, setData] = useState("");
  const [family, setFamily] = useState("My Font");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const bytes = data ? Math.ceil(((data.split(",")[1] ?? "").length * 3) / 4) : 0;
  const detect = (n: string) => MIME_BY_EXT[n.split(".").pop()?.toLowerCase() ?? ""] ?? "font/woff2";
  const effectiveMime = mime === "auto" ? detect(name) : mime;
  const dataUri = data ? `data:${effectiveMime};charset=utf-8;base64,${data.split(",")[1] ?? ""}` : "";

  const css = dataUri
    ? `@font-face {
  font-family: "${family}";
  src: url("${dataUri.slice(0, 96)}…") format("${effectiveMime.replace("font/", "")}");
  font-display: swap;
}`
    : `/* pick a font file to generate @font-face */`;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelTitle>Source file</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="family" label="CSS family name" value={family} onChange={setFamily} />
          <Sel name="mime" label="MIME type" value={mime} onChange={setMime} options={MIMES} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            data-testid="font-file"
            type="file"
            accept=".woff2,.woff,.ttf,.otf,.eot,font/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setName(f.name);
              const reader = new FileReader();
              reader.onload = () => setData(String(reader.result ?? ""));
              reader.readAsDataURL(f);
            }}
          />
          <Btn onClick={() => inputRef.current?.click()} testid="pick-font">
            Choose font file
          </Btn>
          {name && <span className="font-mono text-xs text-muted-foreground">{name}</span>}
          <Btn
            kind="ghost"
            onClick={() => {
              setData("");
              setName("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={!name}
          >
            Clear
          </Btn>
        </div>
        <ResBox>
          <Res name="mime" label="Effective MIME" value={effectiveMime} />
          <Res name="binary" label="Binary size" value={data ? `${fmtTrim(bytes / 1024, 1)} KB` : "—"} />
          <Res
            name="base64"
            label="Base64 size"
            value={data ? `${fmtTrim(((data.split(",")[1] ?? "").length) / 1024, 1)} KB (+${fmt(data ? 33.3 : 0, 1)}%)` : "—"}
          />
          <Res name="uri" label="Data URI length" value={data ? `${fmt(data.length, 0)} chars` : "—"} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <CodeOut
          code={dataUri || "/* no file selected */"}
          title="data: URI"
          testid="base64-uri"
          language="text"
        />
        <CodeOut code={css} title="Usage" testid="base64-css" />
        <Panel>
          <PanelTitle>When inlining is worth it</PanelTitle>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>· One small, critical font (subset under ~15KB) — saves one request on the critical path.</li>
            <li>· A generated SVG/HTML artifact that must be self-contained and cannot fetch extra files.</li>
            <li>· An email signature or template where external requests are stripped.</li>
            <li>· Not for a full alphabet font: base64 blocks HTML parsing and cancels the browser's font cache.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
