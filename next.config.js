/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.PAGES_BASE_PATH || '',
  trailingSlash: true,
  env: {
    GITHUB_REPO_URL: 'https://github.com/mjanez/spain-cultural-pulse',
    PAGES_BASE_PATH: process.env.PAGES_BASE_PATH || '',
  },
}

module.exports = nextConfig
