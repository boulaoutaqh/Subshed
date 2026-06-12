/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'subshed.vercel.app' }],
        destination: 'https://www.subshedapp.com/:path*',
        permanent: true,
      },
    ];
  },
};