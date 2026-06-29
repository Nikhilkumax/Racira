"use client";
import { useMemo, useState } from "react";
import { Field, TextArea, Result } from "../ui";
import { keccak_256 } from "@noble/hashes/sha3.js";

export function Keccak() {
  const [v, setV] = useState("");
  const out = useMemo(() => {
    if (!v) return null;
    const h = keccak_256(new TextEncoder().encode(v));
    return "0x" + Array.from(h).map((b) => b.toString(16).padStart(2, "0")).join("");
  }, [v]);
  return (
    <div className="space-y-4">
      <Field label="Input (UTF-8)"><TextArea value={v} onChange={(e) => setV(e.target.value)} /></Field>
      {out && <Result label="Keccak-256" value={out} ok />}
    </div>
  );
}
