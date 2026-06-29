import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptSelect } from "@/components/developers/tools/options-controls";
import { b64Decode, b64Encode } from "./helpers";

const base64Tool: ToolDefinition = {
  slug: "base64-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect
        value={String(options.mode ?? "encode")}
        onChange={(v) => setOptions({ ...options, mode: v })}
        options={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
      />
      <OptSelect
        value={String(options.variant ?? "std")}
        onChange={(v) => setOptions({ ...options, variant: v })}
        options={[
          { value: "std", label: "Standard" },
          { value: "url", label: "URL-safe" },
        ]}
      />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode", variant: "std" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    const variant = String(options.variant ?? "std");
    if (mode === "encode") {
      let out = b64Encode(input);
      if (variant === "url") out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      return { output: out };
    }
    let s = input.replace(/\s+/g, "");
    if (variant === "url") s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return { output: b64Decode(s) };
  },
};

const urlEncoderDecoder: ToolDefinition = {
  slug: "url-encoder-decoder",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect
        value={String(options.mode ?? "encode")}
        onChange={(v) => setOptions({ ...options, mode: v })}
        options={[
          { value: "encode", label: "Encode" },
          { value: "decode", label: "Decode" },
        ]}
      />
      <OptSelect
        value={String(options.scope ?? "component")}
        onChange={(v) => setOptions({ ...options, scope: v })}
        options={[
          { value: "component", label: "Component" },
          { value: "full", label: "Full URL" },
        ]}
      />
    </OptionsBar>
  ),
  defaultOptions: { mode: "encode", scope: "component" },
  transform: ({ input, options }) => {
    const mode = String(options.mode ?? "encode");
    const scope = String(options.scope ?? "component");
    if (mode === "encode") {
      return { output: scope === "full" ? encodeURI(input) : encodeURIComponent(input) };
    }
    try {
      return { output: scope === "full" ? decodeURI(input) : decodeURIComponent(input) };
    } catch {
      throw new Error("Malformed URI sequence");
    }
  },
};

const urlParser: ToolDefinition = {
  slug: "url-parser",
  mode: "text",
  transform: ({ input }) => {
    try {
      const u = new URL(input.trim());
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => (params[k] = v));
      const info = {
        href: u.href,
        protocol: u.protocol,
        username: u.username,
        password: u.password,
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        hash: u.hash,
        query: params,
      };
      return { output: JSON.stringify(info, null, 2), info: `${u.hostname}` };
    } catch {
      throw new Error("Invalid URL");
    }
  },
};

const rot13Tool: ToolDefinition = {
  slug: "rot13-encoder-decoder",
  mode: "text",
  live: true,
  placeholder: "Enter text to apply ROT13 cipher…",
  transform: ({ input }) => {
    const out = input.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
    return { output: out, info: `${input.length} chars processed` };
  },
};

export const encodingTools: ToolDefinition[] = [base64Tool, urlEncoderDecoder, urlParser, rot13Tool];
