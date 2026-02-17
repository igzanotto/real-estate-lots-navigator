'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ExplorerPageData, Layer, Media } from '@/types/hierarchy.types';
import { InteractiveSVG } from '@/components/svg/InteractiveSVG';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { SiblingNavigator } from '@/components/navigation/SiblingNavigator';
import { LayerDetailPanel } from '@/components/views/LayerDetailPanel';
import { svgElementId } from '@/lib/utils/slug-helpers';

interface ExplorerViewProps {
  data: ExplorerPageData;
}

export function ExplorerView({ data }: ExplorerViewProps) {
  const router = useRouter();
  const { project, currentLayer, children, breadcrumbs, isLeafLevel, currentPath, childrenMedia, siblings } = data;

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Reset selection when navigating to a new layer
  useEffect(() => {
    setSelectedLayerId(null);
  }, [currentLayer?.id]);

  const selectedChild = selectedLayerId
    ? children.find((c) => c.id === selectedLayerId)
    : null;

  const selectedChildMedia: Media[] = selectedLayerId
    ? (childrenMedia[selectedLayerId] ?? [])
    : [];

  // Build the base URL for navigation
  const basePath = `/p/${project.slug}${currentPath.length > 0 ? '/' + currentPath.join('/') : ''}`;

  // The SVG to display: currentLayer's SVG or project's root SVG
  const svgUrl = currentLayer?.svgPath ?? project.svgPath;

  // Layer label for the subtitle
  const childDepth = currentLayer ? currentLayer.depth + 1 : 0;
  const childLabel = project.layerLabels[childDepth] ?? 'elemento';
  const currentLabel = project.layerLabels[currentLayer?.depth ?? -1] ?? '';

  // Show sibling navigator when we have siblings and are at leaf level
  const showSiblings = isLeafLevel && siblings.length > 1 && currentLayer != null;

  // Navigate to a sibling (e.g., switch floors)
  const handleSiblingSelect = useCallback((sibling: Layer) => {
    if (sibling.id === currentLayer?.id) return;
    // Replace last slug in path with sibling's slug
    const siblingPath = [...currentPath.slice(0, -1), sibling.slug];
    router.push(`/p/${project.slug}/${siblingPath.join('/')}`);
  }, [currentLayer?.id, currentPath, project.slug, router]);

  // Prefetch adjacent children media
  const prefetchMedia = useCallback((layerId: string) => {
    const idx = children.findIndex((c) => c.id === layerId);
    if (idx === -1) return;
    [children[idx - 1], children[idx + 1]]
      .filter(Boolean)
      .forEach((child) => {
        const coverMedia = childrenMedia[child.id]?.find(
          (m) => (m.purpose === 'cover' || m.purpose === 'gallery') && m.type === 'image'
        );
        if (coverMedia?.url) {
          fetch(coverMedia.url).catch(() => {});
        }
      });
  }, [children, childrenMedia]);

  const entityConfigs = useMemo(
    () =>
      children.map((child) => ({
        id: svgElementId(child),
        label: child.label,
        status: child.status,
        onClick: () => {
          if (isLeafLevel) {
            setSelectedLayerId(child.id);
            setTimeout(() => prefetchMedia(child.id), 500);
          } else {
            router.push(`${basePath}/${child.slug}`);
          }
        },
      })),
    [children, isLeafLevel, basePath, router, prefetchMedia]
  );

  const availableCount = children.filter((c) => c.status === 'available').length;

  const title = currentLayer
    ? currentLayer.name
    : project.name;

  const subtitle = isLeafLevel
    ? `Haz clic en un ${childLabel.toLowerCase()} para ver información detallada`
    : `Selecciona un ${childLabel.toLowerCase()} para explorar`;

  // Background image from exploration media
  const explorationMedia = data.media.find(
    (m) => m.purpose === 'exploration' && m.type === 'image'
  );
  const backgroundUrl = explorationMedia?.url;

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {breadcrumbs.length > 1 && <Breadcrumb items={breadcrumbs} />}
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        {/* SVG map area */}
        <div className="flex-1 relative">
          {backgroundUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backgroundUrl})`, opacity: 0.6 }}
            />
          )}
          <div className="relative z-10">
            {svgUrl ? (
              <InteractiveSVG svgUrl={svgUrl} entities={entityConfigs} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay mapa disponible para este nivel
              </div>
            )}
          </div>
        </div>

        {/* Detail panel (when a leaf child is selected) */}
        {selectedChild && (
          <LayerDetailPanel
            layer={selectedChild}
            media={selectedChildMedia}
            projectType={project.type}
            onClose={() => setSelectedLayerId(null)}
          />
        )}

        {/* Sibling navigator (e.g., floor switcher) */}
        {showSiblings && currentLayer && (
          <SiblingNavigator
            siblings={siblings}
            currentLayerId={currentLayer.id}
            label={currentLabel}
            onSelect={handleSiblingSelect}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          {currentLayer ? (
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              ← Volver
            </button>
          ) : (
            <div />
          )}
          <div>
            <span className="font-semibold">{availableCount}</span> de{' '}
            <span className="font-semibold">{children.length}</span>{' '}
            {childLabel.toLowerCase()}s disponibles
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Vendido</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
