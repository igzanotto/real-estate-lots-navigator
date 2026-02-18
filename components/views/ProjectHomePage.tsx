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

  const tabs = [
    ...(hasExterior ? [{ id: 'exterior' as const, label: 'Exterior 360°', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    )}] : []),
    { id: 'niveles' as const, label: 'Niveles', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    )},
    ...(aerialVideos.length > 0 ? [{ id: 'videos' as const, label: 'Videos', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    )}] : []),
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      {/* View content */}
      <div className="flex-1 overflow-hidden relative">
        {currentView === 'exterior' && (
          <Spin360Viewer media={data.media} onEnterBuilding={enterBuilding} />
        )}
        {currentView === 'videos' && <AerialVideoGallery media={aerialVideos} />}
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto flex justify-center gap-1 px-4 py-2.5">
          {tabs.map((tab) => {
            const isActive = tab.id === currentView || (tab.id === 'niveles' && false);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'niveles') {
                    enterBuilding();
                  } else {
                    setCurrentView(tab.id);
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--text-inverse)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
