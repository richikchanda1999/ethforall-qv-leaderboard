/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    EAS_ENDPOINT: process.env.EAS_ENDPOINT,
    DEVFOLIO_ENDPOINT: process.env.DEVFOLIO_ENDPOINT,
  }
}

module.exports = nextConfig
