/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['lighthouse', 'puppeteer-core', '@sparticuz/chromium']
  }
}

export default nextConfig
