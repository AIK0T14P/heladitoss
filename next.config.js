/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["blogger.googleusercontent.com"],
  },
  devIndicators: {
    buildActivity: false,
    autoPrerender: false, // Oculta el mensaje "Static route"
  },
};

module.exports = nextConfig;
