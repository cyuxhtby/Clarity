const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  //  process.env.NODE_ENV === "preview" ||
  //  process.env.NODE_ENV === "production",
  // uncomment two lines above to disable PWA in production deployment
  // add your own icons to public/manifest.json
  // to re-generate manifest.json, you can visit https://tomitm.github.io/appmanifest/
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  swcMinify: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
});
