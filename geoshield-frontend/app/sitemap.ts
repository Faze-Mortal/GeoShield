import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteConfig.siteUrl;
  const lastModified = new Date('2026-10-10T00:00:00Z');

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/dashboard`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
