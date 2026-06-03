import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rwdogerkpubtrhpftoab.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
        port: '',
        pathname: '/tasks-website-bucket/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
