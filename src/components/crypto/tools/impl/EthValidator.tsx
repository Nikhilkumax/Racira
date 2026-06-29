"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";
import { keccak_256 } from "@noble/hashes/sha3.js";

function toChecksum(addr: string): string {
  const a = addr.toLowerCase().replace(/^0x/, "");
  const bytes = new TextEncoder().encode(a);
  const hash = keccak_256(bytes);
  const hex = Array.from(hash).map((b) => b.toString(16).padStart(2, "0")).join("");
  let out = "0x";
  for (let i = 0; i < a.length; i++) {
    out += parseInt(hex[i], 16) >= 8 ? a[i].toUpperCase() : a[i];
  }
  return out;
}

export function EthValidator() {
  const [v, setV] = useState("");
  const r = useMemo(() => {
    const s = v.trim();
    if (!s) return null;
    if (!/^0x[0-9a-fA-F]{40}$/.test(s)) return { ok: false, msg: "Invalid format. Must be 0x + 40 hex chars." };
    const hasMixed = /[a-f]/.test(s.slice(2)) && /[A-F]/.test(s.slice(2));
    if (!hasMixed) return { ok: true, msg: "Valid format (no checksum applied)", checksum: toChecksum(s) };
    const cs = toChecksum(s);
    return cs === s
      ? { ok: true, msg: "Valid EIP-55 checksum address", checksum: cs }
      : { ok: false, msg: "Checksum mismatch — likely a typo", checksum: cs };
  }, [v]);

  return (
    <div className="space-y-4">
      <Field label="Ethereum address">
        <Input placeholder="0x..." value={v} onChange={(e) => setV(e.target.value)} />
      </Field>
      {r && (
        <>
          <Result label="Status" value={r.msg} ok={r.ok} />
          {r.checksum && <Result label="EIP-55 Checksum" value={r.checksum} />}
        </>
      )}
    </div>
  );
}
