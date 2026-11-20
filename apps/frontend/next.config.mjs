/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/quienes-somos',
        destination: '/universidad',
        permanent: true,
      },
      {
        source: '/nosotros',
        destination: '/universidad',
        permanent: true,
      },
      {
        source: '/programas',
        destination: '/oferta-academica',
        permanent: true,
      },
      {
        source: '/inscripciones',
        destination: '/admisiones',
        permanent: true,
      },
      {
        source: '/wp-login.php',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/wp-admin',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/mi-cuenta',
        destination: '/mi-iinicia',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
