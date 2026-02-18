'use client';

import { useState } from 'react';
import { Media } from '@/types/hierarchy.types';
import { VideoPlayer } from './VideoPlayer';

interface AerialVideoGalleryProps {
  media: Media[];
}

export function AerialVideoGallery({ media }: AerialVideoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-[var(--text-muted)]">No hay videos disponibles</p>
      </div>
    );
  }

  const currentVideo = media[selectedIndex];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <VideoPlayer
          key={currentVideo.id}
          src={currentVideo.url || currentVideo.storagePath}
          className="w-full h-full"
        />
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 p-4 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
          {media.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                idx === selectedIndex
                  ? 'bg-[var(--accent)] text-[var(--text-inverse)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {m.title || `Video ${idx + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
