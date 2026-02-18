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

  // Find the panorama image for the current viewpoint
  const findViewpointImage = useCallback(
    (vpId: ViewpointId) => {
      return media.find((m) => {
        if (m.type !== 'image') return false;
        const meta = m.metadata as Record<string, unknown>;
        return meta?.viewpoint === vpId;
      });
    },
    [media]
  );

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

        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.display = 'block';
        svg.style.background = 'transparent';

        const images = svg.querySelectorAll('image');
        images.forEach((img) => img.remove());

        const tower = svg.querySelector('#tower') as SVGElement | null;
        if (tower) {
          tower.style.fill = 'rgba(198, 169, 108, 0.04)';
          tower.style.stroke = 'rgba(198, 169, 108, 0.25)';
          tower.style.strokeWidth = '1.5';
        }

        const marker = svg.querySelector('#marker') as SVGElement | null;
        if (marker) {
          marker.style.fill = 'rgba(198, 169, 108, 0.6)';
          marker.style.stroke = '#F2EDE8';
          marker.style.strokeWidth = '3';
          marker.style.cursor = 'pointer';
          marker.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

          marker.addEventListener('mouseenter', () => {
            marker.style.fill = 'rgba(198, 169, 108, 0.9)';
            marker.style.filter = 'drop-shadow(0 0 12px rgba(198, 169, 108, 0.4))';
          });
          marker.addEventListener('mouseleave', () => {
            marker.style.fill = 'rgba(198, 169, 108, 0.6)';
            marker.style.filter = 'none';
          });
          marker.addEventListener('click', (e) => {
            e.stopPropagation();
            onEnterBuilding?.();
          });

          const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animate.setAttribute('attributeName', 'r');
          animate.setAttribute('values', '22;28;22');
          animate.setAttribute('dur', '2.5s');
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

  const currentImage = findViewpointImage(currentViewpoint);
  const currentImageUrl = currentImage?.url;

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
              className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-fade-in"
              style={{ backgroundImage: `url(${currentImageUrl})` }}
            />
          )}

          {/* Subtle vignette */}
          <div className="absolute inset-0 z-[5]" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(12,12,14,0.5) 100%)',
          }} />

          {/* SVG overlay */}
          <div
            ref={svgContainerRef}
            className="absolute inset-0 z-10"
          />

          {/* Enter building CTA */}
          {onEnterBuilding && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 animate-fade-down">
              <button
                onClick={onEnterBuilding}
                className="glass px-6 py-3 rounded-full text-sm font-medium text-[var(--text-primary)] border border-[var(--border-accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-bg-hover)] transition-all duration-300 shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                  Explorar niveles
                </span>
              </button>
            </div>
          )}

          {/* Navigation arrows */}
          <button
            onClick={() => navigateTo(VIEWPOINT_ORDER[prevIdx])}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 glass rounded-full flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all duration-200 animate-fade-in"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateTo(VIEWPOINT_ORDER[nextIdx])}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 glass rounded-full flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all duration-200 animate-fade-in"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
