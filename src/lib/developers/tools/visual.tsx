import type { ToolDefinition, CustomRendererProps } from "@/components/developers/tools/registry";
import type { ComponentType } from "react";

// ── QR Code Generator ──

const qrCodeGenerator: ToolDefinition = {
  slug: "qr-code-generator",
  mode: "custom",
  hideInput: true,
  customRenderer: (QrCodeGeneratorComp as unknown) as ComponentType<CustomRendererProps>,
};

function QrCodeGeneratorComp() {
  const React = require("react") as typeof import("react");
  const [text, setText] = React.useState("https://example.com");
  const [dataUrl, setDataUrl] = React.useState("");
  React.useEffect(() => {
    import("qrcode").then((QR) => QR.toDataURL(text, { width: 256, margin: 1 })).then(setDataUrl).catch(() => setDataUrl(""));
  }, [text]);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" />
      <div className="flex justify-center">
        {dataUrl ? <img src={dataUrl} alt="QR" className="w-64 h-64" /> : <div className="w-64 h-64 border border-dashed border-border rounded-md flex items-center justify-center text-muted-foreground text-sm">QR will appear</div>}
      </div>
    </div>
  );
}

const qrCodeDecoder: ToolDefinition = {
  slug: "qr-code-decoder",
  mode: "custom",
  hideInput: true,
  customRenderer: (() => {
    function Comp() {
      const React = require("react") as typeof import("react");
      const [result, setResult] = React.useState("Upload a QR code image to decode.");
      const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            try {
              const jsQRModule = await import("jsqr");
              const jsQR = jsQRModule.default;
              if (typeof jsQR === "function") {
                const code = jsQR(imageData.data, canvas.width, canvas.height);
                setResult(code ? code.data : "No QR code found in image.");
              } else {
                setResult("QR decoding library did not load correctly.");
              }
            } catch {
              // Fallback to BarcodeDetector
              if ("BarcodeDetector" in window) {
                const BD = (window as unknown as Record<string, new () => { detect: (source: HTMLImageElement) => Promise<{ type: string; rawValue: string }[]> }>).BarcodeDetector;
                const detector = new BD();
                const barcodes = await detector.detect(img);
                setResult(barcodes.length ? barcodes[0].rawValue : "No QR found.");
              } else {
                setResult("QR decoding requires jsqr or BarcodeDetector API. This browser may not support it.");
              }
            }
          };
        } catch (e) { setResult(String(e)); }
      };
      return (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <label className="block h-10 w-full rounded-md border border-input bg-background flex items-center justify-center text-sm cursor-pointer hover:bg-accent">
            Upload QR image
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
          <pre className="text-sm font-mono bg-background p-3 rounded-md whitespace-pre-wrap">{result}</pre>
        </div>
      );
    }
    return Comp;
  })() as unknown as ComponentType<CustomRendererProps>,
};

// ── Barcode Generator / Decoder ──

const barcodeGenerator: ToolDefinition = {
  slug: "barcode-generator",
  mode: "text",
  transform: ({ input }) => {
    // Generate a Code 128-style representation (visual, not actual barcode).
    const digits = input.trim().replace(/[^0-9]/g, "");
    if (!digits) return { output: "Enter digits to encode." };
    // SVG barcode representation
    const bars: string[] = [];
    for (const d of digits) {
      const n = parseInt(d, 10);
      const pattern = (n * 7 + 3).toString(2).padStart(8, "0");
      bars.push(pattern);
    }
    const svgBars = bars.map((row, i) =>
      row.split("").map((ch, j) => ch === "1" ? `<rect x="${(i * 9 + j)}" y="0" width="1" height="60" fill="black"/>` : "").join("")
    ).join("\n");
    const w = bars.length * 9;
    return { output: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="80"><rect width="${w}" height="80" fill="white"/>${svgBars}</svg>`, html: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="80" viewBox="0 0 ${w} 80"><rect width="${w}" height="80" fill="white"/>${svgBars}</svg>` };
  },
};

const barcodeDecoder: ToolDefinition = {
  slug: "barcode-decoder",
  mode: "text",
  placeholder: "Paste barcode number or upload an image (use Upload button)…",
  transform: ({ input }) => {
    return { output: `Input: ${input}\n\nBarcode decoding from images requires a dedicated library.\nFor EAN/UPC codes, the text representation is the raw number.\nVisit: https://serratus.github.io/quaggaJS/ for a JS barcode decoder.`, info: "Best-effort client-only" };
  },
};

// ── SVG Generators ──

const svgBlobGenerator: ToolDefinition = {
  slug: "svg-blob-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const points = 6 + Math.floor(Math.random() * 5);
    const radii = Array.from({ length: points }, () => 40 + Math.random() * 60);
    const angles = Array.from({ length: points }, (_, i) => (Math.PI * 2 * i) / points);
    let path = "";
    for (let i = 0; i < points; i++) {
      const x = 150 + radii[i] * Math.cos(angles[i]);
      const y = 150 + radii[i] * Math.sin(angles[i]);
      const nx = 150 + radii[(i + 1) % points] * Math.cos(angles[(i + 1) % points]);
      const ny = 150 + radii[(i + 1) % points] * Math.sin(angles[(i + 1) % points]);
      const cp1x = 150 + radii[i] * 1.2 * Math.cos(angles[i] + 0.3);
      const cp1y = 150 + radii[i] * 1.2 * Math.sin(angles[i] + 0.3);
      const cp2x = 150 + radii[(i + 1) % points] * 1.2 * Math.cos(angles[(i + 1) % points] - 0.3);
      const cp2y = 150 + radii[(i + 1) % points] * 1.2 * Math.sin(angles[(i + 1) % points] - 0.3);
      path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${nx},${ny} `;
      if (i === 0) path = `M ${x},${y} ${path}`;
    }
    path += "Z";
    const svg = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="currentColor"/></svg>`;
    return { output: svg, html: svg };
  },
};

const svgWaveGenerator: ToolDefinition = {
  slug: "svg-wave-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const layers = 3;
    const paths = Array.from({ length: layers }, (_, i) => {
      const amp = 15 + i * 10;
      const freq = 0.008 + i * 0.003;
      const yOffset = 80 + i * 40;
      const d = Array.from({ length: 200 }, (_, x) => {
        const y = yOffset + Math.sin(x * freq + i * 1.5) * amp;
        return `${x === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ") + ` L 200 120 L 0 120 Z`;
      const opacity = 1 - i * 0.25;
      return `<path d="${d}" fill="rgba(99,102,241,${opacity})" />`;
    });
    const svg = `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">${paths.join("\n")}</svg>`;
    return { output: svg, html: svg };
  },
};

const svgBackgroundGenerator: ToolDefinition = {
  slug: "svg-background-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const patterns = [
      `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#f0f0ff"/><circle cx="20" cy="20" r="8" fill="#e0e0ff"/></svg>`,
      `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#f8fafc"/><line x1="0" y1="20" x2="20" y2="0" stroke="#e2e8f0" stroke-width="1"/></svg>`,
      `<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#faf5ff"/><circle cx="30" cy="30" r="15" fill="none" stroke="#e9d5ff" stroke-width="2"/></svg>`,
    ];
    const svg = patterns[Math.floor(Math.random() * patterns.length)];
    return { output: svg, html: `<div style="background-image:url('data:image/svg+xml,${encodeURIComponent(svg)}');width:100%;height:200px;border-radius:8px"></div>` };
  },
};

const svgToJsx: ToolDefinition = {
  slug: "svg-to-jsx",
  mode: "text",
  transform: ({ input }) => {
    let jsx = input.trim();
    jsx = jsx.replace(/\bclass=/g, "className=");
    jsx = jsx.replace(/\bfill-rule=/g, "fillRule=");
    jsx = jsx.replace(/\bclip-path=/g, "clipPath=");
    jsx = jsx.replace(/\bclip-rule=/g, "clipRule=");
    jsx = jsx.replace(/\bxlink:/g, "xlinkHref=");
    jsx = jsx.replace(/\bxmlns:xlink=["']([^"']+)["']/g, "");
    // Wrap in a component
    return { output: `const SvgIcon = ({ ...props }) => (\n  ${jsx}\n);\n\nexport default SvgIcon;` };
  },
};

const svgPathEditor: ToolDefinition = {
  slug: "svg-path-editor",
  mode: "text",
  placeholder: 'Paste SVG path data, e.g. M 10 80 C 40 10 65 10 95 80 S 150 150 180 80',
  transform: ({ input }) => {
    const path = input.trim();
    const commands = path.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) ?? [];
    const lines = commands.map((c, i) => `  [${i}] ${c.trim()}`);
    return { output: `Commands (${commands.length}):\n${lines.join("\n")}`, info: `${commands.length} commands` };
  },
};

const svgFilterGenerator: ToolDefinition = {
  slug: "svg-filter-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const filters = [
      { name: "Blur", code: `<filter id="blur"><feGaussianBlur in="SourceGraphic" stdDeviation="3"/></filter>` },
      { name: "Grayscale", code: `<filter id="gray"><feColorMatrix type="saturate" values="0"/></filter>` },
      { name: "Sepia", code: `<filter id="sepia"><feColorMatrix type="matrix" values="0.393 0.769 0.189 0 0  0.349 0.686 0.168 0 0  0.272 0.534 0.131 0 0  0 0 0 1 0"/></filter>` },
      { name: "Invert", code: `<filter id="invert"><feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/></filter>` },
      { name: "Contrast", code: `<filter id="contrast"><feComponentTransfer><feFuncR type="linear" slope="1.5" intercept="-0.25"/><feFuncG type="linear" slope="1.5" intercept="-0.25"/><feFuncB type="linear" slope="1.5" intercept="-0.25"/></feComponentTransfer></filter>` },
    ];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg">\n  <defs>\n${filters.map((f) => `    ${f.code}`).join("\n")}\n  </defs>\n</svg>`;
    return { output: svg };
  },
};

const svgClipPathGenerator: ToolDefinition = {
  slug: "svg-clip-path-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const shapes = [
      `<clipPath id="circle-clip"><circle cx="50" cy="50" r="40"/></clipPath>`,
      `<clipPath id="triangle-clip"><polygon points="50,10 90,90 10,90"/></clipPath>`,
      `<clipPath id="star-clip"><polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35"/></clipPath>`,
    ];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <defs>\n    ${shapes[Math.floor(Math.random() * shapes.length)]}\n  </defs>\n  <rect width="100" height="100" fill="currentColor" clip-path="url(#circle-clip)"/>\n</svg>`;
    return { output: svg, html: svg };
  },
};

// ── Remaining CSS tools not in css.ts ──

const flexboxPlayground: ToolDefinition = {
  slug: "flexbox-playground",
  mode: "custom",
  hideInput: true,
  customRenderer: (FlexboxComp as unknown) as ComponentType<CustomRendererProps>,
};

function FlexboxComp() {
  const React = require("react") as typeof import("react");
  const [opts, setOpts] = React.useState<Record<string, string>>({ justify: "flex-start", align: "center", direction: "row", wrap: "wrap" });
  const items = Array.from({ length: 5 }, (_, i) => i);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["justify", "align", "direction", "wrap"] as const).map((k) => (
          <select key={k} value={opts[k] ?? ""} onChange={(e) => setOpts({ ...opts, [k]: e.target.value })} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
            {k === "justify" ? ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"].map((o) => <option key={o} value={o}>{o}</option>) : null}
            {k === "align" ? ["stretch", "flex-start", "center", "flex-end"] : null}
            {k === "direction" ? ["row", "column", "row-reverse", "column-reverse"] : null}
            {k === "wrap" ? ["nowrap", "wrap", "wrap-reverse"] : null}
          </select>
        ))}
      </div>
      <div
        className="min-h-48 rounded-md border border-border bg-muted/30 p-4"
        style={{ display: "flex", justifyContent: String(opts.justify), alignItems: String(opts.align), flexDirection: String(opts.direction) as never, flexWrap: String(opts.wrap) as never }}
      >
        {items.map((n) => <div key={n} className="w-14 h-14 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary">{n + 1}</div>)}
      </div>
      <pre className="text-xs font-mono bg-background p-2 rounded-md">{`display: flex;\njustify-content: ${opts.justify};\nalign-items: ${opts.align};\nflex-direction: ${opts.direction};\nflex-wrap: ${opts.wrap};`}</pre>
    </div>
  );
}

const cssFlexboxVisualBuilder: ToolDefinition = { ...flexboxPlayground, slug: "css-flexbox-visual-builder" };

const cssGridGenerator: ToolDefinition = {
  slug: "css-grid-generator",
  mode: "custom",
  hideInput: true,
  customRenderer: (CssGridComp as unknown) as ComponentType<CustomRendererProps>,
};

function CssGridComp() {
  const React = require("react") as typeof import("react");
  const [cols, setCols] = React.useState(3);
  const [rows, setRows] = React.useState(2);
  const [gap, setGap] = React.useState(8);
  const n = cols * rows;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-3">
        <label className="text-xs">Cols <input type="number" value={cols} min={1} max={8} onChange={(e) => setCols(Number(e.target.value))} className="h-8 w-14 rounded-md border border-input bg-background px-2 text-sm" /></label>
        <label className="text-xs">Rows <input type="number" value={rows} min={1} max={6} onChange={(e) => setRows(Number(e.target.value))} className="h-8 w-14 rounded-md border border-input bg-background px-2 text-sm" /></label>
        <label className="text-xs">Gap <input type="number" value={gap} min={0} max={32} onChange={(e) => setGap(Number(e.target.value))} className="h-8 w-14 rounded-md border border-input bg-background px-2 text-sm" /></label>
      </div>
      <div className="rounded-md border border-border bg-muted/30 p-4" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gap}px` }}>
        {Array.from({ length: n }, (_, i) => <div key={i} className="h-12 rounded bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary">{i + 1}</div>)}
      </div>
      <pre className="text-xs font-mono bg-background p-2 rounded-md">{`display: grid;\ngrid-template-columns: repeat(${cols}, 1fr);\ngap: ${gap}px;`}</pre>
    </div>
  );
}

const cssGridVisualBuilder: ToolDefinition = { ...cssGridGenerator, slug: "css-grid-visual-builder" };

const cssAnimationGenerator: ToolDefinition = {
  slug: "css-animation-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const animations = [
      { name: "Bounce", keyframes: "0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}", css: "animation: bounce 0.6s infinite" },
      { name: "Fade In", keyframes: "from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}", css: "animation: fadeIn 0.5s ease-out" },
      { name: "Spin", keyframes: "from{transform:rotate(0deg)}to{transform:rotate(360deg)}", css: "animation: spin 1s linear infinite" },
      { name: "Pulse", keyframes: "0%,100%{transform:scale(1)}50%{transform:scale(1.05)}", css: "animation: pulse 2s ease-in-out infinite" },
    ];
    const a = animations[Math.floor(Math.random() * animations.length)];
    return { output: `@keyframes ${a.name.toLowerCase().replace(/\s/g, "")} {\n  ${a.keyframes}\n}\n\n.animated {\n  ${a.css};\n}` };
  },
};

const cssAnimationPlayground: ToolDefinition = { ...cssAnimationGenerator, slug: "css-animation-playground" };

const cssLoaderGenerator: ToolDefinition = {
  slug: "css-loader-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const loaders = [
      { name: "Spinner", css: ".loader{width:40px;height:40px;border:4px solid #e5e7eb;border-top-color:#4f46e5;border-radius:50%;animation:spin 0.8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}" },
      { name: "Dots", css: ".loader{display:flex;gap:8px}.loader span{width:12px;height:12px;border-radius:50%;background:#4f46e5;animation:bounce 1.4s ease-in-out infinite}.loader span:nth-child(2){animation-delay:0.16s}.loader span:nth-child(3){animation-delay:0.32s}@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}" },
      { name: "Bar", css: ".loader{width:60px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;position:relative}.loader::after{content:'';position:absolute;width:50%;height:100%;background:#4f46e5;border-radius:3px;animation:bar 1.2s ease-in-out infinite}@keyframes bar{0%{left:-50%}100%{left:100%}}" },
    ];
    return { output: loaders[Math.floor(Math.random() * loaders.length)].css };
  },
};

const cssClipPathGenerator: ToolDefinition = {
  slug: "css-clip-path-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const clips = [
      "circle(50%)",
      "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      "ellipse(50% 40% at 50% 50%)",
      "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
    ];
    const clip = clips[Math.floor(Math.random() * clips.length)];
    return { output: `clip-path: ${clip};`, html: `<div style="width:200px;height:200px;background:linear-gradient(135deg,#4f46e5,#ec4899);margin:20px auto;${clip.includes("polygon") ? `clip-path:${clip}` : `clip-path:${clip}`}"></div>` };
  },
};

const cssMaskingGenerator: ToolDefinition = {
  slug: "css-masking-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  transform: () => {
    const masks = [
      "linear-gradient(45deg, transparent 40%, black 60%)",
      "radial-gradient(circle, black 40%, transparent 70%)",
      "linear-gradient(to bottom, black 0%, transparent 100%)",
    ];
    const mask = masks[Math.floor(Math.random() * masks.length)];
    return { output: `mask-image: ${mask};\n-webkit-mask-image: ${mask};` };
  },
};

const cssCounterStyleGenerator: ToolDefinition = {
  slug: "css-counter-style-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => ({
    output: `@counter-style emojis {\n  system: cyclic;\n  symbols: "🔴" "🟠" "🟡" "🟢" "🔵" "🟣";\n  suffix: " ";\n}\n\nol.custom-list {\n  list-style: emojis;\n}`,
  }),
};

const cssCustomPropertiesInspector: ToolDefinition = {
  slug: "css-custom-properties-inspector",
  mode: "text",
  placeholder: "Paste CSS with custom properties (--var: value)…",
  transform: ({ input }) => {
    const vars = input.match(/--[\w-]+\s*:\s*[^;]+/g) ?? [];
    if (!vars.length) return { output: "No custom properties (--*) found." };
    return { output: vars.join("\n"), info: `${vars.length} custom properties` };
  },
};

const cssTransformPlayground: ToolDefinition = {
  slug: "css-transform-playground",
  mode: "custom",
  hideInput: true,
  customRenderer: (CssTransformComp as unknown) as ComponentType<CustomRendererProps>,
};

function CssTransformComp() {
  const React = require("react") as typeof import("react");
  const [rotate, setRotate] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const [tx, setTx] = React.useState(0);
  const [ty, setTy] = React.useState(0);
  const style = `transform: rotate(${rotate}deg) scale(${scale}) translate(${tx}px, ${ty}px)`;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-3">
        <label className="text-xs">Rotate <input type="range" min={-180} max={180} value={rotate} onChange={(e) => setRotate(Number(e.target.value))} className="w-24" /> {rotate}°</label>
        <label className="text-xs">Scale <input type="range" min={0.5} max={2} step={0.1} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-24" /> {scale}</label>
        <label className="text-xs">X <input type="range" min={-100} max={100} value={tx} onChange={(e) => setTx(Number(e.target.value))} className="w-24" /> {tx}px</label>
        <label className="text-xs">Y <input type="range" min={-100} max={100} value={ty} onChange={(e) => setTy(Number(e.target.value))} className="w-24" /> {ty}px</label>
      </div>
      <div className="h-48 flex items-center justify-center bg-muted/30 rounded-md">
        <div style={{ width: 80, height: 80, background: "linear-gradient(135deg, #4f46e5, #ec4899)", borderRadius: 12, transform: `rotate(${rotate}deg) scale(${scale}) translate(${tx}px, ${ty}px)` }} />
      </div>
      <pre className="text-xs font-mono bg-background p-2 rounded-md">{style};</pre>
    </div>
  );
}

const cssVariablesGenerator: ToolDefinition = {
  slug: "css-variables-generator",
  mode: "text",
  placeholder: "key=value per line\nprimary=#4f46e5\nsecondary=#ec4899",
  transform: ({ input }) => {
    const lines = input.split(/\r?\n/).filter(Boolean);
    const vars = lines.map((l) => {
      const [k, v] = l.split("=");
      return `--${k.trim()}: ${v.trim()};`;
    });
    return { output: `:root {\n  ${vars.join("\n  ")}\n}` };
  },
};

const cssSpecificityCalculatorTool: ToolDefinition = {
  slug: "css-specificity-calculator",
  mode: "text",
  placeholder: "div.container > .item[data-active]::before",
  transform: ({ input }) => {
    const sel = input.trim();
    const ids = (sel.match(/#/g) ?? []).length;
    const cls = (sel.match(/\.[a-zA-Z]/g) ?? []).length + (sel.match(/\[[^\]]+\]/g) ?? []).length + (sel.match(/:[a-zA-Z][\w-]*(?!:)/g) ?? []).length;
    const els = (sel.match(/\b[a-z][a-z0-9-]*\b/gi) ?? []).filter((t) => !["not", "is", "where", "has", "nth-child", "nth-of-type", "first-child", "last-child"].includes(t.toLowerCase())).length;
    const pseudoEl = (sel.match(/::[a-z-]+/gi) ?? []).length;
    return { output: `Selector: ${sel}\nIDs: ${ids} | Classes/Attrs/Pseudo-classes: ${cls} | Elements: ${els + pseudoEl}\nSpecificity: (${ids}, ${cls}, ${els + pseudoEl})\nDecimal value: ${ids * 100 + cls * 10 + els + pseudoEl}` };
  },
};

const scrollbarGenerator: ToolDefinition = {
  slug: "scrollbar-generator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => ({
    output: `/* Custom Scrollbar */\n::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n\n::-webkit-scrollbar-track {\n  background: #f1f5f9;\n  border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb {\n  background: #94a3b8;\n  border-radius: 4px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n  background: #64748b;\n}\n\n/* Firefox */\n* {\n  scrollbar-width: thin;\n  scrollbar-color: #94a3b8 #f1f5f9;\n}`,
  }),
};

const responsiveBreakpointTester: ToolDefinition = {
  slug: "responsive-breakpoint-tester",
  mode: "custom",
  hideInput: true,
  customRenderer: (BreakpointComp as unknown) as ComponentType<CustomRendererProps>,
};

function BreakpointComp() {
  const React = require("react") as typeof import("react");
  const [w, setW] = React.useState(375);
  const presets = [
    { name: "iPhone SE", w: 375 }, { name: "iPad", w: 768 }, { name: "Laptop", w: 1024 },
    { name: "Desktop", w: 1280 }, { name: "Wide", w: 1536 },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        {presets.map((p) => (
          <button key={p.w} onClick={() => setW(p.w)} className={`px-3 py-1 rounded-md text-xs border ${w === p.w ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{p.name} ({p.w})</button>
        ))}
      </div>
      <div className="mx-auto border border-border rounded-md overflow-hidden" style={{ width: Math.min(w, 800), maxWidth: "100%", height: 400, background: "#fff" }}>
        <div className="h-6 bg-muted flex items-center justify-center text-[10px] text-muted-foreground">{w}px</div>
        <div className="p-3 text-xs text-gray-500">Content preview area. Set your CSS breakpoints to test.</div>
      </div>
    </div>
  );
}

const viewportSizeSimulator: ToolDefinition = {
  slug: "viewport-size-simulator",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => ({
    output: `Current viewport:\n  Width:  ${typeof window !== "undefined" ? window.innerWidth : "—"}px\n  Height: ${typeof window !== "undefined" ? window.innerHeight : "—"}px\n  DPR:    ${typeof window !== "undefined" ? window.devicePixelRatio : "—"}\n\nCommon breakpoints:\n  sm:  640px\n  md:  768px\n  lg:  1024px\n  xl:  1280px\n  2xl: 1536px`,
  }),
};

export const visualTools: ToolDefinition[] = [
  qrCodeGenerator, qrCodeDecoder, barcodeGenerator, barcodeDecoder,
  svgBlobGenerator, svgWaveGenerator, svgBackgroundGenerator, svgToJsx,
  svgPathEditor, svgFilterGenerator, svgClipPathGenerator,
  flexboxPlayground, cssFlexboxVisualBuilder, cssGridGenerator, cssGridVisualBuilder,
  cssAnimationGenerator, cssAnimationPlayground, cssLoaderGenerator,
  cssClipPathGenerator, cssMaskingGenerator, cssCounterStyleGenerator,
  cssCustomPropertiesInspector, cssTransformPlayground, cssVariablesGenerator,
  cssSpecificityCalculatorTool, scrollbarGenerator,
  responsiveBreakpointTester, viewportSizeSimulator,
];
