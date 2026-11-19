import type { Metadata } from 'next';
import './globals.css';
import { getPortfolioData } from '@/lib/public-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const siteUrl = 'https://hades-portfolio-amber.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const general = data.settings.general || {};
  const seo = data.settings.seo || {};
  const branding = data.settings.branding || {};
  const siteName = branding.site_name || general.display_name || 'HADES';
  const title = seo.title || (general.display_name ? general.display_name + ' — Portfolio' : 'HADES — Portfolio & Creative Work');
  const description = seo.description || 'Professional portfolio, selected projects, creator work and collaborations.';
  const image = branding.og_image_url || undefined;
  const favicon = branding.favicon_url || '/favicon.svg';

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: '/' },
    icons: {
      icon: [{ url: favicon, type: favicon.endsWith('.svg') ? 'image/svg+xml' : undefined, sizes: 'any' }],
      shortcut: [{ url: favicon }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: siteUrl,
      siteName,
      locale: 'en_US',
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
