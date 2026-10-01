"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  ENCODINGS,
  countCodePoints,
  decodeBytes,
  encodeText,
  formatBytes,
  parseBytes,
  type ByteFormat,
  type EncodingId,
} from "@/domains/writing/lib/text/encoding.ts";

/**
 * Character encoding converter, backed by the in-house codecs in `encoding.ts`.
 *
 * Both directions are handled: text to bytes in any of the eight encodings,
 * and bytes back to text with the same codec. Nothing is delegated to the
 * platform's `TextDecoder` label list, because their "latin1" and "ascii"
 * labels actually decode as Windows-1252; the mapping here is the one the
 * label says. Characters a code page cannot hold are reported — never silently
 * dropped — and invalid byte sequences decode to U+FFFD with a count.
 */
type Mode = "encode" | "decode";

const FORMATS: { value: ByteFormat; label: string }[] = [
  { value: "hex", label: "Hex bytes (C3 A9)" },
  { value: "base64", label: "Base64" },
  { value: "escaped", label: "Escaped (\\xC3\\xA9)" },
];

const HEX_DUMP_BYTES = 128;

export default function CharacterEncodingConverterTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [encoding, setEncoding] = useState<EncodingId>("utf-8");
  const [format, setFormat] = useState<ByteFormat>("hex");
  const [inputFormat, setInputFormat] = useState<ByteFormat>("hex");
  const [rawText, setRawText] = useState("");
  const [rawBytes, setRawBytes] = useState("");

  const text = useDebouncedValue(rawText, 250);
  const byteInput = useDebouncedValue(rawBytes, 250);

  const encoded = useMemo(() => encodeText(text, encoding), [text, encoding]);
  const output = useMemo(() => formatBytes(encoded.bytes, format), [encoded.bytes, format]);

  const parsed = useMemo(
    () => (byteInput.trim().length === 0 ? null : parseBytes(byteInput, inputFormat)),
    [byteInput, inputFormat],
  );
  const decoded = useMemo(
    () => (parsed && parsed.ok ? decodeBytes(parsed.bytes, encoding) : null),
    [parsed, encoding],
  );

  const hexRows = useMemo(() => {
    const rows: { offset: string; hex: string; ascii: string }[] = [];
    const bytes = encoded.bytes;
    const limit = Math.min(bytes.length, HEX_DUMP_BYTES);
    for (let index = 0; index < limit; index += 16) {
      const slice = bytes.slice(index, index + 16);
      const pairs: string[] = [];
      let ascii = "";
      for (const byte of slice) {
        pairs.push(byte.toString(16).toUpperCase().padStart(2, "0"));
        ascii += byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : ".";
      }
      rows.push({
        offset: index.toString(16).toUpperCase().padStart(4, "0"),
        hex: pairs.join(" "),
        ascii,
      });
    }
    return rows;
  }, [encoded.bytes]);

  const encodingOptions = ENCODINGS.map((entry) => ({ value: entry.id, label: entry.label }));
  const activeEncoding = ENCODINGS.find((entry) => entry.id === encoding);
  const hasText = text.length > 0;
  const hasBytes = byteInput.trim().length > 0;

  const copyText = mode === "encode" ? output : decoded?.text ?? "";

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Conversion</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="mode"
            label="Direction"
            value={mode}
            onChange={(next) => setMode(next as Mode)}
            options={[
              { value: "encode", label: "Text → bytes" },
              { value: "decode", label: "Bytes → text" },
            ]}
          />
          <Select
            name="encoding"
            label="Encoding"
            value={encoding}
            onChange={(next) => setEncoding(next as EncodingId)}
            options={encodingOptions}
            hint={activeEncoding?.label}
          />
        </div>

        {mode === "encode" ? (
          <div className="mt-3 space-y-3">
            <TextArea
              name="text"
              label="Text to encode"
              value={rawText}
              onChange={setRawText}
              rows={7}
              placeholder={"café — €10 😀"}
            />
            <Select
              name="format"
              label="Byte output format"
              value={format}
              onChange={(next) => setFormat(next as ByteFormat)}
              options={FORMATS.map((entry) => ({ value: entry.value, label: entry.label }))}
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <TextArea
              name="bytes"
              label="Bytes to decode"
              value={rawBytes}
              onChange={setRawBytes}
              rows={7}
              placeholder={"C3 A9"}
            />
            <Select
              name="input-format"
              label="Input format"
              value={inputFormat}
              onChange={(next) => setInputFormat(next as ByteFormat)}
              options={FORMATS.map((entry) => ({ value: entry.value, label: entry.label }))}
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={copyText} testid="copy-output" label="Copy result" />
          <DownloadButton
            text={copyText}
            filename={mode === "encode" ? "encoded-bytes.txt" : "decoded-text.txt"}
            testid="download-output"
            label="Download"
          />
        </div>
        {activeEncoding && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{activeEncoding.detail}</p>
        )}
      </Panel>

      {mode === "encode" ? (
        <>
          <Panel>
            <PanelTitle>Result</PanelTitle>
            {!hasText ? (
              <EmptyState>Type or paste text above — the bytes appear as you type.</EmptyState>
            ) : (
              <>
                <HeroStat
                  label="Bytes"
                  value={encoded.bytes.length}
                  testid="res-bytes"
                  sub={`${countCodePoints(text)} code point${countCodePoints(text) === 1 ? "" : "s"} in, ${encoded.bytes.length} byte${encoded.bytes.length === 1 ? "" : "s"} out`}
                />
                <StatGrid>
                  <Stat label="Characters replaced" value={encoded.lossy.length} testid="res-lossy" />
                  <Stat label="Input characters" value={countCodePoints(text)} testid="res-characters" />
                  <Stat label="Code points" value={Array.from(text).length} testid="res-codepoints" />
                </StatGrid>
                {encoded.lossy.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <Notice tone="warn">
                      {encoded.lossy.length} character{encoded.lossy.length === 1 ? "" : "s"} cannot be represented in{" "}
                      {activeEncoding?.label ?? encoding} and {encoded.lossy.length === 1 ? "is" : "are"} written as
                      &quot;?&quot;. The report below lists each one so nothing is lost silently.
                    </Notice>
                    <ul data-testid="res-lossy-list" className="space-y-1 text-xs text-muted-foreground">
                      {encoded.lossy.slice(0, 40).map((entry) => (
                        <li key={`${entry.index}-${entry.codePoint}`}>
                          <code className="font-mono text-foreground">{entry.character}</code> (U+
                          {entry.codePoint.toString(16).toUpperCase().padStart(4, "0")}) at position {entry.index} —
                          written as ?
                        </li>
                      ))}
                    </ul>
                    {encoded.lossy.length > 40 && (
                      <p className="text-xs text-muted-foreground">
                        Showing the first 40 of {encoded.lossy.length} replaced characters.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3">
                    <Notice>
                      Every character is representable in {activeEncoding?.label ?? encoding}; no substitution was
                      needed.
                    </Notice>
                  </div>
                )}
              </>
            )}
          </Panel>

          {hasText && (
            <Panel>
              <PanelTitle
                right={
                  <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    first {encoded.bytes.length > HEX_DUMP_BYTES ? HEX_DUMP_BYTES : encoded.bytes.length} bytes
                  </span>
                }
              >
                {FORMATS.find((entry) => entry.value === format)?.label}
              </PanelTitle>
              <pre
                data-testid="res-output"
                className="max-h-52 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground"
              >
                {output}
              </pre>
              {hexRows.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table data-testid="res-byte-table" className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        <th className="py-1 pr-3 font-semibold">Offset</th>
                        <th className="py-1 pr-3 font-semibold">Bytes</th>
                        <th className="py-1 font-semibold">ASCII</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hexRows.map((row) => (
                        <tr key={row.offset} className="border-t border-border/50">
                          <td className="py-1 pr-3 text-muted-foreground">{row.offset}</td>
                          <td className="py-1 pr-3 text-foreground">{row.hex}</td>
                          <td className="py-1 text-muted-foreground">{row.ascii}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                No byte-order mark is added. A BOM in decoded input is treated as an ordinary character.
              </p>
            </Panel>
          )}
        </>
      ) : (
        <Panel>
          <PanelTitle>Decoded text</PanelTitle>
          {!hasBytes ? (
            <EmptyState>Paste bytes above in the chosen format.</EmptyState>
          ) : parsed && !parsed.ok ? (
            <Notice tone="error">
              <span data-testid="res-error">{parsed.error}</span>
            </Notice>
          ) : decoded ? (
            <>
              <StatGrid>
                <Stat label="Bytes in" value={parsed && parsed.ok ? parsed.bytes.length : 0} testid="res-bytes-in" />
                <Stat label="Replacement characters" value={decoded.replacements} testid="res-replacements" />
                <Stat label="Characters out" value={countCodePoints(decoded.text)} testid="res-characters-out" />
              </StatGrid>
              <pre
                data-testid="res-decoded"
                className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground"
              >
                {decoded.text}
              </pre>
              {decoded.replacements > 0 && (
                <div className="mt-3">
                  <Notice tone="warn">
                    {decoded.replacements} byte sequence{decoded.replacements === 1 ? "" : "s"} could not be decoded as
                    valid {activeEncoding?.label ?? encoding} and became U+FFFD (�). The bytes are not a valid sequence,
                    or they were encoded with a different code page.
                  </Notice>
                </div>
              )}
            </>
          ) : null}
        </Panel>
      )}

      <Panel>
        <PanelTitle>What this does and cannot do</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Every codec is written out in this bundle: the Windows-1252 block, Latin-1, strict ASCII, UTF-8, UTF-16
            and UTF-32. That matters because browser labels are not literal — a decoder asked for &quot;ascii&quot; or
            &quot;latin1&quot; silently returns Windows-1252. Here the label says what the bytes are.
          </Notice>
          <Notice tone="warn">
            Single-byte encodings cannot hold most of Unicode, so encoding reports each substitution instead of hiding
            it, and decoding flags bytes that are not valid with a count. Lossy conversion is a one-way door: the
            original characters cannot be recovered from the &quot;?&quot; bytes.
          </Notice>
          <Notice tone="warn">
            This is not a file inspector: it converts a string you paste. It does not detect an unknown file&apos;s
            encoding, and it does not attach a byte-order mark. Everything runs in the browser — nothing is uploaded.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
