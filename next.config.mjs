/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable source maps for debugging
  productionBrowserSourceMaps: true,
  webpack: (config, { dev }) => {
    // Enable source maps in development for debugging
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    return config;
  }
};

export default nextConfig;