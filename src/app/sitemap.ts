import { MetadataRoute } from 'next';
import citiesData from '@/data/cities.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://roofcost.us';

  const staticRoutes: MetadataRoute.Sitemap = ['/', '/calculator'].map(path => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
  }));

  const cityRoutes: MetadataRoute.Sitemap = citiesData.map(c => ({
    url: `${base}/roof-cost/${c.state}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...cityRoutes];
}
