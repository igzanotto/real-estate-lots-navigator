'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Media } from '@/types/hierarchy.types';
import { VideoPlayer } from './VideoPlayer';

interface Spin360ViewerProps {
  media: Media[];
  onEnterBuilding?: () => void;
}

type ViewpointId = 'home' | 'point-a' | 'point-b';

const VIEWPOINT_ORDER: ViewpointId[] = ['home', 'point-a', 'point-b'];

const VIEWPOINT_LABELS: Record<ViewpointId, string> = {
  home: 'Inicio',
  'point-a': 'Vista A',
  'point-b': 'Vista B',
};

const VIEWPOINT_SVG: Record<ViewpointId, string> = {
  home: '/svgs/aurora/exterior/spin-home.svg',
  'point-a': '/svgs/aurora/exterior/spin-point-a.svg',
  'point-b': '/svgs/aurora/exterior/spin-point-b.svg',
};

export function Spin360Viewer({ media, onEnterBuilding }: Spin360ViewerProps) {
  const [currentViewpoint, setCurrentViewpoint] = useState<ViewpointId>('home');
  const [phase, setPhase] = useState<'idle' | 'transitioning'>('idle');
  const [transitionVideoUrl, setTransitionVideoUrl] = useState<string | null>(null);
  const onVideoEndRef = useRef<(() => void) | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Build viewpoints from media
  const viewpoints = useMemo(() => {
    return VIEWPOINT_ORDER.map((id) => {
      const image = media.find((m) => {
        if (m.type !== 'image') return false;
        const meta = m.metadata as Record<string, unknown>;
        return meta?.viewpoint === id;
      });
      return { id, label: VIEWPOINT_LABELS[id], image, svgPath: VIEWPOINT_SVG[id] };
    });
  }, [media]);

  // Find transition video between two viewpoints
  const findTransitionVideo = useCallback(
    (from: ViewpointId, to: ViewpointId): Media | undefined => {
      return media.find((m) => {
        if (m.type !== 'video' || m.purpose !== 'transition') return false;
        const meta = m.metadata as Record<string, unknown>;
        return meta?.from_viewpoint === from && meta?.to_viewpoint === to;
      });
    },
    [media]
  );

  // Load and inject SVG overlay for current viewpoint
  useEffect(() => {
    if (phase !== 'idle') return;

    const container = svgContainerRef.current;
    if (!container) return;

    let cancelled = false;
    const svgPath = VIEWPOINT_SVG[currentViewpoint];

    (async () => {
      try {
        const res = await fetch(svgPath);
        if (!res.ok || cancelled) return;
        const svgText = await res.text();
        if (cancelled) return;

        container.innerHTML = svgText;

        const svg = container.querySelector('svg');
        if (!svg) return;

        // Make responsive & transparent
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.display = 'block';
        svg.style.background = 'transparent';

        // Remove hidden image reference
        const images = svg.querySelectorAll('image');
        images.forEach((img) => img.remove());

        // Style the tower polygon (building outline)
        const tower = svg.querySelector('#tower') as SVGElement | null;
        if (tower) {
          tower.style.fill = 'rgba(255, 255, 255, 0.05)';
          tower.style.stroke = 'rgba(255, 255, 255, 0.4)';
          tower.style.strokeWidth = '2';
        }

        // Style and make the marker clickable
        const marker = svg.querySelector('#marker') as SVGElement | null;
        if (marker) {
          marker.style.fill = 'rgba(74, 144, 226, 0.7)';
          marker.style.stroke = '#ffffff';
          marker.style.strokeWidth = '4';
          marker.style.cursor = 'pointer';
          marker.style.transition = 'fill 0.3s ease, stroke-width 0.3s ease';

          marker.addEventListener('mouseenter', () => {
            marker.style.fill = 'rgba(74, 144, 226, 1)';
            marker.style.strokeWidth = '6';
          });
          marker.addEventListener('mouseleave', () => {
            marker.style.fill = 'rgba(74, 144, 226, 0.7)';
            marker.style.strokeWidth = '4';
          });
          marker.addEventListener('click', (e) => {
            e.stopPropagation();
            onEnterBuilding?.();
          });

          // Add pulsing animation
          const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animate.setAttribute('attributeName', 'r');
          animate.setAttribute('values', '22;28;22');
          animate.setAttribute('dur', '2s');
          animate.setAttribute('repeatCount', 'indefinite');
          marker.appendChild(animate);
        }
      } catch {
        // Silently fail SVG load
      }
    })();

    return () => {
      cancelled = true;
      container.innerHTML = '';
    };
  }, [currentViewpoint, phase, onEnterBuilding]);

  const navigateTo = useCallback(
    (target: ViewpointId) => {
      if (target === currentViewpoint || phase === 'transitioning') return;

      const video = findTransitionVideo(currentViewpoint, target);
      if (video?.url) {
        setPhase('transitioning');
        setTransitionVideoUrl(video.url);
        onVideoEndRef.current = () => {
          setCurrentViewpoint(target);
          setPhase('idle');
          setTransitionVideoUrl(null);
        };
      } else {
        setCurrentViewpoint(target);
      }
    },
    [currentViewpoint, phase, findTransitionVideo]
  );

  const currentVp = viewpoints.find((vp) => vp.id === currentViewpoint);
  const currentImageUrl = currentVp?.image?.url;

  const currentIdx = VIEWPOINT_ORDER.indexOf(currentViewpoint);
  const nextIdx = (currentIdx + 1) % VIEWPOINT_ORDER.length;
  const prevIdx = (currentIdx - 1 + VIEWPOINT_ORDER.length) % VIEWPOINT_ORDER.length;

  return (
    <div className="relative w-full h-full">
      {phase === 'transitioning' && transitionVideoUrl ? (
        <VideoPlayer
          src={transitionVideoUrl}
          autoPlay
          muted
          onEnded={() => onVideoEndRef.current?.()}
          className="w-full h-full"
        />
      ) : (
        <>
          {/* Background image */}
          {currentImageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${currentImageUrl})` }}
            />
          )}

          {/* SVG overlay (building outline + clickable marker) */}
          <div
            ref={svgContainerRef}
            className="absolute inset-0 z-10"
          />

          {/* "Enter" hint label */}
          {onEnterBuilding && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={onEnterBuilding}
                className="bg-black/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-lg hover:bg-white/20 transition-colors"
              >
                Explorar niveles
              </button>
            </div>
          )}

          {/* Navigation controls */}
          <div className="absolute bottom-0 inset-x-0 z-20 flex items-end justify-center pb-20">
            <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
              <button
                onClick={() => navigateTo(VIEWPOINT_ORDER[prevIdx])}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Vista anterior"
              >
                ←
              </button>

              {viewpoints.map((vp) => (
                <button
                  key={vp.id}
                  onClick={() => navigateTo(vp.id)}
                  aria-current={vp.id === currentViewpoint ? 'true' : undefined}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    vp.id === currentViewpoint
                      ? 'bg-white text-gray-900'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {vp.label}
                </button>
              ))}

              <button
                onClick={() => navigateTo(VIEWPOINT_ORDER[nextIdx])}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Vista siguiente"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
