/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "supreme-lamp-jqpx55jq6jr3pwxr-3000.app.github.dev", // Your Codespace URL
        // '.app.github.dev', // Allows all Codespace URLs
      ],
    },
    ppr: "incremental",
  },
  compiler: {
    options: {
      ignoreBrowserErrors: true,
    },
  },
};

module.exports = nextConfig;
