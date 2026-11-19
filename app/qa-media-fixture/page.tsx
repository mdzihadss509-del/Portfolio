import { notFound } from 'next/navigation';
import MediaShowcase from '@/components/MediaShowcase';
import type { MediaAsset } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

const fixture: MediaAsset = {
  id: 'qa-image-preview',
  public_url: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22500%22 viewBox=%220 0 800 500%22%3E%3Crect width=%22800%22 height=%22500%22 fill=%22%230b0b0b%22/%3E%3Ccircle cx=%22400%22 cy=%22250%22 r=%22125%22 fill=%22%23a78bfa%22/%3E%3Ctext x=%22400%22 y=%22270%22 fill=%22white%22 font-size=%2260%22 text-anchor=%22middle%22 font-family=%22Arial%22%3EH%3C/text%3E%3C/svg%3E',
  filename: 'qa-preview.svg',
  mime_type: 'image/svg+xml',
  size_bytes: 512,
  alt_text: 'QA preview fixture',
  created_at: '2026-11-19T00:00:00.000Z',
};

export default function MediaFixturePage() {
  if (process.env.PORTFOLIO_QA_FIXTURES !== '1') notFound();
  return <main><MediaShowcase assets={[fixture]} /></main>;
}
