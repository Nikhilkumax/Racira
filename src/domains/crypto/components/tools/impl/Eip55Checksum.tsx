"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";
import { keccak_256 } from "@noble/hashes/sha3.js";

export function Eip55Checksum() {
  const [v, setV] = useState("");
  const out = useMemo(() => {
    const s = v.trim().toLowerCase().replace(/^0x/, "");
    if (!/^[0-9a-f]{40}$/.test(s)) return null;
    const hash = keccak_256(new TextEncoder().encode(s));
    const hex = Array.from(hash).map((b) => b.toString(16).padStart(2, "0")).join("");
    let o = "0x";
    for (let i = 0; i < 40; i++) o += parseInt(hex[i], 16) >= 8 ? s[i].toUpperCase() : s[i];
    return o;
  }, [v]);
  return (
    <div className="space-y-4">
      <Field label="Address (any case)">
        <Input placeholder="0x..." value={v} onChange={(e) => setV(e.target.value)} />
      </Field>
      {out ? <Result label="EIP-55 Checksum" value={out} ok /> : v && <Result label="Status" value="Invalid 40-hex address" ok={false} />}
    </div>
  );
}
