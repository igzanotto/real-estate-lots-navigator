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

  // Navigate to sibling unit
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <Breadcrumb items={breadcrumbs} />
          <div className="flex items-center gap-4 mt-2">
            <h1 className="text-2xl font-bold text-gray-900">{currentLayer.name}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_CLASSES[currentLayer.status]}`}>
              {STATUS_LABELS[currentLayer.status]}
            </span>
          </div>
          {floorNumber && (
            <p className="text-sm text-gray-500 mt-1">Piso {floorNumber}</p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Gallery */}
          <div className="lg:col-span-2">
            <Gallery media={galleryMedia.length > 0 ? galleryMedia : allMedia} unitName={currentLayer.name} />
          </div>

          {/* Right column: Info */}
          <div className="space-y-6">
            {/* Price */}
            {price != null && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <p className="text-3xl font-bold text-green-600">
                  ${price.toLocaleString()}
                </p>
                {area && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${Math.round(price / area)}/m²
                  </p>
                )}
              </div>
            )}

            {/* Details card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Detalles</h3>

              {unitType && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tipo</span>
                  <span className="text-sm font-medium text-gray-900">{unitType}</span>
                </div>
              )}

              {area != null && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Superficie</span>
                  <span className="text-sm font-medium text-gray-900">{area} m²</span>
                </div>
              )}

              {(bedrooms != null || bathrooms != null) && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ambientes</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bedrooms != null && `${bedrooms} dorm.`}
                    {bedrooms != null && bathrooms != null && ' / '}
                    {bathrooms != null && `${bathrooms} baño${bathrooms !== 1 ? 's' : ''}`}
                  </span>
                </div>
              )}

              {(frontMeters || depthMeters) && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Dimensiones</span>
                  <span className="text-sm font-medium text-gray-900">
                    {frontMeters && `${frontMeters}m`}
                    {frontMeters && depthMeters && ' × '}
                    {depthMeters && `${depthMeters}m`}
                  </span>
                </div>
              )}

              {orientation && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Orientación</span>
                  <span className="text-sm font-medium text-gray-900">{orientation}</span>
                </div>
              )}
            </div>

            {/* Features card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Características</h3>
              <ul className="space-y-2">
                {isCorner && project.type === 'subdivision' && (
                  <li className="flex items-center text-sm">
                    <span className="text-green-600 mr-2">✓</span>
                    Lote de esquina
                  </li>
                )}
                {hasBalcony && (
                  <li className="flex items-center text-sm">
                    <span className="text-green-600 mr-2">✓</span>
                    Balcón
                  </li>
                )}
                {features && features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <span className="text-green-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            {description && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
              </div>
            )}

            {/* CTA */}
            {currentLayer.status === 'available' && (
              <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Consultar Disponibilidad
              </button>
            )}
          </div>
        </div>

        {/* Sibling units */}
        {siblings.length > 1 && (
          <div className="mt-10">
            <h3 className="font-semibold text-gray-900 mb-4">Otras unidades en este piso</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {siblings.map((sibling) => {
                const isCurrent = sibling.id === currentLayer.id;
                const siblingPrice = sibling.properties.price as number | undefined;
                const siblingArea = sibling.properties.area as number | undefined;
                return (
                  <button
                    key={sibling.id}
                    onClick={() => !isCurrent && navigateToSibling(sibling)}
                    disabled={isCurrent}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      isCurrent
                        ? 'border-blue-300 bg-blue-50 cursor-default'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{sibling.name}</div>
                    {siblingArea && (
                      <div className="text-xs text-gray-500 mt-1">{siblingArea} m²</div>
                    )}
                    {siblingPrice && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        ${siblingPrice.toLocaleString()}
                      </div>
                    )}
                    <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[sibling.status]}`}>
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
      <footer className="bg-white border-t border-gray-200 p-4 mt-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm text-gray-600"
          >
            ← Volver al plano
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

  // Load current and adjacent images
  useEffect(() => {
    const indices = [selectedIndex - 1, selectedIndex, selectedIndex + 1]
      .filter((i) => i >= 0 && i < media.length);
    for (const i of indices) {
      const url = media[i].url || media[i].storagePath;
      if (url) loadImage(url);
    }
  }, [selectedIndex, media, loadImage]);

  // Cleanup
  useEffect(() => {
    const ref = imageCacheRef;
    return () => {
      ref.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (media.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-16 w-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No hay imágenes disponibles para {unitName}</p>
          <p className="text-xs mt-1">Las imágenes se cargarán desde el bucket de almacenamiento</p>
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
      <div className="bg-gray-100 rounded-lg overflow-hidden relative" style={{ minHeight: 400 }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : cached ? (
          /* eslint-disable-next-line @next/next/no-img-element -- blob URLs incompatible with next/image */
          <img
            src={cached}
            alt={currentMedia.altText || currentMedia.title || unitName}
            className="w-full h-full object-cover"
            style={{ minHeight: 400, maxHeight: 500 }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Imagen no disponible
          </div>
        )}

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => (i > 0 ? i - 1 : media.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedIndex((i) => (i < media.length - 1 ? i + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
            >
              →
            </button>
          </>
        )}

        {/* Counter */}
        {media.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {selectedIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {media.map((m, idx) => {
            const thumbUrl = m.url || m.storagePath;
            const thumbCached = thumbUrl ? imageCache.get(thumbUrl) : undefined;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === selectedIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                {thumbCached ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={thumbCached} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
