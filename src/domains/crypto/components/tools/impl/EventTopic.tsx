"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";
import { keccak_256 } from "@noble/hashes/sha3.js";

export function EventTopic() {
  const [sig, setSig] = useState("Transfer(address,address,uint256)");
  const out = useMemo(() => {
    if (!sig.trim()) return null;
    const h = keccak_256(new TextEncoder().encode(sig.trim()));
    return "0x" + Array.from(h).map((b) => b.toString(16).padStart(2, "0")).join("");
  }, [sig]);
  return (
    <div className="space-y-4">
      <Field label="Event signature">
        <Input value={sig} onChange={(e) => setSig(e.target.value)} />
      </Field>
      {out && <Result label="topic0 (keccak-256)" value={out} ok />}
    </div>
  );
}
