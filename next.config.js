/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@vercel/postgres"],
  },
  images: {
    domains: ["your-blob-domain.vercel-storage.com"],
  },
};

module.exports = nextConfig;
