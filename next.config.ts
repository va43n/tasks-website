import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asooxovwhivjltdaiozk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
