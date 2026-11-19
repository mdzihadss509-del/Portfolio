import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, CalendarDays } from 'lucide-react';
import MotionSurface from '@/components/MotionSurface';
import { getPublishedArticle } from '@/lib/public-data';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: 'Article not found | HADES' };
  return {
    title: `${article.title} | HADES Journal`,
    description: article.excerpt || 'An article from the HADES journal.',
    openGraph: { title: article.title, description: article.excerpt || '', images: article.cover_url ? [article.cover_url] : [] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();
  const paragraphs = String(article.body || '').split(/\n\s*\n/).map((part: string) => part.trim()).filter(Boolean);
  const date = article.published_at ? new Date(article.published_at) : null;
  return <main className="article-page">
    <header className="article-page-nav wrap"><Link href="/" className="article-back-link"><ArrowLeft size={16}/> BACK TO PORTFOLIO</Link><span className="article-brand-mark">H / JOURNAL</span></header>
    <article className="article-page-shell wrap">
      <div className="article-page-heading"><span className="article-page-kicker">HADES JOURNAL / FIELD NOTES</span><h1>{article.title}</h1>{article.excerpt && <p className="article-page-excerpt">{article.excerpt}</p>}<div className="article-page-meta">{date && <span><CalendarDays size={14}/>{date.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>}<span>{String(article.category || 'JOURNAL').toUpperCase()}</span></div></div>
      {article.cover_url && <MotionSurface className="article-page-cover" intensity={0.35}><Image src={article.cover_url} alt={article.title+' cover image'} width={1600} height={900} unoptimized/></MotionSurface>}
      <div className="article-page-content">{paragraphs.map((paragraph: string,index: number)=><p key={index}>{paragraph}</p>)}</div>
      <footer className="article-page-footer"><span>END OF ARTICLE / THANKS FOR READING</span><Link href="/#contact">LET&apos;S CONNECT <ArrowUpRight size={15}/></Link></footer>
    </article>
  </main>;
}