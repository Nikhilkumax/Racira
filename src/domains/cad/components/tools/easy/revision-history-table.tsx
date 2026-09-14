"use client";

import { useState } from "react";
import { Btn, Panel, PanelTitle, TextInput } from "./ui";

type Rev = { rev: string; date: string; desc: string; by: string };

const nextRev = (n: number): string => {
  if (n >= 26) return "Z+";
  return String.fromCharCode(65 + n);
};

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Revision History Table — build a drawing revision block. Revisions are
 * lettered A, B, C… in order and rendered as a standard title-block table.
 */
export default function RevisionHistoryTable() {
  const [rows, setRows] = useState<Rev[]>([]);
  const [rev, setRev] = useState("A");
  const [date, setDate] = useState(today);
  const [desc, setDesc] = useState("");
  const [by, setBy] = useState("");

  const add = () => {
    if (!desc.trim()) return;
    setRows((r) => [...r, { rev: rev || nextRev(r.length), date: date || today(), desc: desc.trim(), by: by.trim() }]);
    setRev(nextRev(rows.length + 1));
    setDesc("");
    setBy("");
  };

  const remove = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Panel>
        <PanelTitle>Add revision</PanelTitle>
        <div className="space-y-3">
          <TextInput name="rev" label="Revision" value={rev} onChange={setRev} placeholder="A" />
          <TextInput name="date" label="Date" value={date} onChange={setDate} />
          <TextInput name="desc" label="Description" value={desc} onChange={setDesc} placeholder="Preliminary issue" />
          <TextInput name="by" label="By" value={by} onChange={setBy} placeholder="Initials" />
          <Btn testid="add-rev" onClick={add} disabled={!desc.trim()}>Add revision</Btn>
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Title-block table ({rows.length})</PanelTitle>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">No revisions yet — add the first one.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Rev</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Description</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">By</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0" data-testid={`rev-row-${i}`}>
                    <td className="px-3 py-2 font-mono text-xs font-semibold">{r.rev}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.date}</td>
                    <td className="px-3 py-2 text-xs">{r.desc}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.by || "—"}</td>
                    <td className="px-2 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
