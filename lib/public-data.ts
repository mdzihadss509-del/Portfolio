import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const db = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

// Public CMS records have table-specific columns that are validated by the consuming section renderers.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PortfolioRow = Record<string, any>;
export type MediaAsset = {
  id: string;
  public_url: string | null;
  filename: string;
  mime_type: string | null;
  size_bytes: number | string | null;
  alt_text: string | null;
  created_at: string | null;
};
export type PortfolioData = {
  settings: Record<string, unknown>;
  sections: PortfolioRow[];
  projects: PortfolioRow[];
  skills: PortfolioRow[];
  experiences: PortfolioRow[];
  education: PortfolioRow[];
  services: PortfolioRow[];
  testimonials: PortfolioRow[];
  articles: PortfolioRow[];
  videos: PortfolioRow[];
  socials: PortfolioRow[];
  navigation: PortfolioRow[];
  mediaAssets: MediaAsset[];
};

export async function getPublishedArticle(slug: string): Promise<PortfolioRow | null> {
  if (!db || !slug) return null;
  const { data, error } = await db.from('articles').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error) {
    console.error('Published article query failed:', error.message);
    return null;
  }
  return data as PortfolioRow | null;
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const empty: PortfolioData = { settings: {}, sections: [], projects: [], skills: [], experiences: [], education: [], services: [], testimonials: [], articles: [], videos: [], socials: [], navigation: [], mediaAssets: [] };
  if (!db) return empty;
  const [settings, sections, projects, skills, experiences, education, services, testimonials, articles, videos, socials, navigation, mediaAssets] = await Promise.all([
    db.from('site_settings').select('key,value').in('key', ['branding','general','seo','contact']),
    db.from('sections').select('*').eq('is_visible', true).order('sort_order'),
    db.from('projects').select('*').eq('published', true).order('sort_order'),
    db.from('skills').select('*').eq('published', true).order('sort_order'),
    db.from('experiences').select('*').eq('published', true).order('sort_order'),
    db.from('education').select('*').eq('published', true).order('sort_order'),
    db.from('services').select('*').eq('published', true).order('sort_order'),
    db.from('testimonials').select('*').eq('published', true).order('sort_order'),
    db.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(6),
    db.from('videos').select('*').eq('is_visible', true).order('sort_order'),
    db.from('social_links').select('*').eq('is_visible', true).order('sort_order'),
    db.from('navigation_items').select('*').eq('is_visible', true).order('sort_order'),
    db.from('media_assets').select('id,public_url,filename,mime_type,size_bytes,alt_text,created_at').not('public_url', 'is', null).order('created_at', { ascending: false })
  ]);
  const values = [settings, sections, projects, skills, experiences, education, services, testimonials, articles, videos, socials, navigation, mediaAssets];
  const failed = values.find((v) => v.error);
  if (failed?.error) console.error('Portfolio data query failed:', failed.error.message);
  const settingMap = Object.fromEntries((settings.data || []).map((row) => [row.key, row.value]));
  const skillsRows = (skills.data || []).filter((row) => String(row.name || '').trim().toLowerCase() !== 'skill name');
  const experienceRows = (experiences.data || []).filter((row) => {
    const role = String(row.role || '').trim().toLowerCase();
    const company = String(row.company || '').trim().toLowerCase();
    return role !== 'role' && company !== 'company' && row.start_date !== '1111-11-11' && row.end_date !== '1111-11-11';
  });
  const serviceRows = (services.data || []).filter((row) => String(row.title || '').trim().toLowerCase() !== 'service title');
  const socialRows = (socials.data || []).filter((row) => typeof row.url === 'string' && row.url.trim().length > 0);

  return {
    settings: settingMap,
    sections: sections.data || [], projects: projects.data || [], skills: skillsRows,
    experiences: experienceRows, education: education.data || [], services: serviceRows,
    testimonials: testimonials.data || [], articles: articles.data || [], videos: videos.data || [],
    socials: socialRows, navigation: navigation.data || [], mediaAssets: (mediaAssets.data || []) as MediaAsset[]
  };
}