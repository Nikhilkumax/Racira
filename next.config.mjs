/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ]
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
