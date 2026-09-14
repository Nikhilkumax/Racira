"use client";

import { useState } from "react";
import { Btn, FormGrid, Panel, PanelTitle, Sel, TextArea, TextInput } from "./ui";

const REASONS = [
  { value: "Design change", label: "Design change" },
  { value: "Error correction", label: "Error correction" },
  { value: "Manufacturing issue", label: "Manufacturing / fabrication issue" },
  { value: "Client request", label: "Client / owner request" },
  { value: "Code / standard update", label: "Code or standard update" },
  { value: "Field change", label: "Field / site change" },
];

/**
 * Engineering Change Order Template — structured ECO document assembled from
 * form fields, ready to paste into a PLM system or issue as-is.
 */
export default function EngineeringChangeOrderTemplate() {
  const [number, setNumber] = useState("ECO-2026-001");
  const [title, setTitle] = useState("");
  const [requester, setRequester] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState(REASONS[0].value);
  const [desc, setDesc] = useState("");
  const [docs, setDocs] = useState("");
  const [generated, setGenerated] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <PanelTitle>Details</PanelTitle>
        <div className="space-y-3">
          <FormGrid>
            <TextInput name="number" label="ECO number" value={number} onChange={setNumber} />
            <TextInput name="date" label="Date" value={date} onChange={setDate} />
          </FormGrid>
          <TextInput name="title" label="Title" value={title} onChange={setTitle} placeholder="Bracket thickness revision" />
          <TextInput name="requester" label="Originator" value={requester} onChange={setRequester} placeholder="Name / department" />
          <Sel name="reason" label="Reason" value={reason} onChange={setReason} options={REASONS} />
          <TextArea
            name="desc"
            label="Change description"
            value={desc}
            onChange={setDesc}
            placeholder="What changes, why, and what it affects…"
            rows={4}
          />
          <TextArea
            name="docs"
            label="Affected documents"
            value={docs}
            onChange={setDocs}
            placeholder="ACM-M-DRG-007, ACM-M-DRG-008…"
            rows={2}
          />
          <Btn testid="generate-eco" onClick={() => setGenerated(true)} disabled={!title.trim() && !desc.trim()}>
            Generate ECO
          </Btn>
        </div>
      </Panel>
      <Panel>
        <PanelTitle>Document preview</PanelTitle>
        {!generated ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Fill in the details and press “Generate ECO” to assemble the document.
          </p>
        ) : (
          <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-sm">
            <div className="border-b border-border pb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Engineering Change Order</p>
              <p data-testid="out-eco-number" className="font-mono text-base font-semibold text-primary">{number || "ECO"}</p>
              <p data-testid="out-eco-title" className="font-medium">{title || "—"}</p>
            </div>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Date</dt><dd data-testid="out-eco-date" className="font-mono">{date}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Originator</dt><dd data-testid="out-eco-by" className="font-mono">{requester || "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Reason</dt><dd data-testid="out-eco-reason">{reason}</dd></div>
            </dl>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Change description</p>
              <p data-testid="out-eco-desc" className="whitespace-pre-wrap leading-relaxed">{desc || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Affected documents</p>
              <p data-testid="out-eco-docs" className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{docs || "—"}</p>
            </div>
            <p className="border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
              Approvals: Eng. ______  Mfg. ______  QA ______  Date ______
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
