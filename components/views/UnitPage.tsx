'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ExplorerPageData, Layer, Media } from '@/types/hierarchy.types';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { STATUS_LABELS, STATUS_CLASSES } from '@/lib/constants/status';

interface UnitPageProps {
  data: ExplorerPageData;
}

export function UnitPage({ data }: UnitPageProps) {
  const router = useRouter();
  const { project, currentLayer, media, breadcrumbs, siblings, currentPath } = data;

  const navigateToSibling = useCallback((sibling: Layer) => {
    const siblingPath = [...currentPath.slice(0, -1), sibling.slug];
    router.push(`/p/${project.slug}/${siblingPath.join('/')}`);
  }, [currentPath, project.slug, router]);

  if (!currentLayer) return null;

  const props = currentLayer.properties;
  const galleryMedia = media.filter((m) => m.type === 'image' && (m.purpose === 'gallery' || m.purpose === 'cover' || m.purpose === 'floor_plan'));
  const allMedia = media.filter((m) => m.type === 'image');

  const area = props.area as number | undefined;
  const price = props.price as number | undefined;
  const description = props.description as string | undefined;
  const orientation = props.orientation as string | undefined;
  const features = props.features as string[] | undefined;
  const frontMeters = props.front_meters as number | undefined;
  const depthMeters = props.depth_meters as number | undefined;
  const isCorner = props.is_corner as boolean | undefined;
  const bedrooms = props.bedrooms as number | undefined;
  const bathrooms = props.bathrooms as number | undefined;
  const unitType = props.unit_type as string | undefined;
  const hasBalcony = props.has_balcony as boolean | undefined;
  const floorNumber = props.floor_number as number | undefined;

  const detailRows = [
    unitType && { label: 'Tipo', value: unitType },
    area != null && { label: 'Superficie', value: `${area} m²` },
    (bedrooms != null || bathrooms != null) && {
      label: 'Ambientes',
      value: [
        bedrooms != null ? `${bedrooms} dorm.` : null,
        bathrooms != null ? `${bathrooms} baño${bathrooms !== 1 ? 's' : ''}` : null,
      ].filter(Boolean).join(' / '),
    },
    (frontMeters || depthMeters) && {
      label: 'Dimensiones',
      value: [
        frontMeters ? `${frontMeters}m` : null,
        depthMeters ? `${depthMeters}m` : null,
      ].filter(Boolean).join(' × '),
    },
    orientation && { label: 'Orientación', value: orientation },
  ].filter(Boolean) as { label: string; value: string }[];

  const featuresList = [
    ...(isCorner && project.type === 'subdivision' ? ['Lote de esquina'] : []),
    ...(hasBalcony ? ['Balcón'] : []),
    ...(features ?? []),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Breadcrumb items={breadcrumbs} />
          <div className="flex items-center gap-4 mt-3">
            <h1 className="font-display text-3xl font-light text-[var(--text-primary)] tracking-tight">
              {currentLayer.name}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[currentLayer.status]}`}>
              {STATUS_LABELS[currentLayer.status]}
            </span>
          </div>
          {floorNumber != null && (
            <p className="text-sm text-[var(--text-muted)] mt-1">Piso {floorNumber}</p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Gallery (3 cols) */}
          <div className="lg:col-span-3">
            <Gallery media={galleryMedia.length > 0 ? galleryMedia : allMedia} unitName={currentLayer.name} />
          </div>

          {/* Right: Info (2 cols) */}
          <div className="lg:col-span-2 space-y-5 stagger-children">
            {/* Price */}
            {price != null && (
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
                <p className="font-display text-4xl font-light text-[var(--accent)] tracking-tight">
                  ${price.toLocaleString()}
                </p>
                {area && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    ${Math.round(price / area).toLocaleString()} / m²
                  </p>
                )}
              </div>
            )}

            {/* Details */}
            {detailRows.length > 0 && (
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-4">Detalles</h3>
                <div className="space-y-3">
                  {detailRows.map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {featuresList.length > 0 && (
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-4">Características</h3>
                <div className="grid grid-cols-1 gap-2">
                  {featuresList.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[var(--status-available-bg)] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-[var(--status-available)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-[var(--text-secondary)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-3">Descripción</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
              </div>
            )}

            {/* CTA */}
            {currentLayer.status === 'available' && (
              <button className="w-full py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-[var(--text-inverse)] font-medium rounded-[var(--radius-lg)] transition-all duration-300 text-sm tracking-wide hover:shadow-[var(--shadow-glow)]">
                Consultar Disponibilidad
              </button>
            )}
          </div>
        </div>

        {/* Sibling units */}
        {siblings.length > 1 && (
          <div className="mt-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.12em] mb-5">
              Otras unidades en este piso
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 stagger-children">
              {siblings.map((sibling) => {
                const isCurrent = sibling.id === currentLayer.id;
                const siblingPrice = sibling.properties.price as number | undefined;
                const siblingArea = sibling.properties.area as number | undefined;
                return (
                  <button
                    key={sibling.id}
                    onClick={() => !isCurrent && navigateToSibling(sibling)}
                    disabled={isCurrent}
                    className={`p-4 rounded-[var(--radius-md)] border text-left transition-all duration-200 ${
                      isCurrent
                        ? 'border-[var(--accent)]/30 bg-[var(--accent-bg)] cursor-default'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-bg)]'
                    }`}
                  >
                    <div className="font-medium text-sm text-[var(--text-primary)]">{sibling.name}</div>
                    {siblingArea && (
                      <div className="text-xs text-[var(--text-muted)] mt-1">{siblingArea} m²</div>
                    )}
                    {siblingPrice && (
                      <div className="text-sm font-medium text-[var(--accent)] mt-1.5">
                        ${siblingPrice.toLocaleString()}
                      </div>
                    )}
                    <div className={`mt-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CLASSES[sibling.status]}`}>
                      {STATUS_LABELS[sibling.status]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al plano
          </button>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Gallery sub-component
// ============================================================

function Gallery({ media, unitName }: { media: Media[]; unitName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const imageCacheRef = useRef<Map<string, string>>(new Map());

  const loadImage = useCallback(async (url: string) => {
    if (imageCacheRef.current.has(url)) return;
    setLoadingImages((prev) => new Set(prev).add(url));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      imageCacheRef.current.set(url, blobUrl);
      setImageCache((prev) => new Map(prev).set(url, blobUrl));
    } catch {
      // Silently fail
    } finally {
      setLoadingImages((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    const indices = [selectedIndex - 1, selectedIndex, selectedIndex + 1]
      .filter((i) => i >= 0 && i < media.length);
    for (const i of indices) {
      const url = media[i].url || media[i].storagePath;
      if (url) loadImage(url);
    }
  }, [selectedIndex, media, loadImage]);

  useEffect(() => {
    const ref = imageCacheRef;
    return () => {
      ref.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (media.length === 0) {
    return (
      <div
        className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] flex items-center justify-center"
        style={{ minHeight: 420 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">No hay imágenes disponibles</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{unitName}</p>
        </div>
      </div>
    );
  }

  const currentMedia = media[selectedIndex];
  const currentUrl = currentMedia.url || currentMedia.storagePath;
  const cached = currentUrl ? imageCache.get(currentUrl) : undefined;
  const isLoading = currentUrl ? loadingImages.has(currentUrl) : false;

  return (
    <div>
      {/* Main image */}
      <div
        className="bg-[var(--bg-surface)] rounded-[var(--radius-lg)] overflow-hidden relative border border-[var(--border-subtle)]"
        style={{ minHeight: 420 }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--border-default)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        ) : cached ? (
          /* eslint-disable-next-line @next/next/no-img-element -- blob URLs incompatible with next/image */
          <img
            src={cached}
            alt={currentMedia.altText || currentMedia.title || unitName}
            className="w-full h-full object-cover animate-fade-in"
            style={{ minHeight: 420, maxHeight: 520 }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-[var(--text-muted)]">Imagen no disponible</span>
          </div>
        )}

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => (i > 0 ? i - 1 : media.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-200"
            >
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex((i) => (i < media.length - 1 ? i + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-200"
            >
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        {media.length > 1 && (
          <div className="absolute bottom-3 right-3 glass px-3 py-1.5 rounded-full text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {selectedIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {media.map((m, idx) => {
            const thumbUrl = m.url || m.storagePath;
            const thumbCached = thumbUrl ? imageCache.get(thumbUrl) : undefined;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-all duration-200 ${
                  idx === selectedIndex
                    ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]'
                    : 'border-transparent hover:border-[var(--border-strong)] opacity-60 hover:opacity-100'
                }`}
              >
                {thumbCached ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={thumbCached} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--bg-elevated)]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
