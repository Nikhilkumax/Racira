"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Field, Output, Section, CopyButton } from "@/domains/security/components/tool-ui";
import { md5 } from "@/domains/security/lib/md5";

// ---------- utilities ----------
const enc = (s: string) => new TextEncoder().encode(s);
const buf2hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
const b64 = (u8: Uint8Array) => btoa(String.fromCharCode(...u8));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// ---------- PASSWORDS ----------
const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};
const rand = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max;

export function PasswordGenerator() {
  const [len, setLen] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [pw, setPw] = useState("");
  const gen = () => {
    const pool = [lower && SETS.lower, upper && SETS.upper, digits && SETS.digits, symbols && SETS.symbols].filter(Boolean).join("");
    if (!pool) return setPw("");
    let out = "";
    for (let i = 0; i < len; i++) out += pool[rand(pool.length)];
    setPw(out);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, [len, lower, upper, digits, symbols]);
  return (
    <Section>
      <div className="space-y-4">
        <Output value={pw} />
        <Field label={`Length: ${len}`}>
          <Slider value={[len]} min={4} max={64} step={1} onValueChange={(v) => setLen(v[0])} />
        </Field>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([["Lowercase", lower, setLower], ["Uppercase", upper, setUpper], ["Digits", digits, setDigits], ["Symbols", symbols, setSymbols]] as const).map(([l, v, s]) => (
            <label key={l} className="flex items-center gap-2 text-sm">
              <Switch checked={v} onCheckedChange={s} /> {l}
            </label>
          ))}
        </div>
        <Button onClick={gen}>Regenerate</Button>
      </div>
    </Section>
  );
}

export function PasswordStrengthChecker() {
  const [pw, setPw] = useState("");
  const score = useMemo(() => {
    if (!pw) return { s: 0, label: "—", entropy: 0 };
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
    const entropy = pw.length * Math.log2(Math.max(pool, 2));
    const s = Math.min(100, Math.round((entropy / 100) * 100));
    const label = entropy < 28 ? "Very weak" : entropy < 36 ? "Weak" : entropy < 60 ? "Fair" : entropy < 90 ? "Strong" : "Very strong";
    return { s, label, entropy: Math.round(entropy) };
  }, [pw]);
  return (
    <Section>
      <Field label="Password"><Input type="text" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <div className="mt-4 space-y-2">
        <Progress value={score.s} />
        <div className="flex justify-between text-sm"><span>{score.label}</span><span className="text-muted-foreground">{score.entropy} bits entropy</span></div>
      </div>
    </Section>
  );
}

const WORDS = "able acid aged also area army away baby back ball band bank base bath bear beat been beer bell belt best bird blow blue boat body bone book boot born both bowl bulk burn bush busy cake call calm came camp card care case cash cast cell chat chip city club coal coat code cold come cook cool cope copy core corn cost crew crop dark data date dawn days dead deal dean dear debt deep deny desk dial diet disk dock does done door dose down draw drew drop drug drum dual duke dust duty each earn ease east easy edge else even ever evil exit face fact fail fair fall farm fast fate fear feed feel feet fell felt file fill film find fine fire firm fish five flat flow food foot ford form fort four free from fuel full fund gain game gate gave gear gene gift girl give glad goal goes gold golf gone good gray grew grow gulf hair half hall hand hang hard harm hate have head hear heat held hell help here hero high hill hire hold hole holy home hope host hour huge hung hunt hurt idea inch into iron item jack jane jean john join jump jury just keen keep kent kept kick kind king knee knew know lack lady laid lake land lane last late lead left less life lift like line link list live load loan lock logo long look lord lose loss lost loud love luck made mail main make male many mark mass matt mean meat meet menu mere mike mile milk mill mind mine miss mode mood moon more most move much must name navy near neck need news next nice nick nine none nose note okay once only onto open oral over pace pack page paid pain pair palm park part pass past path peak pick pink pipe plan play plot plug plus poll pool poor port post pull pure push race rail rain rank rare rate read real rear rely rent rest rice rich ride ring rise risk road rock role roll roof room root rose rule rush ruth safe said sake sale salt same sand save seat seed seek seem seen self sell send sent sept ship shop shot show shut sick side sign site size skin slip slow snap snow soft soil sold sole some song soon sort soul spot star stay step stop such suit sure take tale talk tall tank tape task team tech tell tend term test text than that them then they thin this thus tied time tiny tire told toll tone tony took tool tops tore tort tour town tree trip true tune turn twin type unit upon used user vary vast very vice view vote wage wait wake walk wall want ward warm wash wave ways weak wear week well went were west what when whom wide wife wild will wind wine wing wire wise wish with wood word wore work yard yeah year your zero zone".split(" ");
export function PassphraseGenerator() {
  const [n, setN] = useState(5);
  const [sep, setSep] = useState("-");
  const [pp, setPp] = useState("");
  const gen = () => {
    const w = [];
    for (let i = 0; i < n; i++) w.push(WORDS[rand(WORDS.length)]);
    setPp(w.join(sep));
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, [n, sep]);
  return (
    <Section>
      <div className="space-y-4">
        <Output value={pp} />
        <Field label={`Words: ${n}`}><Slider value={[n]} min={3} max={10} step={1} onValueChange={(v) => setN(v[0])} /></Field>
        <Field label="Separator"><Input value={sep} onChange={(e) => setSep(e.target.value)} maxLength={3} /></Field>
        <Button onClick={gen}>Regenerate</Button>
      </div>
    </Section>
  );
}

export function PasswordEntropyCalculator() {
  const [pw, setPw] = useState("");
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
  const entropy = pw ? pw.length * Math.log2(Math.max(pool, 2)) : 0;
  return (
    <Section>
      <Field label="Password"><Input value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Length" value={String(pw.length)} />
        <Stat label="Pool size" value={String(pool)} />
        <Stat label="Entropy" value={`${entropy.toFixed(1)} bits`} />
      </div>
    </Section>
  );
}

export function PasswordPatternAnalyzer() {
  const [pw, setPw] = useState("");
  const issues: string[] = [];
  if (/(.)\1{2,}/.test(pw)) issues.push("Repeated characters (3+)");
  if (/(012|123|234|345|456|567|678|789|abc|qwerty|password)/i.test(pw)) issues.push("Common sequence detected");
  if (pw.length < 10) issues.push("Length below 10");
  if (!/[A-Z]/.test(pw)) issues.push("No uppercase");
  if (!/[0-9]/.test(pw)) issues.push("No digits");
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push("No symbols");
  return (
    <Section>
      <Field label="Password"><Input value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <ul className="mt-4 space-y-1 text-sm">
        {pw && issues.length === 0 && <li className="text-primary">No common patterns detected.</li>}
        {issues.map((i) => <li key={i}>• {i}</li>)}
      </ul>
    </Section>
  );
}

const COMMON_PW = new Set(["123456","password","123456789","12345678","12345","qwerty","abc123","111111","123123","admin","letmein","welcome","monkey","1234","dragon","master","login","passw0rd","starwars","iloveyou","000000","696969","mustang","baseball","football","sunshine","superman","trustno1","000000","qwerty123","1q2w3e4r"]);
export function CommonPasswordChecker() {
  const [pw, setPw] = useState("");
  const found = pw && COMMON_PW.has(pw.toLowerCase());
  return (
    <Section>
      <Field label="Password"><Input value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      {pw && <div className={`mt-4 text-sm ${found ? "text-destructive" : "text-primary"}`}>{found ? "⚠ Found in common password list" : "✓ Not in built-in common list"}</div>}
    </Section>
  );
}

export function PasswordLengthEstimator() {
  const [len, setLen] = useState(12);
  const [pool, setPool] = useState(94);
  const guesses = Math.pow(pool, len);
  const seconds = guesses / 1e10;
  const fmt = (s: number) => {
    if (s < 60) return `${s.toFixed(1)}s`;
    if (s < 3600) return `${(s / 60).toFixed(1)}m`;
    if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
    if (s < 31536000) return `${(s / 86400).toFixed(1)}d`;
    return `${(s / 31536000).toExponential(2)} years`;
  };
  return (
    <Section>
      <div className="space-y-4">
        <Field label={`Length: ${len}`}><Slider value={[len]} min={4} max={32} step={1} onValueChange={(v) => setLen(v[0])} /></Field>
        <Field label={`Character pool: ${pool}`}><Slider value={[pool]} min={10} max={128} step={1} onValueChange={(v) => setPool(v[0])} /></Field>
        <div className="text-sm">Estimated crack time @ 10B guesses/sec: <span className="font-mono text-primary">{fmt(seconds)}</span></div>
      </div>
    </Section>
  );
}

export function PINGenerator() {
  const [len, setLen] = useState(6);
  const [pin, setPin] = useState("");
  const gen = () => { let s=""; for (let i=0;i<len;i++) s+=rand(10); setPin(s); };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, [len]);
  return (
    <Section>
      <Output value={pin} />
      <div className="mt-4"><Field label={`Length: ${len}`}><Slider value={[len]} min={3} max={12} step={1} onValueChange={(v) => setLen(v[0])} /></Field></div>
      <Button className="mt-3" onClick={gen}>Regenerate</Button>
    </Section>
  );
}

export function MemorablePasswordGenerator() {
  const [pw, setPw] = useState("");
  const gen = () => {
    const w1 = WORDS[rand(WORDS.length)];
    const w2 = WORDS[rand(WORDS.length)];
    const n = String(rand(100)).padStart(2, "0");
    const sym = "!@#$%&?"[rand(7)];
    setPw(`${w1[0].toUpperCase()}${w1.slice(1)}-${w2}${n}${sym}`);
  };
  useEffect(() => { gen(); }, []);
  return (
    <Section>
      <Output value={pw} />
      <Button className="mt-3" onClick={gen}>Regenerate</Button>
    </Section>
  );
}

export function PasswordComparisonTool() {
  const [a, setA] = useState(""); const [b, setB] = useState("");
  const same = a && b && a === b;
  return (
    <Section>
      <div className="space-y-3">
        <Field label="Password A"><Input value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label="Password B"><Input value={b} onChange={(e) => setB(e.target.value)} /></Field>
        {a && b && <div className={same ? "text-primary" : "text-destructive"}>{same ? "✓ Identical" : "✗ Different"}</div>}
      </div>
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-muted p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="font-mono">{value}</div></div>;
}

// ---------- CIPHERS ----------
export function CaesarCipher() {
  const [text, setText] = useState("");
  const [shift, setShift] = useState(3);
  const out = text.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + shift + 26) % 26) + 97))
    .replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + shift + 26) % 26) + 65));
  return (
    <Section>
      <Field label="Text"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="mt-3"><Field label={`Shift: ${shift}`}><Slider value={[shift]} min={-25} max={25} step={1} onValueChange={(v) => setShift(v[0])} /></Field></div>
      <div className="mt-4"><Output value={out} /></div>
    </Section>
  );
}

export function VigenereCipher() {
  const [text, setText] = useState("");
  const [key, setKey] = useState("KEY");
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const k = key.replace(/[^a-z]/gi, "");
  let ki = 0;
  const out = !k ? "" : text.replace(/[a-z]/gi, (c) => {
    const upper = c === c.toUpperCase();
    const base = upper ? 65 : 97;
    const s = k[ki % k.length].toUpperCase().charCodeAt(0) - 65;
    ki++;
    const shift = mode === "enc" ? s : -s;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
  return (
    <Section>
      <Field label="Text"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Key"><Input value={key} onChange={(e) => setKey(e.target.value)} /></Field>
        <Field label="Mode">
          <Select value={mode} onValueChange={(v) => setMode(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="enc">Encrypt</SelectItem><SelectItem value="dec">Decrypt</SelectItem></SelectContent>
          </Select>
        </Field>
      </div>
      <div className="mt-4"><Output value={out} /></div>
    </Section>
  );
}

export function XORCipher() {
  const [text, setText] = useState("");
  const [key, setKey] = useState("key");
  const out = useMemo(() => {
    if (!text || !key) return "";
    const bytes = enc(text);
    const kbytes = enc(key);
    const o = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) o[i] = bytes[i] ^ kbytes[i % kbytes.length];
    return b64(o);
  }, [text, key]);
  return (
    <Section>
      <Field label="Text"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="mt-3"><Field label="Key"><Input value={key} onChange={(e) => setKey(e.target.value)} /></Field></div>
      <div className="mt-4"><Output value={out} /></div>
      <p className="text-xs text-muted-foreground mt-2">Output is Base64-encoded ciphertext.</p>
    </Section>
  );
}

export function OneTimePadGenerator() {
  const [n, setN] = useState(32);
  const [pad, setPad] = useState("");
  const gen = () => {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    setPad(Array.from(a).map((x) => x.toString(16).padStart(2, "0")).join(""));
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, [n]);
  return (
    <Section>
      <Output value={pad} />
      <div className="mt-3"><Field label={`Bytes: ${n}`}><Slider value={[n]} min={8} max={256} step={8} onValueChange={(v) => setN(v[0])} /></Field></div>
      <Button className="mt-3" onClick={gen}>Regenerate</Button>
    </Section>
  );
}

export function RailFenceCipher() {
  const [text, setText] = useState("");
  const [rails, setRails] = useState(3);
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const encrypt = (s: string, r: number) => {
    if (r <= 1) return s;
    const arr: string[][] = Array.from({ length: r }, () => []);
    let row = 0, dir = 1;
    for (const c of s) { arr[row].push(c); if (row === 0) dir = 1; else if (row === r - 1) dir = -1; row += dir; }
    return arr.flat().join("");
  };
  const decrypt = (s: string, r: number) => {
    if (r <= 1) return s;
    const pattern: number[] = []; let row = 0, dir = 1;
    for (let i = 0; i < s.length; i++) { pattern.push(row); if (row === 0) dir = 1; else if (row === r - 1) dir = -1; row += dir; }
    const counts: number[] = new Array(r).fill(0);
    pattern.forEach((p) => counts[p]++);
    const rails_: string[][] = [];
    let idx = 0;
    for (let i = 0; i < r; i++) { rails_.push(s.slice(idx, idx + counts[i]).split("")); idx += counts[i]; }
    const ptr: number[] = new Array(r).fill(0);
    return pattern.map((p) => rails_[p][ptr[p]++]).join("");
  };
  const out = mode === "enc" ? encrypt(text, rails) : decrypt(text, rails);
  return (
    <Section>
      <Field label="Text"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label={`Rails: ${rails}`}><Slider value={[rails]} min={2} max={10} step={1} onValueChange={(v) => setRails(v[0])} /></Field>
        <Field label="Mode">
          <Select value={mode} onValueChange={(v) => setMode(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="enc">Encrypt</SelectItem><SelectItem value="dec">Decrypt</SelectItem></SelectContent>
          </Select>
        </Field>
      </div>
      <div className="mt-4"><Output value={out} /></div>
    </Section>
  );
}

// ---------- AES ----------
export function AESTool() {
  const [text, setText] = useState("");
  const [pw, setPw] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  const deriveKey = async (password: string, salt: Uint8Array) => {
    const baseKey = await crypto.subtle.importKey("raw", enc(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt as BufferSource, iterations: 150000, hash: "SHA-256" }, baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  };
  const encrypt = async () => {
    setErr("");
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(pw, salt);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc(text)));
      const combined = new Uint8Array(salt.length + iv.length + ct.length);
      combined.set(salt); combined.set(iv, salt.length); combined.set(ct, salt.length + iv.length);
      setOut(b64(combined));
    } catch (e: any) { setErr(e.message); }
  };
  const decrypt = async () => {
    setErr("");
    try {
      const data = fromB64(text);
      const salt = data.slice(0, 16), iv = data.slice(16, 28), ct = data.slice(28);
      const key = await deriveKey(pw, salt);
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      setOut(new TextDecoder().decode(pt));
    } catch (e: any) { setErr("Decryption failed: " + e.message); }
  };
  return (
    <Section>
      <Field label="Text / Ciphertext (Base64)"><Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} /></Field>
      <div className="mt-3"><Field label="Password"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field></div>
      <div className="mt-4 flex gap-2"><Button onClick={encrypt}>Encrypt</Button><Button variant="outline" onClick={decrypt}>Decrypt</Button></div>
      {err && <div className="mt-3 text-sm text-destructive">{err}</div>}
      <div className="mt-4"><Output value={out} /></div>
      <p className="text-xs text-muted-foreground mt-2">AES-GCM 256, PBKDF2-SHA256, 150k iters. Format: salt(16) | iv(12) | ciphertext, Base64.</p>
    </Section>
  );
}

export function RSAKeyGen() {
  const [pub, setPub] = useState(""); const [prv, setPrv] = useState(""); const [busy, setBusy] = useState(false);
  const gen = async () => {
    setBusy(true);
    const { publicKey, privateKey } = await crypto.subtle.generateKey({ name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["encrypt", "decrypt"]);
    const pkc = new Uint8Array(await crypto.subtle.exportKey("spki", publicKey));
    const prc = new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey));
    const pem = (l: string, b: Uint8Array) => `-----BEGIN ${l}-----\n${b64(b).match(/.{1,64}/g)!.join("\n")}\n-----END ${l}-----`;
    setPub(pem("PUBLIC KEY", pkc));
    setPrv(pem("PRIVATE KEY", prc));
    setBusy(false);
  };
  return (
    <Section>
      <Button onClick={gen} disabled={busy}>{busy ? "Generating…" : "Generate 2048-bit RSA keypair"}</Button>
      <div className="mt-4 grid gap-4">
        <Field label="Public Key (SPKI/PEM)"><Output value={pub} /></Field>
        <Field label="Private Key (PKCS8/PEM)"><Output value={prv} /></Field>
      </div>
    </Section>
  );
}

export function ECKeyGen() {
  const [pub, setPub] = useState(""); const [prv, setPrv] = useState(""); const [busy, setBusy] = useState(false);
  const gen = async () => {
    setBusy(true);
    const { publicKey, privateKey } = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const pkc = new Uint8Array(await crypto.subtle.exportKey("spki", publicKey));
    const prc = new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey));
    const pem = (l: string, b: Uint8Array) => `-----BEGIN ${l}-----\n${b64(b).match(/.{1,64}/g)!.join("\n")}\n-----END ${l}-----`;
    setPub(pem("PUBLIC KEY", pkc));
    setPrv(pem("PRIVATE KEY", prc));
    setBusy(false);
  };
  return (
    <Section>
      <Button onClick={gen} disabled={busy}>{busy ? "Generating…" : "Generate P-256 ECDSA keypair"}</Button>
      <div className="mt-4 grid gap-4">
        <Field label="Public Key"><Output value={pub} /></Field>
        <Field label="Private Key"><Output value={prv} /></Field>
      </div>
    </Section>
  );
}

// ---------- HASHES ----------
function SubtleHashTool({ algo }: { algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" }) {
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  useEffect(() => {
    if (!text) return setHash("");
    crypto.subtle.digest(algo, enc(text)).then((b) => setHash(buf2hex(b)));
  }, [text, algo]);
  return (
    <Section>
      <Field label="Input"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="mt-4"><Output value={hash} /></div>
    </Section>
  );
}
export const SHA1 = () => <SubtleHashTool algo="SHA-1" />;
export const SHA256 = () => <SubtleHashTool algo="SHA-256" />;
export const SHA384 = () => <SubtleHashTool algo="SHA-384" />;
export const SHA512 = () => <SubtleHashTool algo="SHA-512" />;

export function MD5Tool() {
  const [text, setText] = useState("");
  const out = text ? md5(text) : "";
  return (
    <Section>
      <Field label="Input"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="mt-4"><Output value={out} /></div>
      <p className="text-xs text-muted-foreground mt-2">MD5 is cryptographically broken; for legacy/educational use only.</p>
    </Section>
  );
}

export function HMACTool() {
  const [text, setText] = useState(""); const [key, setKey] = useState("");
  const [algo, setAlgo] = useState<"SHA-1" | "SHA-256" | "SHA-384" | "SHA-512">("SHA-256");
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!text || !key) return setOut("");
    (async () => {
      const k = await crypto.subtle.importKey("raw", enc(key), { name: "HMAC", hash: algo }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", k, enc(text));
      setOut(buf2hex(sig));
    })();
  }, [text, key, algo]);
  return (
    <Section>
      <Field label="Message"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Key"><Input value={key} onChange={(e) => setKey(e.target.value)} /></Field>
        <Field label="Algorithm">
          <Select value={algo} onValueChange={(v) => setAlgo(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["SHA-1","SHA-256","SHA-384","SHA-512"].map(a => <SelectItem key={a} value={a}>HMAC-{a}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <div className="mt-4"><Output value={out} /></div>
    </Section>
  );
}

export function HashCompare() {
  const [a, setA] = useState(""); const [b, setB] = useState("");
  const eq = a && b && a.trim().toLowerCase() === b.trim().toLowerCase();
  return (
    <Section>
      <Field label="Hash A"><Input value={a} onChange={(e) => setA(e.target.value)} className="font-mono" /></Field>
      <div className="mt-3"><Field label="Hash B"><Input value={b} onChange={(e) => setB(e.target.value)} className="font-mono" /></Field></div>
      {a && b && <div className={`mt-4 text-sm ${eq ? "text-primary" : "text-destructive"}`}>{eq ? "✓ Match" : "✗ Different"}</div>}
    </Section>
  );
}

export function FileHashVerifier() {
  const [hash, setHash] = useState(""); const [algo, setAlgo] = useState<"SHA-1"|"SHA-256"|"SHA-384"|"SHA-512">("SHA-256");
  const [expected, setExpected] = useState("");
  const [busy, setBusy] = useState(false);
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    const buf = await f.arrayBuffer();
    const h = await crypto.subtle.digest(algo, buf);
    setHash(buf2hex(h));
    setBusy(false);
  };
  const match = expected && hash && expected.trim().toLowerCase() === hash;
  return (
    <Section>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Algorithm">
          <Select value={algo} onValueChange={(v) => setAlgo(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["SHA-1","SHA-256","SHA-384","SHA-512"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="File"><Input type="file" onChange={(e) => onFile(e.target.files?.[0])} /></Field>
      </div>
      <div className="mt-3"><Field label="Computed hash"><Output value={busy ? "Hashing…" : hash} /></Field></div>
      <div className="mt-3"><Field label="Expected hash (optional)"><Input value={expected} onChange={(e) => setExpected(e.target.value)} className="font-mono" /></Field></div>
      {expected && hash && <div className={`mt-3 text-sm ${match ? "text-primary" : "text-destructive"}`}>{match ? "✓ Verified" : "✗ Hash mismatch"}</div>}
    </Section>
  );
}

// ---------- ENCODING ----------
function TwoWay({ enc: encFn, dec: decFn, label = "Text" }: { enc: (s: string) => string; dec: (s: string) => string; label?: string }) {
  const [tab, setTab] = useState("enc");
  const [input, setInput] = useState("");
  const [err, setErr] = useState("");
  let out = "";
  try { out = tab === "enc" ? encFn(input) : decFn(input); } catch (e: any) { out = ""; }
  return (
    <Section>
      <Tabs value={tab} onValueChange={(v) => { setTab(v); setErr(""); }}>
        <TabsList><TabsTrigger value="enc">Encode</TabsTrigger><TabsTrigger value="dec">Decode</TabsTrigger></TabsList>
        <TabsContent value="enc" className="mt-4 space-y-4">
          <Field label={label}><Textarea value={input} onChange={(e) => setInput(e.target.value)} /></Field>
          <Output value={out} />
        </TabsContent>
        <TabsContent value="dec" className="mt-4 space-y-4">
          <Field label="Encoded"><Textarea value={input} onChange={(e) => setInput(e.target.value)} /></Field>
          <Output value={out} />
        </TabsContent>
      </Tabs>
      {err && <div className="text-sm text-destructive mt-2">{err}</div>}
    </Section>
  );
}

export const Base64Tool = () => <TwoWay enc={(s) => btoa(unescape(encodeURIComponent(s)))} dec={(s) => decodeURIComponent(escape(atob(s)))} />;
export const HexTool = () => <TwoWay enc={(s) => Array.from(enc(s)).map((b) => b.toString(16).padStart(2, "0")).join("")} dec={(s) => new TextDecoder().decode(new Uint8Array((s.match(/.{1,2}/g) || []).map((h) => parseInt(h, 16))))} />;
export const URLTool = () => <TwoWay enc={(s) => encodeURIComponent(s)} dec={(s) => decodeURIComponent(s)} />;
export const HTMLEntityTool = () => <TwoWay enc={(s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))} dec={(s) => { const t = document.createElement("textarea"); t.innerHTML = s; return t.value; }} />;
export const ROT13Tool = () => <TwoWay enc={(s) => s.replace(/[a-z]/gi, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= "Z" ? 65 : 97) + 13) % 26) + (c <= "Z" ? 65 : 97)))} dec={(s) => s.replace(/[a-z]/gi, (c) => String.fromCharCode(((c.charCodeAt(0) - (c <= "Z" ? 65 : 97) + 13) % 26) + (c <= "Z" ? 65 : 97)))} />;

// Base32
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const base32enc = (s: string) => {
  const bytes = enc(s);
  let bits = "", out = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  while (bits.length % 5) bits += "0";
  for (let i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  while (out.length % 8) out += "=";
  return out;
};
const base32dec = (s: string) => {
  s = s.replace(/=+$/, "").toUpperCase();
  let bits = "";
  for (const c of s) { const i = B32.indexOf(c); if (i < 0) continue; bits += i.toString(2).padStart(5, "0"); }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return new TextDecoder().decode(new Uint8Array(bytes));
};
export const Base32Tool = () => <TwoWay enc={base32enc} dec={base32dec} />;

// Base85 (Ascii85)
const a85enc = (s: string) => {
  const bytes = enc(s);
  let out = "";
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = bytes.slice(i, i + 4);
    const pad = 4 - chunk.length;
    let n = 0;
    for (let j = 0; j < 4; j++) n = n * 256 + (chunk[j] ?? 0);
    if (n === 0 && pad === 0) { out += "z"; continue; }
    let g = "";
    for (let j = 0; j < 5; j++) { g = String.fromCharCode(33 + (n % 85)) + g; n = Math.floor(n / 85); }
    out += g.slice(0, 5 - pad);
  }
  return out;
};
const a85dec = (s: string) => {
  s = s.replace(/\s/g, "");
  const out: number[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === "z") { out.push(0, 0, 0, 0); i++; continue; }
    const chunk = s.slice(i, i + 5); i += 5;
    const pad = 5 - chunk.length;
    let n = 0;
    for (let j = 0; j < 5; j++) n = n * 85 + ((chunk[j] ?? "u").charCodeAt(0) - 33);
    for (let j = 3; j >= 0; j--) { const b = (n >>> (j * 8)) & 0xff; if (j >= pad) out.push(b); }
  }
  return new TextDecoder().decode(new Uint8Array(out));
};
export const Base85Tool = () => <TwoWay enc={a85enc} dec={a85dec} />;

export const PunycodeTool = () => <TwoWay
  enc={(s) => s.split(".").map((p) => /[^\x00-\x7f]/.test(p) ? "xn--" + punycodeEncode(p) : p).join(".")}
  dec={(s) => s.split(".").map((p) => p.startsWith("xn--") ? punycodeDecode(p.slice(4)) : p).join(".")}
/>;

// Minimal RFC 3492 punycode encode/decode
function punycodeEncode(input: string): string {
  const BASE = 36, TMIN = 1, TMAX = 26, SKEW = 38, DAMP = 700, INITIAL_BIAS = 72, INITIAL_N = 128;
  const adapt = (delta: number, num: number, first: boolean) => {
    delta = first ? Math.floor(delta / DAMP) : delta >> 1;
    delta += Math.floor(delta / num);
    let k = 0;
    while (delta > ((BASE - TMIN) * TMAX) >> 1) { delta = Math.floor(delta / (BASE - TMIN)); k += BASE; }
    return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW));
  };
  const codePoints = Array.from(input).map((c) => c.codePointAt(0)!);
  let n = INITIAL_N, delta = 0, bias = INITIAL_BIAS;
  const basic = codePoints.filter((c) => c < 0x80);
  let output = basic.map((c) => String.fromCharCode(c)).join("");
  let h = basic.length;
  if (h > 0) output += "-";
  while (h < codePoints.length) {
    let m = Infinity;
    for (const c of codePoints) if (c >= n && c < m) m = c;
    delta += (m - n) * (h + 1);
    n = m;
    for (const c of codePoints) {
      if (c < n) delta++;
      else if (c === n) {
        let q = delta;
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
          if (q < t) break;
          output += String.fromCharCode(t + ((q - t) % (BASE - t)) + 22 + (((q - t) % (BASE - t)) < 26 ? 0 : 0));
          q = Math.floor((q - t) / (BASE - t));
        }
        output += String.fromCharCode(q + 22 + (q < 26 ? 0 : 0));
        bias = adapt(delta, h + 1, h === basic.length);
        delta = 0; h++;
      }
    }
    delta++; n++;
  }
  return output;
}
function punycodeDecode(input: string): string {
  const BASE = 36, TMIN = 1, TMAX = 26, SKEW = 38, DAMP = 700, INITIAL_BIAS = 72, INITIAL_N = 128;
  const adapt = (delta: number, num: number, first: boolean) => {
    delta = first ? Math.floor(delta / DAMP) : delta >> 1;
    delta += Math.floor(delta / num);
    let k = 0;
    while (delta > ((BASE - TMIN) * TMAX) >> 1) { delta = Math.floor(delta / (BASE - TMIN)); k += BASE; }
    return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW));
  };
  const decodeDigit = (cp: number) => cp - 22 < 10 ? cp - 22 + 26 : cp - 65 < 26 ? cp - 65 : cp - 97 < 26 ? cp - 97 : BASE;
  let n = INITIAL_N, i = 0, bias = INITIAL_BIAS;
  const lastDash = input.lastIndexOf("-");
  const output: number[] = lastDash > 0 ? Array.from(input.slice(0, lastDash)).map((c) => c.charCodeAt(0)) : [];
  let idx = lastDash > 0 ? lastDash + 1 : 0;
  while (idx < input.length) {
    const oldi = i; let w = 1;
    for (let k = BASE; ; k += BASE) {
      const digit = decodeDigit(input.charCodeAt(idx++));
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      w *= BASE - t;
    }
    bias = adapt(i - oldi, output.length + 1, oldi === 0);
    n += Math.floor(i / (output.length + 1));
    i %= output.length + 1;
    output.splice(i, 0, n);
    i++;
  }
  return String.fromCodePoint(...output);
}

// ---------- ZERO-WIDTH STEGO ----------
const ZW = ["\u200B", "\u200C", "\u200D", "\u2060"];
export function ZeroWidthInserter() {
  const [host, setHost] = useState("Visible cover text");
  const [secret, setSecret] = useState("hi");
  const encoded = useMemo(() => {
    if (!secret) return host;
    const bytes = enc(secret);
    let bits = "";
    for (const b of bytes) bits += b.toString(2).padStart(8, "0");
    let zw = "";
    for (let i = 0; i < bits.length; i += 2) zw += ZW[parseInt(bits.slice(i, i + 2).padEnd(2, "0"), 2)];
    return host + zw;
  }, [host, secret]);
  return (
    <Section>
      <Field label="Cover text"><Input value={host} onChange={(e) => setHost(e.target.value)} /></Field>
      <div className="mt-3"><Field label="Secret"><Input value={secret} onChange={(e) => setSecret(e.target.value)} /></Field></div>
      <div className="mt-4"><Field label="Output (includes invisible zero-width chars)"><Output value={encoded} mono={false} /></Field></div>
      <p className="text-xs text-muted-foreground mt-2">Copy the output above — invisible characters are embedded after the cover text.</p>
    </Section>
  );
}

// ---------- JWT ----------
const b64urlDec = (s: string) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  return decodeURIComponent(escape(atob(s)));
};
const b64urlEnc = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function JWTDecoder() {
  const [t, setT] = useState("");
  const parts = t.split(".");
  let header = "", payload = "", err = "";
  try { if (parts[0]) header = JSON.stringify(JSON.parse(b64urlDec(parts[0])), null, 2); } catch (e: any) { err = "Header parse error"; }
  try { if (parts[1]) payload = JSON.stringify(JSON.parse(b64urlDec(parts[1])), null, 2); } catch (e: any) { err = "Payload parse error"; }
  return (
    <Section>
      <Field label="JWT"><Textarea value={t} onChange={(e) => setT(e.target.value)} rows={4} className="font-mono text-xs" /></Field>
      <div className="mt-4 grid gap-3">
        <Field label="Header"><Output value={header} /></Field>
        <Field label="Payload"><Output value={payload} /></Field>
        <Field label="Signature"><Output value={parts[2] || ""} /></Field>
      </div>
      {err && <div className="mt-2 text-sm text-destructive">{err}</div>}
    </Section>
  );
}

export function JWTEncoder() {
  const [payload, setPayload] = useState('{"sub":"123","name":"Alice","iat":1700000000}');
  const [secret, setSecret] = useState("secret");
  const [out, setOut] = useState("");
  const build = async () => {
    const h = b64urlEnc(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const p = b64urlEnc(payload);
    const k = await crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc(`${h}.${p}`)));
    const s = btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    setOut(`${h}.${p}.${s}`);
  };
  return (
    <Section>
      <Field label="Payload (JSON)"><Textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={4} className="font-mono text-xs" /></Field>
      <div className="mt-3"><Field label="HS256 Secret"><Input value={secret} onChange={(e) => setSecret(e.target.value)} /></Field></div>
      <Button className="mt-3" onClick={build}>Sign</Button>
      <div className="mt-4"><Output value={out} /></div>
    </Section>
  );
}

export function JWTValidator() {
  const [t, setT] = useState("");
  const issues: string[] = [];
  const parts = t.split(".");
  if (t) {
    if (parts.length !== 3) issues.push("Token must have 3 dot-separated parts");
    try { JSON.parse(b64urlDec(parts[0] || "")); } catch { issues.push("Invalid header"); }
    try {
      const p = JSON.parse(b64urlDec(parts[1] || ""));
      const now = Math.floor(Date.now() / 1000);
      if (p.exp && p.exp < now) issues.push(`Expired (exp=${p.exp})`);
      if (p.nbf && p.nbf > now) issues.push(`Not yet valid (nbf=${p.nbf})`);
      if (!p.iss) issues.push("Missing iss claim");
      if (!p.sub) issues.push("Missing sub claim");
    } catch { issues.push("Invalid payload"); }
  }
  return (
    <Section>
      <Field label="JWT"><Textarea value={t} onChange={(e) => setT(e.target.value)} rows={4} className="font-mono text-xs" /></Field>
      {t && (
        <div className="mt-4 space-y-1 text-sm">
          {issues.length === 0 ? <div className="text-primary">✓ Structure valid, no temporal issues.</div> : issues.map(i => <div key={i}>• {i}</div>)}
        </div>
      )}
    </Section>
  );
}

export function JWTVerifier() {
  const [t, setT] = useState(""); const [secret, setSecret] = useState(""); const [result, setResult] = useState("");
  const verify = async () => {
    try {
      const [h, p, s] = t.split(".");
      const k = await crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
      const sig = Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - s.length % 4) % 4)), c => c.charCodeAt(0));
      const ok = await crypto.subtle.verify("HMAC", k, sig, enc(`${h}.${p}`));
      setResult(ok ? "✓ Signature valid (HS256)" : "✗ Signature does NOT match");
    } catch (e: any) { setResult("Error: " + e.message); }
  };
  return (
    <Section>
      <Field label="JWT"><Textarea value={t} onChange={(e) => setT(e.target.value)} rows={4} className="font-mono text-xs" /></Field>
      <div className="mt-3"><Field label="HS256 Secret"><Input value={secret} onChange={(e) => setSecret(e.target.value)} /></Field></div>
      <Button className="mt-3" onClick={verify}>Verify</Button>
      {result && <div className={`mt-3 text-sm ${result.startsWith("✓") ? "text-primary" : "text-destructive"}`}>{result}</div>}
    </Section>
  );
}

const API_KEY_PATTERNS: { name: string; rx: RegExp }[] = [
  { name: "Stripe Live Secret", rx: /^sk_live_[A-Za-z0-9]{20,}$/ },
  { name: "Stripe Test Secret", rx: /^sk_test_[A-Za-z0-9]{20,}$/ },
  { name: "GitHub PAT (classic)", rx: /^ghp_[A-Za-z0-9]{36}$/ },
  { name: "GitHub Fine-grained", rx: /^github_pat_[A-Za-z0-9_]{60,}$/ },
  { name: "OpenAI", rx: /^sk-[A-Za-z0-9_-]{20,}$/ },
  { name: "Slack Bot Token", rx: /^xoxb-[A-Za-z0-9-]{20,}$/ },
  { name: "AWS Access Key", rx: /^AKIA[0-9A-Z]{16}$/ },
  { name: "JWT (3-part)", rx: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/ },
  { name: "UUID", rx: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i },
  { name: "Hex (32+)", rx: /^[0-9a-f]{32,}$/i },
];
export function APIKeyValidator() {
  const [k, setK] = useState("");
  const matches = k ? API_KEY_PATTERNS.filter((p) => p.rx.test(k.trim())) : [];
  return (
    <Section>
      <Field label="API key / token"><Input value={k} onChange={(e) => setK(e.target.value)} className="font-mono" /></Field>
      <div className="mt-4 text-sm">
        {!k ? <span className="text-muted-foreground">Paste a key to detect its format.</span>
          : matches.length ? <ul className="space-y-1">{matches.map((m) => <li key={m.name} className="text-primary">✓ Matches: {m.name}</li>)}</ul>
          : <span className="text-destructive">No known format matched.</span>}
      </div>
    </Section>
  );
}

// ---------- CSP / SRI ----------
const CSP_DIRECTIVES = ["default-src", "script-src", "style-src", "img-src", "connect-src", "font-src", "frame-src", "media-src", "object-src", "frame-ancestors", "base-uri", "form-action"];
export function CSPBuilder() {
  const [vals, setVals] = useState<Record<string, string>>({ "default-src": "'self'" });
  const csp = Object.entries(vals).filter(([, v]) => v.trim()).map(([k, v]) => `${k} ${v.trim()}`).join("; ");
  return (
    <Section>
      <div className="space-y-3">
        {CSP_DIRECTIVES.map((d) => (
          <div key={d} className="grid grid-cols-[160px_1fr] gap-3 items-center">
            <Label className="font-mono text-xs">{d}</Label>
            <Input value={vals[d] || ""} placeholder="'self' https://cdn.example.com" onChange={(e) => setVals({ ...vals, [d]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="mt-4"><Output value={csp} /></div>
    </Section>
  );
}

export function CSPValidator() {
  const [csp, setCsp] = useState("default-src 'self'; script-src 'self' 'unsafe-inline'");
  const issues: string[] = [];
  if (!csp.includes("default-src")) issues.push("Missing default-src fallback");
  if (csp.includes("'unsafe-inline'")) issues.push("Uses 'unsafe-inline' (allows inline scripts)");
  if (csp.includes("'unsafe-eval'")) issues.push("Uses 'unsafe-eval'");
  if (csp.includes("*") && !csp.includes("data:")) issues.push("Contains wildcard '*' source");
  if (!csp.includes("frame-ancestors")) issues.push("Missing frame-ancestors (clickjacking)");
  return (
    <Section>
      <Field label="Content-Security-Policy"><Textarea value={csp} onChange={(e) => setCsp(e.target.value)} rows={4} className="font-mono text-xs" /></Field>
      <div className="mt-3 text-sm space-y-1">
        {issues.length ? issues.map((i) => <div key={i} className="text-destructive">• {i}</div>) : <div className="text-primary">✓ No common issues detected.</div>}
      </div>
    </Section>
  );
}

export function SRIGenerator() {
  const [url, setUrl] = useState(""); const [algo, setAlgo] = useState<"SHA-256"|"SHA-384"|"SHA-512">("SHA-384");
  const [out, setOut] = useState(""); const [err, setErr] = useState("");
  const gen = async () => {
    setErr(""); setOut("");
    try {
      const r = await fetch(url); const buf = await r.arrayBuffer();
      const h = new Uint8Array(await crypto.subtle.digest(algo, buf));
      const b = btoa(String.fromCharCode(...h));
      setOut(`${algo.toLowerCase().replace("-", "")}-${b}`);
    } catch (e: any) { setErr("Fetch failed (CORS or network): " + e.message); }
  };
  return (
    <Section>
      <Field label="Asset URL"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://cdn.example.com/lib.js" /></Field>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 items-end">
        <Field label="Algorithm">
          <Select value={algo} onValueChange={(v) => setAlgo(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["SHA-256","SHA-384","SHA-512"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Button onClick={gen}>Generate</Button>
      </div>
      {err && <div className="mt-3 text-sm text-destructive">{err}</div>}
      <div className="mt-4"><Output value={out} /></div>
      {out && <p className="text-xs text-muted-foreground mt-2">Use: <code>&lt;script integrity="{out}" crossorigin="anonymous" ...&gt;</code></p>}
    </Section>
  );
}

// ---------- UTILITIES ----------
export function UUIDGen() {
  const [n, setN] = useState(5);
  const [list, setList] = useState<string[]>([]);
  const gen = () => setList(Array.from({ length: n }, () => crypto.randomUUID()));
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, [n]);
  return (
    <Section>
      <Field label={`Count: ${n}`}><Slider value={[n]} min={1} max={50} step={1} onValueChange={(v) => setN(v[0])} /></Field>
      <div className="mt-4"><Output value={list.join("\n")} /></div>
      <Button className="mt-3" onClick={gen}>Regenerate</Button>
    </Section>
  );
}

export function RandomBytes() {
  const [n, setN] = useState(32); const [fmt, setFmt] = useState<"hex"|"base64">("hex"); const [out, setOut] = useState("");
  const gen = () => {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    setOut(fmt === "hex" ? Array.from(a).map(b => b.toString(16).padStart(2, "0")).join("") : b64(a));
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, [n, fmt]);
  return (
    <Section>
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Bytes: ${n}`}><Slider value={[n]} min={4} max={256} step={4} onValueChange={(v) => setN(v[0])} /></Field>
        <Field label="Format">
          <Select value={fmt} onValueChange={(v) => setFmt(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="hex">Hex</SelectItem><SelectItem value="base64">Base64</SelectItem></SelectContent>
          </Select>
        </Field>
      </div>
      <div className="mt-4"><Output value={out} /></div>
      <Button className="mt-3" onClick={gen}>Regenerate</Button>
    </Section>
  );
}
