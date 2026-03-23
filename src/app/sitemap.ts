import { MetadataRoute } from 'next';
import geoDataRaw from '@/data/geo-cost-index.json';

const GEO_DATA: Record<string, any> = geoDataRaw;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roofcost.ai';
  
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/en/calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamically add regional SEO pages based on geo-cost-index
  // Deduplicate state/city pairs
  const citySet = new Set<string>();

  for (const [zip, data] of Object.entries(GEO_DATA)) {
    if (zip === '__default__') continue;
    
    if (data.state_code && data.metro_area) {
      const state = data.state_code.toLowerCase();
      // Format city name for URL: e.g. "New York City" -> "new-york-city"
      const cityUrlKey = data.metro_area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueKey = `${state}/${cityUrlKey}`;
      
      if (!citySet.has(uniqueKey)) {
        citySet.add(uniqueKey);
        routes.push({
          url: `${baseUrl}/en/roof-cost/${state}/${cityUrlKey}`,
          lastModified: new Date(), // Could be from data updated_at ideally
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
    }
  }

  return routes;
}
