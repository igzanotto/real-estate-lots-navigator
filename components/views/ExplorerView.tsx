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

  const basePath = `/p/${project.slug}${currentPath.length > 0 ? '/' + currentPath.join('/') : ''}`;

  const svgUrl = currentLayer?.svgPath ?? project.svgPath;

  const childDepth = currentLayer ? currentLayer.depth + 1 : 0;
  const childLabel = project.layerLabels[childDepth] ?? 'elemento';
  const currentLabel = project.layerLabels[currentLayer?.depth ?? -1] ?? '';

  const showSiblings = isLeafLevel && siblings.length > 1 && currentLayer != null;

  const handleSiblingSelect = useCallback((sibling: Layer) => {
    if (sibling.id === currentLayer?.id) return;
    const siblingPath = [...currentPath.slice(0, -1), sibling.slug];
    router.push(`/p/${project.slug}/${siblingPath.join('/')}`);
  }, [currentLayer?.id, currentPath, project.slug, router]);

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
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {breadcrumbs.length > 1 && <Breadcrumb items={breadcrumbs} />}
          <div className="flex items-end justify-between mt-2">
            <div>
              <h1 className="font-display text-3xl font-light text-[var(--text-primary)] tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--accent)] font-semibold">{availableCount}</span>
              <span className="mx-1">/</span>
              <span>{children.length}</span>
              <span className="ml-1 text-[var(--text-muted)]">disponibles</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 relative">
          {backgroundUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backgroundUrl})`, opacity: 0.5 }}
            />
          )}
          <div className="relative z-10 h-full">
            {svgUrl ? (
              <InteractiveSVG svgUrl={svgUrl} entities={entityConfigs} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-[var(--text-muted)]">No hay mapa disponible para este nivel</p>
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

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
          {currentLayer ? (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-5">
            {(['available', 'reserved', 'sold'] as const).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
                <span className="text-xs text-[var(--text-muted)]">{STATUS_LABELS[status]}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
