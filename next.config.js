/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
      },
      { hostname: "djfbucket.s3.eu-north-1.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;
