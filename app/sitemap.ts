import type { MetadataRoute } from 'next';
import { getPortfolioData } from '@/lib/public-data';

const siteUrl = 'https://hades-portfolio-amber.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getPortfolioData();
  const pages: MetadataRoute.Sitemap = [{
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  }];

  for (const article of data.articles) {
    if (typeof article.slug !== 'string' || !article.slug.trim()) continue;
    pages.push({
      url: `${siteUrl}/blog/${encodeURIComponent(article.slug)}`,
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return pages;
}
