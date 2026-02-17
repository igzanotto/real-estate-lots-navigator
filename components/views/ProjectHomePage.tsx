'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ExplorerPageData } from '@/types/hierarchy.types';
import { Spin360Viewer } from '@/components/video/Spin360Viewer';
import { AerialVideoGallery } from '@/components/video/AerialVideoGallery';

interface ProjectHomePageProps {
  data: ExplorerPageData;
}

type View = 'exterior' | 'videos';

export function ProjectHomePage({ data }: ProjectHomePageProps) {
  const router = useRouter();

  const hasExterior = useMemo(
    () => data.media.some((m) => m.purpose === 'transition'),
    [data.media]
  );

  const aerialVideos = useMemo(
    () => data.media.filter((m) => m.type === 'video' && m.purpose === 'gallery' && (m.metadata as Record<string, unknown>)?.category === 'aerial'),
    [data.media]
  );

  const [currentView, setCurrentView] = useState<View>('exterior');

  // Find first residential floor to navigate into
  const firstFloor = useMemo(() => {
    const residential = data.children
      .filter((c) => c.svgPath != null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return residential[0] ?? data.children[0];
  }, [data.children]);

  const enterBuilding = useCallback(() => {
    if (firstFloor) {
      router.push(`/p/${data.project.slug}/${firstFloor.slug}`);
    }
  }, [firstFloor, data.project.slug, router]);

  return (
    <div className="flex flex-col h-screen">
      {/* View content */}
      <div className="flex-1 overflow-hidden relative">
        {currentView === 'exterior' && (
          <Spin360Viewer media={data.media} onEnterBuilding={enterBuilding} />
        )}
        {currentView === 'videos' && <AerialVideoGallery media={aerialVideos} />}
      </div>

      {/* Bottom navigation bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-center gap-2">
          {hasExterior && (
            <button
              onClick={() => setCurrentView('exterior')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'exterior'
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              Exterior 360°
            </button>
          )}
          <button
            onClick={enterBuilding}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          >
            Niveles
          </button>
          {aerialVideos.length > 0 && (
            <button
              onClick={() => setCurrentView('videos')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'videos'
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              Videos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
