/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const isExternalApi = /^https?:\/\//.test(apiUrl);

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Solo en modo "dos procesos" (API en otro dominio/puerto) redirigimos
  // /uploads a la API. En modo "un solo proceso" Express ya sirve /uploads
  // en el mismo dominio, así que no hace falta reescritura.
  async rewrites() {
    if (!isExternalApi) return [];
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
