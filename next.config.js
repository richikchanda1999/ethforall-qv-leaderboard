/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ENDPOINT: process.env.ENDPOINT,
  }
}

module.exports = nextConfig
