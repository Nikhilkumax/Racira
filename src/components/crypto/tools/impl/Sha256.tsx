"use client";
import { useMemo, useState } from "react";
import { Field, TextArea, Result } from "../ui";
import { sha256 } from "@noble/hashes/sha2.js";

export function Sha256() {
  const [v, setV] = useState("");
  const out = useMemo(() => {
    if (!v) return null;
    const h = sha256(new TextEncoder().encode(v));
    return Array.from(h).map((b) => b.toString(16).padStart(2, "0")).join("");
  }, [v]);
  return (
    <div className="space-y-4">
      <Field label="Input (UTF-8)"><TextArea value={v} onChange={(e) => setV(e.target.value)} /></Field>
      {out && <Result label="SHA-256" value={out} ok />}
    </div>
  );
}
