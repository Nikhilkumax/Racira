import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect } from "@/components/developers/tools/options-controls";

const userAgentParser: ToolDefinition = {
  slug: "user-agent-parser",
  mode: "text",
  placeholder: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/…",
  transform: ({ input }) => {
    const ua = input.trim();
    const info: Record<string, string> = {};
    info["Your current UA"] = typeof navigator !== "undefined" ? navigator.userAgent : "";
    info["Parsed UA"] = ua;
    if (/Windows NT 10/.test(ua)) info.OS = "Windows 10/11";
    else if (/Mac OS X/.test(ua)) info.OS = "macOS";
    else if (/Android/.test(ua)) info.OS = "Android";
    else if (/iPhone|iPad/.test(ua)) info.OS = "iOS";
    else if (/Linux/.test(ua)) info.OS = "Linux";
    if (/Edg\//.test(ua)) info.Browser = "Edge";
    else if (/Chrome\//.test(ua)) info.Browser = "Chrome";
    else if (/Firefox\//.test(ua)) info.Browser = "Firefox";
    else if (/Safari\//.test(ua)) info.Browser = "Safari";
    info["Mobile?"] = /Mobi|Android|iPhone/.test(ua) ? "yes" : "no";
    info["Bot?"] = /bot|crawl|spider/i.test(ua) ? "yes" : "no";
    const m = /(Edge|Edg|Chrome|Firefox|Safari|OPR)\/([\d.]+)/.exec(ua);
    if (m) info.Version = m[2];
    return { output: Object.entries(info).map(([k, v]) => `${k.padEnd(18)} ${v}`).join("\n") };
  },
};

const queryStringParser: ToolDefinition = {
  slug: "query-string-parser",
  mode: "text",
  transform: ({ input }) => {
    const q = input.trim().startsWith("?") ? input.trim().slice(1) : input.trim();
    const params = new URLSearchParams(q.includes("=") ? q : `?${q}`.slice(0));
    const obj: Record<string, string[]> = {};
    const sp = new URLSearchParams(input.trim().replace(/^[??]/, ""));
    sp.forEach((v, k) => (obj[k] = obj[k] ? [...obj[k], v] : [v]));
    return { output: JSON.stringify(obj, null, 2), data: Object.entries(obj).map(([key, values]) => ({ key, value: values.join(", ") })), info: `${Object.keys(obj).length} params` };
  },
};

const queryStringBuilder: ToolDefinition = {
  slug: "query-string-builder",
  mode: "text",
  placeholder: "Paste key=value lines (one per line)",
  transform: ({ input }) => {
    const params = new URLSearchParams();
    for (const line of input.split(/\r?\n/)) {
      const [k, ...v] = line.split("=");
      if (k.trim()) params.append(k.trim(), v.join("=").trim());
    }
    return { output: params.toString() ? `?${params.toString()}` : "(add key=value lines above)" };
  },
};

const httpHeaderViewer: ToolDefinition = {
  slug: "http-header-viewer",
  mode: "text",
  placeholder: "Paste raw HTTP request/response headers…",
  transform: ({ input }) => {
    const lines = input.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return { output: "No headers provided." };
    const obj: Record<string, string> = {};
    let status = "";
    if (lines[0].startsWith("HTTP/")) status = lines[0];
    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx > 0) obj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    const out = status ? { status, headers: obj } : obj;
    return { output: JSON.stringify(out, null, 2), info: `${Object.keys(obj).length} headers` };
  },
};

const mimeTypeChecker: ToolDefinition = {
  slug: "mime-type-checker",
  mode: "text",
  placeholder: "Enter a file extension (e.g. .pdf) or MIME type…",
  transform: ({ input }) => {
    const table: Record<string, string> = {
      ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
      ".xml": "application/xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
      ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon",
      ".pdf": "application/pdf", ".zip": "application/zip", ".gz": "application/gzip", ".tar": "application/x-tar",
      ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".wav": "audio/wav",
      ".txt": "text/plain", ".csv": "text/csv", ".md": "text/markdown", ".woff": "font/woff", ".woff2": "font/woff2",
      ".ttf": "font/ttf", ".otf": "font/otf", ".wasm": "application/wasm", ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    const q = input.trim().toLowerCase();
    if (q.startsWith(".")) {
      const mime = table[q] ?? "unknown";
      return { output: `${q} → ${mime}` };
    }
    const ext = Object.entries(table).find(([, m]) => m === q)?.[0] ?? "unknown";
    return { output: `${q} → ${ext}` };
  },
};

const subnetCalculator: ToolDefinition = {
  slug: "subnet-calculator",
  mode: "text",
  placeholder: "10.0.0.0/24",
  transform: ({ input }) => {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec(input.trim());
    if (!m) throw new Error("Format: IP/prefix e.g. 10.0.0.0/24");
    const [, a, b, c, d, p] = m;
    const ip = [Number(a), Number(b), Number(c), Number(d)];
    if (ip.some((o) => o > 255)) throw new Error("Octet out of range");
    const prefix = Number(p);
    if (prefix > 32) throw new Error("Prefix must be 0-32");
    const toInt = (oct: number[]) => (oct[0] << 24) >>> 0 | (oct[1] << 16) >>> 0 | (oct[2] << 8) >>> 0 | oct[3];
    const fromInt = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = (toInt(ip) & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const total = prefix === 32 ? 1 : Math.pow(2, 32 - prefix);
    const lines = [
      `Network:     ${fromInt(network)}/${prefix}`,
      `Broadcast:   ${fromInt(broadcast)}`,
      `Subnet mask: ${fromInt(mask)}`,
      `Host range:  ${fromInt(prefix === 32 ? network : network + 1)} - ${fromInt(prefix === 32 ? network : broadcast - 1)}`,
      `Total hosts: ${prefix >= 31 ? total : total - 2}`,
    ];
    return { output: lines.join("\n") };
  },
};

const ipv6Validator: ToolDefinition = {
  slug: "ipv6-validator",
  mode: "text",
  transform: ({ input }) => {
    const s = input.trim();
    try {
      const u = new URL(`http://[${s}]`);
      const host = u.hostname;
      const ok = host === s.toLowerCase() || host === s.replace(/^\[|\]$/g, "").toLowerCase();
      return { output: ok ? `✓ Valid IPv6: ${s}` : "✗ Not a valid IPv6 address", info: ok ? host : "" };
    } catch {
      return { output: "✗ Not a valid IPv6 address" };
    }
  },
};

const urlShortenerPreview: ToolDefinition = {
  slug: "url-shortener-preview",
  mode: "text",
  transform: ({ input }) => {
    const url = input.trim();
    try {
      const u = new URL(url);
      return { output: `Shortened URL detected:\n  Host: ${u.hostname}\n  Path: ${u.pathname}\n  Full: ${u.href}\n\n(This tool only previews the URL structure. Following redirects would require a network request.)` };
    } catch {
      throw new Error("Invalid URL");
    }
  },
};

const slugToUrl: ToolDefinition = {
  slug: "slug-to-url",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Base URL"><input defaultValue={String(options.base ?? "https://example.com")} onChange={(e) => setOptions({ ...options, base: e.target.value })} className="h-8 w-56 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { base: "https://example.com" },
  transform: ({ input, options }) => {
    const slug = input.trim().toLowerCase().replace(/[^\w-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return { output: `${options.base}/${slug}` };
  },
};

export const networkTools: ToolDefinition[] = [
  userAgentParser, queryStringParser, queryStringBuilder, httpHeaderViewer,
  mimeTypeChecker, subnetCalculator, ipv6Validator, urlShortenerPreview, slugToUrl,
];
