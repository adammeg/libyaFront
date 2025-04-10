const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextTranslate(nextConfig)