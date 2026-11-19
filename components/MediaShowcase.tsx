'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Archive,
  ArrowDownToLine,
  ArrowUpRight,
  File,
  FileText,
  Image as ImageIcon,
  Music2,
  Package,
  Video,
  type LucideIcon,
} from 'lucide-react';
import MotionSurface from '@/components/MotionSurface';
import Reveal from '@/components/Reveal';
import type { MediaAsset } from '@/lib/public-data';

type AssetKind = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'file';
type MediaFilter = 'all' | 'image' | 'video' | 'audio' | 'document' | 'files';

const FILTERS: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All assets' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
  { value: 'files', label: 'Other files' },
];

const KIND_ICONS: Record<AssetKind, LucideIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music2,
  document: FileText,
  archive: Archive,
  file: File,
};

const DOCUMENT_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'txt', 'rtf', 'csv', 'xls', 'xlsx',
  'ppt', 'pptx', 'md', 'json', 'xml',
]);
const ARCHIVE_EXTENSIONS = new Set(['zip', 'jar', 'rar', '7z', 'tar', 'gz']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'bmp']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']);

function extensionOf(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || 'file';
}

function assetKind(asset: MediaAsset): AssetKind {
  const mime = (asset.mime_type || '').toLowerCase();
  const extension = extensionOf(asset.filename || '');

  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (mime.startsWith('video/') || VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (mime === 'application/pdf' || DOCUMENT_EXTENSIONS.has(extension)) return 'document';
  if (ARCHIVE_EXTENSIONS.has(extension) || /compressed|zip|x-jar/.test(mime)) return 'archive';
  return 'file';
}

function formatBytes(value: number | string | null) {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return 'SIZE NOT SET';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function downloadUrl(url: string, filename: string) {
  try {
    const target = new URL(url);
    target.searchParams.set('download', filename);
    return target.toString();
  } catch {
    return url;
  }
}

function dateLabel(value: string | null) {
  if (!value) return 'IN THE LIBRARY';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'IN THE LIBRARY';
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

function MediaAssetCard({ asset, index }: { asset: MediaAsset; index: number }) {
  const [imageOpen, setImageOpen] = useState(false);
  const kind = assetKind(asset);
  const Icon = KIND_ICONS[kind];
  const extension = extensionOf(asset.filename || '').toUpperCase();
  const url = asset.public_url || '';
  const name = asset.filename || 'Untitled asset';
  const label = asset.alt_text?.trim() || name;
  const needsDownload = kind === 'archive' || kind === 'file' || (kind === 'document' && extension !== 'PDF');

  useEffect(() => {
    if (!imageOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImageOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [imageOpen]);

  return (
    <div className="media-showcase-item" data-media-card data-media-kind={kind}>
      <MotionSurface as="article" className="media-showcase-card" intensity={0.38}>
        <div className="media-showcase-card-top">
          <span className="media-showcase-index">{String(index + 1).padStart(2, '0')} / STUDIO ASSET</span>
          <span className="media-showcase-type"><Icon size={13}/>{kind.toUpperCase()}</span>
        </div>

        {kind === 'image' && (
          <button
            className="media-showcase-preview media-showcase-image media-showcase-image-button"
            type="button"
            onClick={() => setImageOpen(true)}
            aria-label={`View details for image: ${name}`}
          >
            <Image src={url} alt={label} width={1200} height={800} unoptimized loading="lazy"/>
            <span className="media-showcase-preview-corner">VIEW DETAILS <ArrowUpRight size={14}/></span>
          </button>
        )}

        {kind === 'video' && (
          <div className="media-showcase-preview media-showcase-video">
            <video src={url} controls playsInline preload="metadata" aria-label={name}/>
          </div>
        )}

        {kind === 'audio' && (
          <div className="media-showcase-preview media-showcase-audio">
            <div className="media-showcase-file-art">
              <Music2 size={35}/>
              <strong>{extension}</strong>
              <span>AUDIO FILE</span>
            </div>
            <audio src={url} controls preload="none" aria-label={name}/>
          </div>
        )}

        {(kind === 'document' || kind === 'archive' || kind === 'file') && (
          <a
            className={`media-showcase-preview media-showcase-file media-showcase-file--${kind}`}
            href={needsDownload ? downloadUrl(url, name) : url}
            target={needsDownload ? undefined : '_blank'}
            rel={needsDownload ? undefined : 'noreferrer'}
            download={needsDownload ? name : undefined}
            aria-label={`${needsDownload ? 'Download' : 'Open'} ${name}`}
          >
            <span className="media-showcase-file-orbit media-showcase-file-orbit-one"/>
            <span className="media-showcase-file-orbit media-showcase-file-orbit-two"/>
            <span className="media-showcase-file-icon"><Icon size={34}/></span>
            <strong>{extension}</strong>
            <span className="media-showcase-file-label">
              {kind === 'document' ? 'DOCUMENT' : kind === 'archive' ? 'ARCHIVE / PACKAGE' : 'DIGITAL FILE'}
            </span>
            <span className="media-showcase-preview-corner">{needsDownload ? 'DOWNLOAD' : 'OPEN FILE'} <ArrowUpRight size={14}/></span>
          </a>
        )}

        <div className="media-showcase-info">
          <h3 title={name}>{name}</h3>
          <p>{label === name ? 'Added to the HADES media library' : label}</p>
          <div className="media-showcase-meta">
            <span>{formatBytes(asset.size_bytes)}</span>
            <span>{dateLabel(asset.created_at)}</span>
          </div>
          <div className="media-showcase-actions">
            <span><i/>AVAILABLE IN THE STUDIO</span>
            {needsDownload && <a href={downloadUrl(url, name)} download={name} aria-label={`Download ${name}`}><ArrowDownToLine size={15}/></a>}
            {!needsDownload && <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${name}`}><ArrowUpRight size={15}/></a>}
          </div>
        </div>
      </MotionSurface>
      {kind === 'image' && imageOpen && (
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Image details: ${name}`}
          onClick={() => setImageOpen(false)}
        >
          <div className="media-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="media-lightbox-close" onClick={() => setImageOpen(false)} aria-label="Close image preview">×</button>
            <div className="media-lightbox-image-wrap">
              <Image src={url} alt={label} width={1600} height={1200} unoptimized/>
            </div>
            <div className="media-lightbox-details">
              <span className="media-showcase-type"><ImageIcon size={14}/> IMAGE / MEDIA LIBRARY</span>
              <h2>{name}</h2>
              <p>{label === name ? 'Added to the HADES media library.' : label}</p>
              <div className="media-showcase-meta">
                <span>{formatBytes(asset.size_bytes)}</span>
                <span>{dateLabel(asset.created_at)}</span>
                <span>{extension}</span>
              </div>
              <a className="media-lightbox-download" href={downloadUrl(url, name)} download={name}>
                <ArrowDownToLine size={16}/> DOWNLOAD IMAGE
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MediaShowcase({ assets }: { assets: MediaAsset[] }) {
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');

  const counts = useMemo(() => {
    const result: Record<MediaFilter, number> = {
      all: assets.length,
      image: 0,
      video: 0,
      audio: 0,
      document: 0,
      files: 0,
    };
    assets.forEach((asset) => {
      const kind = assetKind(asset);
      if (kind === 'image' || kind === 'video' || kind === 'audio' || kind === 'document') {
        result[kind] += 1;
      } else {
        result.files += 1;
      }
    });
    return result;
  }, [assets]);

  const filteredAssets = useMemo(
    () => assets.filter((asset) => {
      if (activeFilter === 'all') return true;
      const kind = assetKind(asset);
      if (activeFilter === 'files') return kind === 'archive' || kind === 'file';
      return kind === activeFilter;
    }),
    [activeFilter, assets],
  );

  if (!assets.length) return null;

  return (
    <section className="section wrap media-showcase" id="media-library" aria-labelledby="media-showcase-title">
      <div className="section-head">
        <span className="section-no">10 / MEDIA ARCHIVE</span>
        <span className="section-note">THE FILES BEHIND THE WORK</span>
      </div>
      <div className="media-showcase-heading">
        <div>
          <span className="media-showcase-kicker">HADES / DIGITAL ASSET LIBRARY</span>
          <h2 id="media-showcase-title">Made to be<br/><em>experienced.</em></h2>
        </div>
        <div className="media-showcase-intro">
          <p>Selected visuals, motion, documents and digital resources — published directly from the studio media library.</p>
          <span className="media-showcase-total"><b>{assets.length.toString().padStart(2, '0')}</b> ASSETS AVAILABLE</span>
        </div>
      </div>

      <div className="media-showcase-toolbar" aria-label="Filter media assets">
        <span className="media-showcase-toolbar-label">BROWSE BY FORMAT</span>
        <div className="media-showcase-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              data-media-filter={filter.value}
              aria-pressed={activeFilter === filter.value}
              className={activeFilter === filter.value ? 'active' : ''}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}<span>{counts[filter.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredAssets.length ? (
        <div className="media-showcase-grid">
          {filteredAssets.map((asset, index) => (
            <Reveal key={asset.id} className="media-card-reveal">
              <MediaAssetCard asset={asset} index={index}/>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="media-showcase-empty">
          <Package size={25}/>
          <span>NO ASSETS IN THIS FORMAT</span>
          <button type="button" onClick={() => setActiveFilter('all')}>VIEW ALL ASSETS <ArrowUpRight size={14}/></button>
        </div>
      )}
      <div className="media-showcase-footnote">
        <span>SYNCED FROM ADMIN / MEDIA LIBRARY</span>
        <span>NEW UPLOADS APPEAR HERE AUTOMATICALLY</span>
      </div>
    </section>
  );
}
