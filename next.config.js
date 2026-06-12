/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'subshed.vercel.app' }],
        destination: 'https://subshedapp.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.subshedapp.com' }],
        destination: 'https://subshedapp.com/:path*',
        permanent: true,
      },
    ];
  },
};