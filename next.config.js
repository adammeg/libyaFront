const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['libya-auto-nyx6.vercel.app'],
  },
}

module.exports = nextTranslate(nextConfig)