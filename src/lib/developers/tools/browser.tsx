import type { ToolDefinition, CustomRendererProps } from "@/components/developers/tools/registry";
import { ComponentType } from "react";

// ── Browser / Storage Utilities ──

const localStorageViewer: ToolDefinition = {
  slug: "local-storage-viewer",
  mode: "custom",
  hideInput: true,
  customRenderer: (LocalStorageViewer as unknown) as ComponentType<CustomRendererProps>,
};

function LocalStorageViewer() {
  const React = require("react") as typeof import("react");
  const [items, setItems] = React.useState<[string, string][]>([]);
  React.useEffect(() => {
    try {
      const arr: [string, string][] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        arr.push([k, localStorage.getItem(k) ?? ""]);
      }
      setItems(arr);
    } catch { /* noop */ }
  }, []);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">localStorage ({items.length} entries)</div>
      {items.length === 0 && <div className="text-sm text-muted-foreground">Empty.</div>}
      <table className="w-full text-xs">
        <thead><tr><th className="text-left py-1 font-semibold">Key</th><th className="text-left py-1 font-semibold">Value</th><th className="py-1 font-semibold w-16">Size</th></tr></thead>
        <tbody>{items.map(([k, v]) => <tr key={k} className="hover:bg-accent/40"><td className="py-0.5 font-mono">{k}</td><td className="py-0.5 font-mono max-w-xs truncate">{v}</td><td className="py-0.5">{new TextEncoder().encode(v).length}B</td></tr>)}</tbody>
      </table>
    </div>
  );
}

const localStorageManager: ToolDefinition = {
  slug: "local-storage-manager",
  mode: "custom",
  hideInput: true,
  customRenderer: (LocalStorageManagerComp as unknown) as ComponentType<CustomRendererProps>,
};

function LocalStorageManagerComp() {
  const React = require("react") as typeof import("react");
  const [items, setItems] = React.useState<[string, string][]>([]);
  const [key, setKey] = React.useState("");
  const [val, setVal] = React.useState("");
  const refresh = () => {
    const arr: [string, string][] = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; arr.push([k, localStorage.getItem(k) ?? ""]); } } catch { /* noop */ }
    setItems(arr);
  };
  React.useEffect(refresh, []);
  const add = () => { try { localStorage.setItem(key, val); refresh(); } catch (e) { alert(String(e)); } };
  const del = (k: string) => { localStorage.removeItem(k); refresh(); };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-2">
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="key" className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm font-mono" />
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="value" className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm font-mono" />
        <button onClick={add} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm">Set</button>
        <button onClick={() => { localStorage.clear(); refresh(); }} className="h-8 px-3 rounded-md border border-border text-sm">Clear All</button>
      </div>
      <div className="space-y-1 max-h-64 overflow-auto">
        {items.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-xs"><span className="font-mono flex-1 truncate">{k}: {v}</span><button onClick={() => del(k)} className="text-destructive hover:underline">del</button></div>
        ))}
      </div>
    </div>
  );
}

const sessionStorageViewer: ToolDefinition = {
  slug: "session-storage-viewer",
  mode: "custom",
  hideInput: true,
  customRenderer: (SessionStorageViewerComp as unknown) as ComponentType<CustomRendererProps>,
};

function SessionStorageViewerComp() {
  const React = require("react") as typeof import("react");
  const [items, setItems] = React.useState<[string, string][]>([]);
  React.useEffect(() => {
    try { const a: [string, string][] = []; for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i)!; a.push([k, sessionStorage.getItem(k) ?? ""]); } setItems(a); } catch { /* noop */ }
  }, []);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">sessionStorage ({items.length} entries)</div>
      {items.length === 0 && <div className="text-sm text-muted-foreground">Empty.</div>}
      <table className="w-full text-xs"><tbody>{items.map(([k, v]) => <tr key={k} className="hover:bg-accent/40"><td className="py-0.5 font-mono pr-3">{k}</td><td className="py-0.5 font-mono">{v}</td></tr>)}</tbody></table>
    </div>
  );
}

const browserInfoDetector: ToolDefinition = {
  slug: "browser-info-detector",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const info: string[] = [];
    if (typeof navigator !== "undefined") {
      info.push(`User Agent: ${navigator.userAgent}`);
      info.push(`Platform: ${navigator.platform}`);
      info.push(`Language: ${navigator.language}`);
      info.push(`Languages: ${navigator.languages?.join(", ")}`);
      info.push(`Cookies: ${navigator.cookieEnabled}`);
      info.push(`Online: ${navigator.onLine}`);
      info.push(`Screen: ${screen.width}×${screen.height}`);
      info.push(`Device Pixel Ratio: ${window.devicePixelRatio}`);
      info.push(`Color Depth: ${screen.colorDepth}`);
      info.push(`Touch: ${navigator.maxTouchPoints > 0}`);
      info.push(`Concurrency: ${navigator.hardwareConcurrency}`);
      info.push(`Memory (est): ${(navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? "?"}GB`);
    }
    return { output: info.join("\n") };
  },
};

const jwtLocalInspector: ToolDefinition = {
  slug: "jwt-local-inspector",
  mode: "custom",
  hideInput: true,
  customRenderer: (JwtLocalInspectorComp as unknown) as ComponentType<CustomRendererProps>,
};

function JwtLocalInspectorComp() {
  const React = require("react") as typeof import("react");
  const [tokens, setTokens] = React.useState<{ key: string; value: string }[]>([]);
  React.useEffect(() => {
    const arr: { key: string; value: string }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        const v = localStorage.getItem(k) ?? "";
        if (v.split(".").length >= 2) arr.push({ key: k, value: v });
      }
    } catch { /* noop */ }
    setTokens(arr);
  }, []);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">JWTs found in localStorage ({tokens.length})</div>
      {tokens.length === 0 && <div className="text-sm text-muted-foreground">No JWT-like tokens found.</div>}
      {tokens.map(({ key, value }) => {
        const parts = value.split(".");
        const payload = parts[1] ? atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")) : "";
        return (
          <details key={key} className="mb-2">
            <summary className="text-xs font-mono cursor-pointer">{key}</summary>
            <pre className="text-xs font-mono bg-background p-2 mt-1 rounded-md whitespace-pre-wrap">{payload ? JSON.stringify(JSON.parse(payload), null, 2) : "(parse error)"}</pre>
          </details>
        );
      })}
    </div>
  );
}

const indexedDbViewer: ToolDefinition = {
  slug: "indexeddb-viewer",
  mode: "custom",
  hideInput: true,
  customRenderer: (IndexedDbViewerComp as unknown) as ComponentType<CustomRendererProps>,
};

function IndexedDbViewerComp() {
  const React = require("react") as typeof import("react");
  const [dbs, setDbs] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (typeof indexedDB !== "undefined") {
      indexedDB.databases().then((list) => setDbs(list.map((d) => d.name ?? "(unnamed)"))).catch(() => setDbs([]));
    }
  }, []);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">IndexedDB Databases</div>
      {dbs.length === 0 && <div className="text-sm text-muted-foreground">No databases found.</div>}
      {dbs.map((name) => <div key={name} className="text-sm font-mono py-1 border-b border-border/50">{name}</div>)}
    </div>
  );
}

const canvasDrawingTool: ToolDefinition = {
  slug: "canvas-drawing-tool",
  mode: "custom",
  hideInput: true,
  customRenderer: (CanvasDrawingComp as unknown) as ComponentType<CustomRendererProps>,
};

function CanvasDrawingComp() {
  const React = require("react") as typeof import("react");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = React.useState(false);
  const getCtx = () => canvasRef.current?.getContext("2d");
  React.useEffect(() => {
    const ctx = getCtx();
    if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 600, 400); ctx.lineCap = "round"; ctx.lineWidth = 2; }
  }, []);
  const start = (e: React.MouseEvent) => { const ctx = getCtx(); if (!ctx) return; ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); setDrawing(true); };
  const move = (e: React.MouseEvent) => { if (!drawing) return; const ctx = getCtx(); if (!ctx) return; ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke(); };
  const end = () => setDrawing(false);
  const clear = () => { const ctx = getCtx(); if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 600, 400); } };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex gap-2 mb-3">
        <button onClick={clear} className="h-8 px-3 rounded-md border border-border text-sm">Clear</button>
      </div>
      <canvas ref={canvasRef} width={600} height={400} className="w-full border border-border rounded-md bg-background cursor-crosshair" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} />
    </div>
  );
}

const webglShaderPlayground: ToolDefinition = {
  slug: "webgl-shader-playground",
  mode: "custom",
  hideInput: true,
  customRenderer: (WebGLShaderComp as unknown) as ComponentType<CustomRendererProps>,
};

function WebGLShaderComp() {
  const React = require("react") as typeof import("react");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [frag, setFrag] = React.useState(`precision mediump float;
uniform float u_time;
void main() {
  vec2 uv = gl_FragCoord.xy / vec2(400.0);
  float r = sin(u_time) * 0.5 + 0.5;
  gl_FragColor = vec4(r, uv.x, uv.y, 1.0);
}`);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;
    const vs = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0,1);}`;
    const fs = frag;
    function createShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) { console.error(gl!.getShaderInfoLog(s)); return null; }
      return s;
    }
    const vShader = createShader(gl.VERTEX_SHADER, vs);
    const fShader = createShader(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    let raf: number;
    const uTime = gl.getUniformLocation(prog, "u_time");
    const render = (t: number) => {
      gl!.uniform1f(uTime, t / 1000);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [frag]);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <textarea value={frag} onChange={(e) => setFrag(e.target.value)} className="h-64 rounded-md border border-border bg-background p-2 font-mono text-xs" spellCheck={false} />
      <canvas ref={canvasRef} width={400} height={400} className="w-full rounded-md border border-border" />
    </div>
  );
}

// ── Browser API Testers ──

function apiTesterSlug(suffix: string): ToolDefinition {
  return {
    slug: suffix,
    mode: "custom",
    hideInput: true,
    customRenderer: (() => {
      function Comp() {
        const React = require("react") as typeof import("react");
        const [result, setResult] = React.useState("Click the button to test the API.");
        const [supported, setSupported] = React.useState(true);
        const name = suffix.replace(/-/g, " ").replace("api tester", "").replace("api checker", "").trim();
        const testFn = async () => {
          const tests: Record<string, () => Promise<string>> = {
            "web-workers-playground": async () => { const w = new Worker(URL.createObjectURL(new Blob(["self.onmessage=e=>self.postMessage('pong')"], { type: "text/javascript" }))); const p = new Promise<string>((res) => { w.onmessage = (e) => res(String(e.data)); setTimeout(() => res("timeout"), 2000); }); w.postMessage("ping"); const r = await p; w.terminate(); return `Worker response: ${r}`; },
            "web-share-api-tester": async () => { if (!navigator.share) return "Web Share API not supported in this browser."; try { await navigator.share({ title: "Test", text: "Hello" }); return "Share dialog opened!"; } catch (e: unknown) { return `Share cancelled or error: ${e instanceof Error ? e.message : String(e)}`; } },
            "notification-api-tester": async () => { if (!("Notification" in window)) return "Notification API not supported."; const perm = await Notification.requestPermission(); return `Permission: ${perm}`; },
            "geolocation-tester": async () => new Promise((res) => navigator.geolocation.getCurrentPosition((p) => res(`Lat: ${p.coords.latitude}, Lng: ${p.coords.longitude}`), (e) => res(`Error: ${e.message}`))),
            "clipboard-api-tester": async () => { try { await navigator.clipboard.writeText("Racira Developers test"); return "Wrote 'Racira Developers test' to clipboard"; } catch (e) { return `Error: ${e instanceof Error ? e.message : String(e)}`; } },
            "battery-api-checker": async () => { const bat = await (navigator as unknown as Record<string, () => Promise<unknown>>).getBattery?.(); if (!bat) return "Battery API not supported."; const b = bat as { charging: boolean; level: number; chargingTime: number; dischargingTime: number }; return `Charging: ${b.charging}, Level: ${Math.round(b.level * 100)}%`; },
            "network-information-api-tester": async () => { const conn = (navigator as unknown as Record<string, Record<string, unknown>>).connection; if (!conn) return "Network Information API not supported."; return `Type: ${conn.effectiveType}, Downlink: ${conn.downlink}Mbps, RTT: ${conn.rtt}ms`; },
            "screen-orientation-tester": async () => { if (!screen.orientation) return "Screen Orientation API not supported."; return `Type: ${screen.orientation.type}, Angle: ${screen.orientation.angle}`; },
            "picture-in-picture-tester": async () => { const v = document.createElement("video"); v.src = ""; try { await (v as unknown as Record<string, () => Promise<void>>).requestPictureInPicture?.(); return "PiP opened"; } catch { return "PiP failed — needs a playing video"; } },
            "vibration-api-tester": async () => { if (!navigator.vibrate) return "Vibration API not supported."; navigator.vibrate(200); return "Vibrated 200ms"; },
          };
          const fn = tests[suffix];
          if (!fn) return;
          try { setResult(await fn()); } catch (e) { setResult(String(e)); }
        };
        return (
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API: {name}</div>
            <button onClick={testFn} className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm">Test API</button>
            <pre className="text-sm font-mono bg-background p-3 rounded-md whitespace-pre-wrap">{result}</pre>
          </div>
        );
      }
      return Comp;
    })() as unknown as ComponentType<CustomRendererProps>,
  };
}

const webSocketTester: ToolDefinition = {
  slug: "websocket-tester",
  mode: "custom",
  hideInput: true,
  customRenderer: (WebSocketTesterComp as unknown) as ComponentType<CustomRendererProps>,
};

function WebSocketTesterComp() {
  const React = require("react") as typeof import("react");
  const [url, setUrl] = React.useState("wss://echo.websocket.org");
  const [log, setLog] = React.useState<string[]>([]);
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const connect = () => {
    try {
      const socket = new WebSocket(url);
      socket.onopen = () => setLog((l) => [...l, "✓ Connected"]);
      socket.onmessage = (e) => setLog((l) => [...l, `← ${e.data}`]);
      socket.onclose = (e) => setLog((l) => [...l, `✗ Closed (${e.code})`]);
      socket.onerror = () => setLog((l) => [...l, "✗ Error"]);
      setWs(socket);
    } catch (e) { setLog((l) => [...l, String(e)]); }
  };
  const send = () => { if (ws) ws.send("ping"); };
  const close = () => { if (ws) ws.close(); };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="wss://..." className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm font-mono" />
        <button onClick={connect} className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm">Connect</button>
        <button onClick={send} className="h-8 px-3 rounded-md border border-border text-sm" disabled={!ws}>Send</button>
        <button onClick={close} className="h-8 px-3 rounded-md border border-destructive text-destructive text-sm" disabled={!ws}>Close</button>
      </div>
      <pre className="h-48 overflow-auto rounded-md bg-background p-2 text-xs font-mono">{log.join("\n") || "Log appears here…"}</pre>
    </div>
  );
}

export const browserTools: ToolDefinition[] = [
  localStorageViewer, localStorageManager, sessionStorageViewer, browserInfoDetector,
  jwtLocalInspector, indexedDbViewer, canvasDrawingTool, webglShaderPlayground,
  webSocketTester,
  apiTesterSlug("web-workers-playground"),
  apiTesterSlug("service-worker-inspector"),
  apiTesterSlug("web-share-api-tester"),
  apiTesterSlug("notification-api-tester"),
  apiTesterSlug("geolocation-tester"),
  apiTesterSlug("clipboard-api-tester"),
  apiTesterSlug("vibration-api-tester"),
  apiTesterSlug("battery-api-checker"),
  apiTesterSlug("network-information-api-tester"),
  apiTesterSlug("screen-orientation-tester"),
  apiTesterSlug("picture-in-picture-tester"),
];
