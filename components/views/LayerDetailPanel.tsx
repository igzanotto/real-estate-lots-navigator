'use client';

import { Layer, Media, ProjectType } from '@/types/hierarchy.types';
import { useState, useEffect, useCallback, useRef } from 'react';

interface LayerDetailPanelProps {
  layer: Layer;
  media: Media[];
  projectType: ProjectType;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
  not_available: 'No Disponible',
};

const STATUS_CLASSES: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-orange-100 text-orange-800',
  sold: 'bg-red-100 text-red-800',
  not_available: 'bg-gray-100 text-gray-800',
};

export function LayerDetailPanel({ layer, media, projectType, onClose }: LayerDetailPanelProps) {
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());
  const [loadingImage, setLoadingImage] = useState(false);
  const imageCacheRef = useRef<Map<string, string>>(new Map());

  const props = layer.properties;

  // Find the first gallery or cover image from media
  const coverMedia = media.find((m) => m.purpose === 'cover' && m.type === 'image');
  const galleryImages = media.filter((m) => m.purpose === 'gallery' && m.type === 'image');
  const mainImage = coverMedia || galleryImages[0];

  const loadImage = useCallback(async (imageUrl: string) => {
    if (imageCacheRef.current.has(imageUrl)) return;
    setLoadingImage(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error('Empty response');
      const blobUrl = URL.createObjectURL(blob);
      imageCacheRef.current.set(imageUrl, blobUrl);
      setImageCache((prev) => new Map(prev).set(imageUrl, blobUrl));
    } catch {
      // Silently fail
    } finally {
      setLoadingImage(false);
    }
  }, []);

  useEffect(() => {
    const url = mainImage?.url || mainImage?.storagePath;
    if (url) loadImage(url);
  }, [mainImage, loadImage]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    const ref = imageCacheRef;
    return () => {
      ref.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const imageUrl = mainImage?.url || mainImage?.storagePath;
  const cachedImage = imageUrl ? imageCache.get(imageUrl) : undefined;

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

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-900">{layer.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
          {loadingImage ? (
            <div className="w-full h-48 flex items-center justify-center text-gray-400">
              <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : cachedImage ? (
            /* eslint-disable-next-line @next/next/no-img-element -- blob URLs are incompatible with next/image */
            <img
              src={cachedImage}
              alt={layer.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-gray-400 text-sm">
              Sin imagen disponible
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Status */}
        <div>
          <span className="text-sm text-gray-500">Estado</span>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_CLASSES[layer.status]}`}>
              {STATUS_LABELS[layer.status]}
            </span>
          </div>
        </div>

        {/* Area */}
        {area != null && (
          <div>
            <span className="text-sm text-gray-500">Superficie</span>
            <p className="text-lg font-semibold">{area} m²</p>
          </div>
        )}

        {/* Dimensions (subdivision) */}
        {(frontMeters || depthMeters) && (
          <div>
            <span className="text-sm text-gray-500">Dimensiones</span>
            <p className="text-sm text-gray-900">
              {frontMeters && `Frente: ${frontMeters}m`}
              {frontMeters && depthMeters && ' × '}
              {depthMeters && `Fondo: ${depthMeters}m`}
            </p>
          </div>
        )}

        {/* Unit type (building) */}
        {unitType && (
          <div>
            <span className="text-sm text-gray-500">Tipo</span>
            <p className="text-sm text-gray-900">{unitType}</p>
          </div>
        )}

        {/* Bedrooms & Bathrooms (building) */}
        {(bedrooms != null || bathrooms != null) && (
          <div>
            <span className="text-sm text-gray-500">Ambientes</span>
            <p className="text-sm text-gray-900">
              {bedrooms != null && `${bedrooms} dormitorio${bedrooms !== 1 ? 's' : ''}`}
              {bedrooms != null && bathrooms != null && ' / '}
              {bathrooms != null && `${bathrooms} baño${bathrooms !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        {/* Orientation */}
        {orientation && (
          <div>
            <span className="text-sm text-gray-500">Orientación</span>
            <p className="text-sm text-gray-900">{orientation}</p>
          </div>
        )}

        {/* Price */}
        {price != null && (
          <div>
            <span className="text-sm text-gray-500">Precio</span>
            <p className="text-2xl font-bold text-green-600">
              ${price.toLocaleString()}
            </p>
            {area && (
              <p className="text-xs text-gray-500 mt-1">
                ${Math.round(price / area)}/m²
              </p>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <div>
            <span className="text-sm text-gray-500">Descripción</span>
            <p className="text-sm text-gray-700 mt-1">{description}</p>
          </div>
        )}

        {/* Features */}
        <div>
          <span className="text-sm text-gray-500">Características</span>
          <ul className="mt-2 space-y-1">
            {isCorner && projectType === 'subdivision' && (
              <li className="flex items-center text-sm">
                <span className="text-green-600 mr-2">✓</span>
                Lote de esquina
              </li>
            )}
            {hasBalcony && projectType === 'building' && (
              <li className="flex items-center text-sm">
                <span className="text-green-600 mr-2">✓</span>
                Balcón
              </li>
            )}
            {features && features.length > 0 ? (
              features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  {feature}
                </li>
              ))
            ) : (
              !isCorner && !hasBalcony && (
                <li className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  Servicios completos
                </li>
              )
            )}
          </ul>
        </div>

        {/* CTA */}
        {layer.status === 'available' && (
          <button className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Consultar Disponibilidad
          </button>
        )}
      </div>
    </aside>
  );
}
