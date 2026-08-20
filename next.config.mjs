/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // jsdom (via isomorphic-dompurify and lib/export/docx.ts) reads asset
    // files relative to its own package directory at runtime; webpack
    // bundling that into a single chunk breaks those relative reads. Keep
    // it as a real require() instead of bundling it.
    serverComponentsExternalPackages: ["jsdom", "isomorphic-dompurify"],
  },
};

export default nextConfig;
