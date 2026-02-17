'use client';

import { useRouter } from 'next/navigation';
import { Zone, Block } from '@/types/hierarchy.types';
import { InteractiveSVG } from '@/components/svg/InteractiveSVG';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { useState, useEffect, useCallback } from 'react';

interface BlockViewProps {
  zone: Zone;
  block: Block;
}

export function BlockView({ zone, block }: BlockViewProps) {
  const router = useRouter();
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [lotImages, setLotImages] = useState<Map<string, string>>(new Map());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const selectedLot = selectedLotId
    ? block.lots.find((lot) => lot.id === selectedLotId)
    : null;

  // Load image for a specific lot (Progressive Loading)
  const loadLotImage = useCallback(async (lotId: string, imageUrl: string) => {
    // Skip if already loaded or loading
    if (lotImages.has(lotId) || loadingImages.has(lotId)) return;

    setLoadingImages(prev => new Set(prev).add(lotId));

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to load image');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setLotImages(prev => new Map(prev).set(lotId, objectUrl));
    } catch (error) {
      console.error(`Error loading image for lot ${lotId}:`, error);
    } finally {
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(lotId);
        return newSet;
      });
    }
  }, [lotImages, loadingImages]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      lotImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [lotImages]);

  // Optional: Prefetch adjacent lots' images for smoother navigation
  useEffect(() => {
    if (!selectedLot) return;

    const selectedIndex = block.lots.findIndex(lot => lot.id === selectedLot.id);
    if (selectedIndex === -1) return;

    // Prefetch previous and next lot images
    const adjacentLots = [
      block.lots[selectedIndex - 1],
      block.lots[selectedIndex + 1],
    ].filter(Boolean);

    adjacentLots.forEach(lot => {
      if (lot.imageUrl && !lotImages.has(lot.id) && !loadingImages.has(lot.id)) {
        // Prefetch with low priority (setTimeout to not block main thread)
        setTimeout(() => loadLotImage(lot.id, lot.imageUrl!), 500);
      }
    });
  }, [selectedLot, block.lots, lotImages, loadingImages, loadLotImage]);

  const entityConfigs = block.lots.map((lot) => {
    // Extract just the lot ID from the full slug (e.g., "zona-a-manzana-1-lote-01" -> "lote-01")
    const lotIdInSvg = lot.slug.split('-').slice(-2).join('-');

    return {
      id: lotIdInSvg,
      label: lot.label,
      status: lot.status,
      onClick: () => {
        setSelectedLotId(lot.id);
        // Load image progressively when lot is clicked
        if (lot.imageUrl && !lotImages.has(lot.id)) {
          loadLotImage(lot.id, lot.imageUrl);
        }
      },
    };
  });

  const breadcrumbItems = [
    { label: 'Mapa Principal', href: '/' },
    { label: zone.name, href: `/zona/${zone.slug}` },
    { label: block.name },
  ];

  const availableLots = block.lots.filter((lot) => lot.status === 'available').length;

  // Log image cache stats (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📸 Image cache: ${lotImages.size} loaded, ${loadingImages.size} loading`);
    }
  }, [lotImages.size, loadingImages.size]);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {zone.name} - {block.name}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Haz clic en un lote para ver información detallada
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 relative">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{
              backgroundImage: `url(${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/backgrounds/${block.slug}.jpg)`,
            }}
          />

          {/* SVG Overlay */}
          <div className="relative z-10">
            <InteractiveSVG
              svgUrl={block.svgPath}
              entities={entityConfigs}
              level="block"
            />
          </div>
        </div>

        {selectedLot && (
          <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedLot.name}</h2>
              <button
                onClick={() => setSelectedLotId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Progressive Image Loading */}
            {selectedLot.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                {loadingImages.has(selectedLot.id) ? (
                  <div className="w-full h-48 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">
                      <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                  </div>
                ) : lotImages.has(selectedLot.id) ? (
                  <img
                    src={lotImages.get(selectedLot.id)}
                    alt={selectedLot.name}
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
              <div>
                <span className="text-sm text-gray-500">Estado</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedLot.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : selectedLot.status === 'reserved'
                        ? 'bg-orange-100 text-orange-800'
                        : selectedLot.status === 'sold'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedLot.status === 'available'
                      ? 'Disponible'
                      : selectedLot.status === 'reserved'
                      ? 'Reservado'
                      : selectedLot.status === 'sold'
                      ? 'Vendido'
                      : 'No Disponible'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500">Superficie</span>
                <p className="text-lg font-semibold">{selectedLot.area} m²</p>
              </div>

              {(selectedLot.frontMeters || selectedLot.depthMeters) && (
                <div>
                  <span className="text-sm text-gray-500">Dimensiones</span>
                  <p className="text-sm text-gray-900">
                    {selectedLot.frontMeters && `Frente: ${selectedLot.frontMeters}m`}
                    {selectedLot.frontMeters && selectedLot.depthMeters && ' × '}
                    {selectedLot.depthMeters && `Fondo: ${selectedLot.depthMeters}m`}
                  </p>
                </div>
              )}

              {selectedLot.orientation && (
                <div>
                  <span className="text-sm text-gray-500">Orientación</span>
                  <p className="text-sm text-gray-900">{selectedLot.orientation}</p>
                </div>
              )}

              {selectedLot.price && (
                <div>
                  <span className="text-sm text-gray-500">Precio</span>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedLot.price.toLocaleString()}
                  </p>
                  {selectedLot.area && (
                    <p className="text-xs text-gray-500 mt-1">
                      ${Math.round(selectedLot.price / selectedLot.area)}/m²
                    </p>
                  )}
                </div>
              )}

              {selectedLot.description && (
                <div>
                  <span className="text-sm text-gray-500">Descripción</span>
                  <p className="text-sm text-gray-700 mt-1">{selectedLot.description}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500">Características</span>
                <ul className="mt-2 space-y-1">
                  {selectedLot.isCorner && (
                    <li className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      Lote de esquina
                    </li>
                  )}
                  {selectedLot.features && selectedLot.features.length > 0 ? (
                    selectedLot.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <span className="text-green-600 mr-2">✓</span>
                        {feature}
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center text-sm">
                      <span className="text-green-600 mr-2">✓</span>
                      Servicios completos
                    </li>
                  )}
                </ul>
              </div>

              {selectedLot.status === 'available' && (
                <button className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Consultar Disponibilidad
                </button>
              )}
            </div>
          </aside>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Volver a {zone.name}
          </button>
          <div>
            <span className="font-semibold">{availableLots}</span> de{' '}
            <span className="font-semibold">{block.lots.length}</span> lotes disponibles
          </div>
        </div>
      </footer>
    </div>
  );
}
