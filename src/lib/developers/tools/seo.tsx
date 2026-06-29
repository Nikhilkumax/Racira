import type { ToolDefinition } from "@/components/developers/tools/registry";
import { OptionsBar, OptRow, OptSelect } from "@/components/developers/tools/options-controls";

const metaTagGenerator: ToolDefinition = {
  slug: "meta-tag-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const title = o.title ?? "";
    const desc = o.description ?? "";
    const url = o.url ?? "";
    const image = o.image ?? "";
    const tags = [
      title && `<title>${title}</title>`,
      desc && `<meta name="description" content="${desc}" />`,
      url && `<link rel="canonical" href="${url}" />`,
      title && `<meta property="og:title" content="${title}" />`,
      desc && `<meta property="og:description" content="${desc}" />`,
      url && `<meta property="og:url" content="${url}" />`,
      image && `<meta property="og:image" content="${image}" />`,
      title && `<meta name="twitter:card" content="summary_large_image" />`,
      title && `<meta name="twitter:title" content="${title}" />`,
      desc && `<meta name="twitter:description" content="${desc}" />`,
      image && `<meta name="twitter:image" content="${image}" />`,
    ].filter(Boolean);
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <input defaultValue={title} onChange={(e) => setOptions({ ...options, title: e.target.value })} placeholder="Title" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={desc} onChange={(e) => setOptions({ ...options, description: e.target.value })} placeholder="Description" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={url} onChange={(e) => setOptions({ ...options, url: e.target.value })} placeholder="URL" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={image} onChange={(e) => setOptions({ ...options, image: e.target.value })} placeholder="Image URL" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 text-xs font-mono whitespace-pre-wrap overflow-auto">{tags.join("\n") || "Fill the form →"}</pre>
      </div>
    );
  },
};

const metaTagPreview: ToolDefinition = {
  slug: "meta-tag-preview",
  mode: "text",
  placeholder: "Paste <meta> tags or a URL…",
  transform: ({ input }) => {
    const get = (re: RegExp) => re.exec(input)?.[1] ?? "";
    const title = get(/<title[^>]*>([^<]*)<\/title>/i) || get(/og:title["']\s+content=["']([^"']*)["']/i) || "Untitled";
    const desc = get(/name=["']description["']\s+content=["']([^"']*)["']/i) || get(/og:description["']\s+content=["']([^"']*)["']/i) || "";
    const img = get(/og:image["']\s+content=["']([^"']*)["']/i);
    return { output: `Title:       ${title}\nDescription: ${desc}\nImage:       ${img || "(none)"}` };
  },
};

const canonicalUrlGenerator: ToolDefinition = {
  slug: "canonical-url-generator",
  mode: "text",
  transform: ({ input }) => {
    try {
      const u = new URL(input.trim());
      const canon = `${u.protocol}//${u.host}${u.pathname.replace(/\/$/, "")}`;
      return { output: `<link rel="canonical" href="${canon}" />` };
    } catch {
      throw new Error("Invalid URL");
    }
  },
};

const robotsTxtGenerator: ToolDefinition = {
  slug: "robots-txt-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptSelect value={String(options.rule ?? "allow")} onChange={(v) => setOptions({ ...options, rule: v })} options={[{ value: "allow", label: "Allow all" }, { value: "disallow", label: "Disallow all" }, { value: "custom", label: "Custom" }]} />
      <OptRow label="Sitemap"><input defaultValue={String(options.sitemap ?? "https://example.com/sitemap.xml")} onChange={(e) => setOptions({ ...options, sitemap: e.target.value })} className="h-8 w-64 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { rule: "allow", sitemap: "https://example.com/sitemap.xml" },
  transform: ({ options }) => {
    const rule = String(options.rule ?? "allow");
    const body = rule === "disallow" ? "User-agent: *\nDisallow: /" : rule === "custom" ? "User-agent: *\nDisallow: /admin/\nDisallow: /private/" : "User-agent: *\nDisallow:";
    return { output: `${body}\n\nSitemap: ${options.sitemap}` };
  },
};

const sitemapGenerator: ToolDefinition = {
  slug: "sitemap-generator",
  mode: "text",
  placeholder: "Paste one URL per line…",
  transform: ({ input }) => {
    const urls = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!urls.length) return { output: "<?xml version=\"1.0\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n</urlset>" };
    const now = new Date().toISOString();
    const entries = urls.map((u) => `  <url>\n    <loc>${escapeXml(u)}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`).join("\n");
    return { output: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`, info: `${urls.length} URLs` };
  },
};

function escapeXml(s: string) { return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!)); }

const jsonLdGenerator: ToolDefinition = {
  slug: "json-ld-generator",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const type = o.type ?? "WebSite";
    const ld: Record<string, unknown> = { "@context": "https://schema.org", "@type": type, name: o.name ?? "", url: o.url ?? "" };
    if (o.description) ld.description = o.description;
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <OptSelect value={type} onChange={(v) => setOptions({ ...options, type: v })} options={["WebSite", "Article", "Organization", "Product", "FAQPage", "BreadcrumbList"].map((t) => ({ value: t, label: t }))} />
          <input defaultValue={o.name ?? ""} onChange={(e) => setOptions({ ...options, name: e.target.value })} placeholder="Name" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={o.url ?? ""} onChange={(e) => setOptions({ ...options, url: e.target.value })} placeholder="URL" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          <input defaultValue={o.description ?? ""} onChange={(e) => setOptions({ ...options, description: e.target.value })} placeholder="Description" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 text-xs font-mono whitespace-pre-wrap overflow-auto">{`<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`}</pre>
      </div>
    );
  },
};

const schemaOrgReference: ToolDefinition = {
  slug: "schema-org-reference",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const types = ["Thing", "Person", "Organization", "Place", "Event", "Product", "Offer", "Review", "Article", "NewsArticle", "WebSite", "WebPage", "BreadcrumbList", "FAQPage", "HowTo", "Recipe", "LocalBusiness", "VideoObject", "ImageObject", "Course"];
    return { output: types.map((t) => `https://schema.org/${t}`).join("\n"), data: types.map((name) => ({ Type: name, URL: `https://schema.org/${name}` })) };
  },
};

const httpStatusReference: ToolDefinition = {
  slug: "http-status-reference",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const codes: [string, string][] = [
      ["200", "OK"], ["201", "Created"], ["204", "No Content"],
      ["301", "Moved Permanently"], ["302", "Found"], ["304", "Not Modified"],
      ["400", "Bad Request"], ["401", "Unauthorized"], ["403", "Forbidden"], ["404", "Not Found"], ["405", "Method Not Allowed"], ["409", "Conflict"], ["418", "I'm a teapot"], ["422", "Unprocessable Entity"], ["429", "Too Many Requests"],
      ["500", "Internal Server Error"], ["501", "Not Implemented"], ["502", "Bad Gateway"], ["503", "Service Unavailable"], ["504", "Gateway Timeout"],
    ];
    return { output: codes.map(([c, d]) => `${c}\t${d}`).join("\n"), data: codes.map(([code, description]) => ({ Code: code, Description: description })) };
  },
};

const mimeTypeReference: ToolDefinition = {
  slug: "mime-type-reference",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const table = [[".html", "text/html"], [".css", "text/css"], [".js", "text/javascript"], [".json", "application/json"], [".xml", "application/xml"], [".png", "image/png"], [".jpg", "image/jpeg"], [".svg", "image/svg+xml"], [".pdf", "application/pdf"], [".zip", "application/zip"], [".mp4", "video/mp4"], [".mp3", "audio/mpeg"], [".woff2", "font/woff2"]] as const;
    return { output: table.map(([e, m]) => `${e}\t${m}`).join("\n"), data: table.map(([ext, mime]) => ({ Extension: ext, MIME: mime })) };
  },
};

const cookieInspector: ToolDefinition = {
  slug: "cookie-inspector",
  mode: "generator",
  hideInput: true,
  live: false,
  transform: () => {
    const cookies = typeof document !== "undefined" ? document.cookie.split("; ").map((c) => {
      const [k, ...v] = c.split("=");
      return { Name: k, Value: v.join("=") };
    }) : [];
    return { output: JSON.stringify(cookies, null, 2), data: cookies, info: `${cookies.length} cookies on this origin` };
  },
};

const cookieParser: ToolDefinition = {
  slug: "cookie-parser",
  mode: "text",
  placeholder: "Paste a Set-Cookie header value…",
  transform: ({ input }) => {
    const parts = input.split(";").map((p) => p.trim());
    if (!parts[0]?.includes("=")) throw new Error("Expected: name=value; Attr=…");
    const [name, ...val] = parts[0].split("=");
    const attrs: Record<string, string | boolean> = {};
    for (const p of parts.slice(1)) {
      const [k, ...v] = p.split("=");
      attrs[k.toLowerCase()] = v.length ? v.join("=") : true;
    }
    return { output: JSON.stringify({ name, value: val.join("="), attributes: attrs }, null, 2) };
  },
};

const formSchemaBuilder: ToolDefinition = {
  slug: "form-schema-builder",
  mode: "text",
  placeholder: "One field per line:  name:type\n\nemail:email\nage:number\nsubscribe:boolean",
  transform: ({ input }) => {
    const fields = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
      const [name, type = "text"] = line.split(":");
      return { name: name.trim(), type: type.trim(), required: true };
    });
    return { output: JSON.stringify({ type: "object", properties: fields, required: fields.map((f) => f.name) }, null, 2) };
  },
};

const utmBuilder: ToolDefinition = {
  slug: "utm-builder",
  mode: "custom",
  customRenderer: ({ options, setOptions }) => {
    const o = options as Record<string, string>;
    const params = new URLSearchParams();
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      if (o[k]) params.append(k, o[k]);
    }
    const base = o.url || "https://example.com";
    const final = params.toString() ? `${base}${base.includes("?") ? "&" : "?"}${params.toString()}` : base;
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <input defaultValue={o.url ?? ""} onChange={(e) => setOptions({ ...options, url: e.target.value })} placeholder="https://example.com" className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          {["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].map((k) => (
            <input key={k} defaultValue={o[k] ?? ""} onChange={(e) => setOptions({ ...options, [k]: e.target.value })} placeholder={k} className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm" />
          ))}
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 text-xs font-mono whitespace-pre-wrap break-all overflow-auto">{final}</pre>
      </div>
    );
  },
};

const cspHeaderGenerator: ToolDefinition = {
  slug: "csp-header-generator",
  mode: "generator",
  hideInput: true,
  live: true,
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <label className="text-xs flex items-center gap-1"><input type="checkbox" defaultChecked={Boolean(options.self)} onChange={(e) => setOptions({ ...options, self: e.target.checked })} /> 'self'</label>
      <label className="text-xs flex items-center gap-1"><input type="checkbox" defaultChecked={Boolean(options.https)} onChange={(e) => setOptions({ ...options, https: e.target.checked })} /> upgrade-insecure</label>
      <label className="text-xs flex items-center gap-1"><input type="checkbox" defaultChecked={Boolean(options.nonce)} onChange={(e) => setOptions({ ...options, nonce: e.target.checked })} /> nonces</label>
    </OptionsBar>
  ),
  defaultOptions: { self: true, https: true, nonce: false },
  transform: ({ options }) => {
    const parts: string[] = [];
    parts.push(`default-src ${options.self ? "'self'" : "'none'"}`);
    parts.push(`script-src ${options.self ? "'self'" : "'none'"}${options.nonce ? " 'nonce-<random>'" : ""}`);
    parts.push(`style-src ${options.self ? "'self'" : "'none'"} 'unsafe-inline'`);
    parts.push("img-src 'self' data:");
    parts.push("font-src 'self'");
    parts.push("connect-src 'self'");
    parts.push("frame-ancestors 'none'");
    parts.push("base-uri 'self'");
    parts.push("form-action 'self'");
    if (options.https) parts.push("upgrade-insecure-requests");
    return { output: `Content-Security-Policy: ${parts.join("; ")}` };
  },
};

const hreflangGenerator: ToolDefinition = {
  slug: "hreflang-generator",
  mode: "text",
  placeholder: "Paste locales, one per line:  en\nfr\nde",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Base URL"><input defaultValue={String(options.base ?? "https://example.com")} onChange={(e) => setOptions({ ...options, base: e.target.value })} className="h-8 w-56 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { base: "https://example.com" },
  transform: ({ input, options }) => {
    const locales = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const tags = locales.map((l) => `<link rel="alternate" hreflang="${l}" href="${options.base}/${l}" />`);
    tags.push(`<link rel="alternate" hreflang="x-default" href="${options.base}" />`);
    return { output: tags.join("\n") };
  },
};

const faviconsMetaGenerator: ToolDefinition = {
  slug: "favicons-meta-generator",
  mode: "text",
  options: ({ options, setOptions }) => (
    <OptionsBar>
      <OptRow label="Icon path"><input defaultValue={String(options.path ?? "/favicon.ico")} onChange={(e) => setOptions({ ...options, path: e.target.value })} className="h-8 w-56 rounded-md border border-input bg-background px-2 text-sm" /></OptRow>
    </OptionsBar>
  ),
  defaultOptions: { path: "/favicon.ico" },
  transform: ({ options }) => {
    const p = String(options.path ?? "/favicon.ico");
    return { output: `<link rel="icon" href="${p}" sizes="any" />\n<link rel="icon" href="/icon.svg" type="image/svg+xml" />\n<link rel="apple-touch-icon" href="/apple-touch-icon.png" />\n<link rel="manifest" href="/manifest.webmanifest" />` };
  },
};

export const seoTools: ToolDefinition[] = [
  metaTagGenerator, metaTagPreview, canonicalUrlGenerator, robotsTxtGenerator,
  sitemapGenerator, jsonLdGenerator, schemaOrgReference, httpStatusReference,
  mimeTypeReference, cookieInspector, cookieParser, formSchemaBuilder, utmBuilder,
  cspHeaderGenerator, hreflangGenerator, faviconsMetaGenerator,
];
