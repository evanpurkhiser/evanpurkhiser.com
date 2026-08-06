import {initOpenNextCloudflareForDev} from '@opennextjs/cloudflare';
import type {NextConfig} from 'next';

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['100.124.157.144'],
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
