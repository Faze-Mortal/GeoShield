import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = siteConfig.siteUrl;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`,
  };
}
