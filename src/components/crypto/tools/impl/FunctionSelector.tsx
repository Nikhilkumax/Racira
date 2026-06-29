"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";
import { keccak_256 } from "@noble/hashes/sha3.js";

export function FunctionSelector() {
  const [sig, setSig] = useState("transfer(address,uint256)");
  const out = useMemo(() => {
    if (!sig.trim()) return null;
    const h = keccak_256(new TextEncoder().encode(sig.trim()));
    const hex = Array.from(h.slice(0, 4)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return "0x" + hex;
  }, [sig]);
  return (
    <div className="space-y-4">
      <Field label="Function signature">
        <Input value={sig} onChange={(e) => setSig(e.target.value)} placeholder="transfer(address,uint256)" />
      </Field>
      {out && <Result label="4-byte selector" value={out} ok />}
    </div>
  );
}
