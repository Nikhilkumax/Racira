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
  transpilePackages: ['onnxruntime-web', 'kokoro-js', '@huggingface/transformers'],
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
      // Kokoro TTS (WASM via ORT) and FFmpeg audio tools need
      // SharedArrayBuffer, which requires cross-origin isolation.
      {
        source: '/voice/:path*',
        headers: coepHeaders,
      },
      {
        source: '/audio/:path*',
        headers: coepHeaders,
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
      // /voice and /audio run COEP: require-corp (above). The TTS engine's
      // subresources — onnxruntime-web's pthread worker script and wasm under
      // /ort/, espeak-ng's phonemizer wasm under /espeak/ — are same-origin,
      // but under require-corp they still need CORP: same-origin or the
      // browser blocks them with ERR_BLOCKED_BY_RESPONSE. Same failure shape
      // as the /ffmpeg rule above (e60bb620): the worker request never
      // loads, ORT session creation never settles, and /voice hangs forever
      // at loading-model with no error.
      //
      // CORP alone is NOT enough for the worker script: verified locally that
      // /ort/ort-wasm-simd-threaded.jsep.mjs still gets blocked with only
      // CORP: same-origin on the response — a module worker must carry a
      // COEP of its own to be compatible with the require-corp document, so
      // /ort/* mirrors the proven /ffmpeg rule exactly (CORP + credentialless).
      // /espeak/* is fetched as a plain subresource (no worker), so CORP
      // alone is sufficient there.
      {
        source: '/ort/:path*',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      {
        source: '/espeak/:path*',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
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
      // espeak-ng is a multi-environment Emscripten build. Its Node branch does
      // `await import('module')` to build a require() shim
      // (node_modules/espeak-ng/dist/espeak-ng.js:100). That branch is dead in the
      // browser, but webpack still resolves the specifier statically and fails —
      // Next 14's client fallback list has no `module` entry
      // (next/dist/build/webpack-config.js:1321-1347). Stubbing it to false lets
      // the unreachable branch compile away.
      module: false,
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
