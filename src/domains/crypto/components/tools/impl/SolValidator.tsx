"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function SolValidator() {
  const [v, setV] = useState("");
  const r = useMemo(() => {
    const s = v.trim();
    if (!s) return null;
    if (s.length < 32 || s.length > 44) return { ok: false, msg: "Solana addresses are 32–44 base58 chars" };
    if (![...s].every((c) => B58.includes(c))) return { ok: false, msg: "Contains non-base58 characters" };
    return { ok: true, msg: "Valid Base58 format (32–44 chars)" };
  }, [v]);
  return (
    <div className="space-y-4">
      <Field label="Solana address">
        <Input value={v} onChange={(e) => setV(e.target.value)} />
      </Field>
      {r && <Result label="Status" value={r.msg} ok={r.ok} />}
      <p className="text-xs text-muted-foreground">Format check only — does not verify checksum.</p>
    </div>
  );
}
