'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ExplorerPageData, Layer } from '@/types/hierarchy.types';
import { InteractiveSVG } from '@/components/svg/InteractiveSVG';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { SiblingNavigator } from '@/components/navigation/SiblingNavigator';
import { svgElementId } from '@/lib/utils/slug-helpers';

interface ExplorerViewProps {
  data: ExplorerPageData;
}

export function ExplorerView({ data }: ExplorerViewProps) {
  const router = useRouter();
  const { project, currentLayer, children, breadcrumbs, currentPath, siblings, isLeafLevel } = data;

  // Build the base URL for navigation
  const basePath = `/p/${project.slug}${currentPath.length > 0 ? '/' + currentPath.join('/') : ''}`;

  // The SVG to display
  const svgUrl = currentLayer?.svgPath ?? project.svgPath;

  // Layer labels
  const childDepth = currentLayer ? currentLayer.depth + 1 : 0;
  const childLabel = project.layerLabels[childDepth] ?? 'elemento';
  const currentLabel = project.layerLabels[currentLayer?.depth ?? -1] ?? '';

  // Show sibling navigator when we have siblings and children are leaves
  const showSiblings = isLeafLevel && siblings.length > 1 && currentLayer != null;

  const handleSiblingSelect = useCallback((sibling: Layer) => {
    if (sibling.id === currentLayer?.id) return;
    const siblingPath = [...currentPath.slice(0, -1), sibling.slug];
    router.push(`/p/${project.slug}/${siblingPath.join('/')}`);
  }, [currentLayer?.id, currentPath, project.slug, router]);

  // Always navigate on click
  const entityConfigs = useMemo(
    () =>
      children.map((child) => ({
        id: svgElementId(child),
        label: child.label,
        status: child.status,
        onClick: () => {
          router.push(`${basePath}/${child.slug}`);
        },
      })),
    [children, basePath, router]
  );

  const availableCount = children.filter((c) => c.status === 'available').length;
  const title = currentLayer ? currentLayer.name : project.name;
  const subtitle = `Selecciona un ${childLabel.toLowerCase()} para explorar`;

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
