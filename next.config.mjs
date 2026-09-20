/** @type {import('next').NextConfig} */
const nextConfig = {
  // A second dev server on this checkout (e.g. a Freebuff preview thread while
  // the main dev server runs) must isolate its build output, or the two
  // compilers corrupt each other through the shared .next/cache/webpack —
  // stale modules keep getting served after file edits. Set
  // RACIRA_DIST_DIR=.next-<name> for the secondary server only; unset, this
  // is exactly the stock '.next'.
  distDir: process.env.RACIRA_DIST_DIR || '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type-checking is done separately via `tsc --noEmit` in CI.
    // Skipping it during `next build` prevents OOM on Vercel (2-core / 8 GB)
    // when 1,450+ calculator components are compiled for SSR simultaneously.
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  transpilePackages: ['onnxruntime-web', '@mintplex-labs/piper-tts-web'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'racira.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    // LibreOffice WASM requires SharedArrayBuffer → COOP/COEP headers.
    // Scoped per-slug so only LibreOffice-dependent tools get cross-origin
    // isolation — does NOT affect other PDF tools, iframes, or embeds.
    const libreOfficeSlugs = [
      'excel-to-pdf', 'powerpoint-to-pdf', 'word-to-pdf',
      'odg-to-pdf', 'odp-to-pdf', 'ods-to-pdf', 'odt-to-pdf',
      'pages-to-pdf', 'pub-to-pdf', 'vsd-to-pdf',
      'wpd-to-pdf', 'wps-to-pdf',
    ];
    const coepHeaders = [
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
    ];
    return [
      // /tools/ route (general — unused but preserved for future)
      {
        source: '/tools/:path*',
        headers: coepHeaders,
      },
      // Individual /pdf/ slug entries for LibreOffice tools
      ...libreOfficeSlugs.map((slug) => ({
        source: `/pdf/${slug}`,
        headers: coepHeaders,
      })),
      // LibreOffice WASM assets also need COOP/COEP for worker context
      {
        source: '/libreoffice-wasm/:path*',
        headers: coepHeaders,
      },
      // Edit-PDF WASM (bentopdf-pdfium) needs SharedArrayBuffer in the iframe
      {
        source: '/edit-pdf-viewer/:path*',
        headers: coepHeaders,
      },
      // Edit-PDF page route also needs COOP/COEP for the iframe
      {
        source: '/pdf/edit-pdf-text',
        headers: coepHeaders,
      },
      // FFmpeg audio tools need SharedArrayBuffer, which requires cross-origin
      // isolation.
      //
      // Same requirement, different value for /voice. Speech synthesis runs on
      // WebAssembly in a browser worker, and without SharedArrayBuffer the
      // inference runtime silently drops from its multi-threaded build to the
      // single-threaded one — correct output, roughly half the throughput. So
      // /voice is cross-origin isolated, but with COEP *credentialless*:
      // require-corp would demand a Cross-Origin-Resource-Policy header on
      // every cross-origin subresource, and the inference runtime plus the
      // phonemizer are both fetched from public CDNs (cdnjs, jsDelivr) that do
      // not send one — the exact ERR_BLOCKED_BY_RESPONSE failure that got the
      // header pulled from this route the first time. credentialless enables
      // SharedArrayBuffer just the same while leaving credential-free
      // cross-origin loads (which is all /voice makes) unchecked.
      {
        source: '/audio/:path*',
        headers: coepHeaders,
      },
      //
      // Do not verify this by reading ort.env.wasm.numThreads: the runtime
      // clamps it to 1 only when it was left unset, and the speech library sets
      // it to hardwareConcurrency unconditionally — so the env reads 12 either
      // way, on a page that is isolated or not. The honest check is that the
      // runtime *spawns* its thread workers: isolated /voice logs 11
      // (hardwareConcurrency - 1); drop these headers and it spawns none.
      {
        source: '/voice',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      // FFmpeg tool pages run COEP: require-corp; their module worker and the
      // wasm it fetches are subresources of that context, so both must answer
      // with Cross-Origin-Resource-Policy: same-origin or the browser blocks
      // them with ERR_BLOCKED_BY_RESPONSE (see ffmpegEngine.ts load).
      {
        source: '/ffmpeg/:path*',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      // Any client-side module worker Next.js emits lands in a static chunk. On
      // a require-corp route the worker's own response must carry CORP (+ a
      // compatible COEP) or the browser blocks it with ERR_BLOCKED_BY_RESPONSE,
      // and the worker silently never constructs. Static chunks are same-origin
      // and carry no secrets, so credentialless is safe here.
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sitemap-:key-:category-:page.xml",
        destination: "/sitemaps/:key/:category/:page",
      },
    ];
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    }
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    })
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      "fs/promises": false,
    }
    config.module.parser = {
      ...config.module.parser,
      javascript: {
        ...config.module.parser?.javascript,
        url: false,
      },
    };
    return config
  },
};

export default nextConfig;
