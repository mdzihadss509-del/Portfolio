import type { Metadata } from 'next';
import './globals.css';
import { getPortfolioData } from '@/lib/public-data';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const general = data.settings.general || {};
  const seo = data.settings.seo || {};
  const branding = data.settings.branding || {};
  const title = seo.title || (general.display_name ? general.display_name + ' — Portfolio' : 'HADES — Portfolio & Creative Work');
  const description = seo.description || 'Professional portfolio, selected projects, creator work and collaborations.';
  return {
    title,
    description,
    icons: branding.favicon_url ? { icon: branding.favicon_url } : { icon: '/favicon.svg', shortcut: '/favicon.svg' },
    openGraph: { title, description, type: 'website', images: branding.og_image_url ? [branding.og_image_url] : undefined }
  };
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}