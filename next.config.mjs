/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    // Disable source maps in development
    if (dev) {
      config.devtool = false;
    }
    return config;
  }
};

export default nextConfig; 