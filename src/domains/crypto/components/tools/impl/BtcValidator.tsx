"use client";
import { useMemo, useState } from "react";
import { Field, Input, Result } from "../ui";

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function isBase58(s: string) { return [...s].every((c) => B58.includes(c)); }
function isBech32(s: string) {
  return /^(bc1|tb1)[02-9ac-hj-np-z]{6,87}$/.test(s);
}

export function BtcValidator() {
  const [v, setV] = useState("");
  const r = useMemo(() => {
    const s = v.trim();
    if (!s) return null;
    if (s.startsWith("1") && s.length >= 26 && s.length <= 35 && isBase58(s))
      return { ok: true, msg: "Looks like a P2PKH (legacy) address" };
    if (s.startsWith("3") && s.length >= 26 && s.length <= 35 && isBase58(s))
      return { ok: true, msg: "Looks like a P2SH address" };
    if (isBech32(s.toLowerCase()))
      return { ok: true, msg: "Looks like a Bech32 (SegWit) address" };
    return { ok: false, msg: "Doesn't match Bitcoin address patterns" };
  }, [v]);
  return (
    <div className="space-y-4">
      <Field label="Bitcoin address">
        <Input placeholder="1..., 3..., or bc1..." value={v} onChange={(e) => setV(e.target.value)} />
      </Field>
      {r && <Result label="Status" value={r.msg} ok={r.ok} />}
      <p className="text-xs text-muted-foreground">Format check only — does not verify checksum.</p>
    </div>
  );
}
