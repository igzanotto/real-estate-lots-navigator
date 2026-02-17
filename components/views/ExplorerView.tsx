'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ExplorerPageData, Layer } from '@/types/hierarchy.types';
import { InteractiveSVG } from '@/components/svg/InteractiveSVG';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { SiblingNavigator } from '@/components/navigation/SiblingNavigator';
import { svgElementId } from '@/lib/utils/slug-helpers';
import { STATUS_LABELS, STATUS_DOT_CLASSES } from '@/lib/constants/status';

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

  // Show sibling navigator when we have siblings
  const showSiblings = siblings.length > 1 && currentLayer != null;

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

  const explorationMedia = data.media.find(
    (m) => m.purpose === 'exploration' && m.type === 'image'
  );
  const backgroundUrl = explorationMedia?.url;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Compact header */}
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {breadcrumbs.length > 1 && <Breadcrumb items={breadcrumbs} />}
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              <span className="text-white font-semibold">{availableCount}</span>/{children.length} {childLabel.toLowerCase()}s disponibles
            </span>
            <div className="flex gap-3">
              {(['available', 'reserved', 'sold'] as const).map((status) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
                  <span>{STATUS_LABELS[status]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 relative">
          {svgUrl ? (
            <InteractiveSVG svgUrl={svgUrl} entities={entityConfigs} backgroundUrl={backgroundUrl} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No hay mapa disponible para este nivel
            </div>
          )}
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

      {/* Bottom bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {currentLayer ? (
            <button
              onClick={() => router.back()}
              className="px-4 py-1.5 text-sm text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          ) : (
            <div />
          )}
          <div />
        </div>
      </div>
    </div>
  );
}
