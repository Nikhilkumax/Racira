"use client";
import { useMemo, useState } from "react";
import { ToolShell, Field, NumberInput, TextInput } from "../ui";

export function BatchRenamer() {
  const [files, setFiles] = useState<string[]>([]);
  const [pattern, setPattern] = useState("Trip_{n}");
  const [start, setStart] = useState(1);
  const [pad, setPad] = useState(3);

  const preview = useMemo(() => {
    return files.map((name, i) => {
      const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
      const n = String(start + i).padStart(pad, "0");
      const out = pattern.replace(/\{n\}/g, n).replace(/\{name\}/g, name.replace(ext, ""));
      return { from: name, to: out + ext };
    });
  }, [files, pattern, start, pad]);

  return (
    <ToolShell note="Plan a rename pattern. Use {n} for the index and {name} for the original filename.">
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && setFiles(Array.from(e.target.files).map((f) => f.name))}
        className="block w-full cursor-pointer rounded-lg border border-dashed bg-background p-6 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
      />
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <Field label="Pattern"><TextInput value={pattern} onChange={(e) => setPattern(e.target.value)} /></Field>
        <Field label="Start number"><NumberInput value={start} onChange={(e) => setStart(+e.target.value)} /></Field>
        <Field label="Pad zeros"><NumberInput value={pad} onChange={(e) => setPad(+e.target.value)} /></Field>
      </div>
      {preview.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2 text-left">Original</th><th className="px-3 py-2 text-left">New name</th></tr>
            </thead>
            <tbody>
              {preview.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-1.5 text-muted-foreground">{p.from}</td>
                  <td className="px-3 py-1.5 font-medium text-primary">{p.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ToolShell>
  );
}
