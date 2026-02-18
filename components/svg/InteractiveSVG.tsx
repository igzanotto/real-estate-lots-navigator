'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { EntityStatus } from '@/types/hierarchy.types';
import { STATUS_COLORS } from '@/lib/constants/status';

export interface SVGEntityConfig {
  id: string;
  label: string;
  status: EntityStatus;
  onClick: () => void;
}

interface InteractiveSVGProps {
  svgUrl: string;
  entities: SVGEntityConfig[];
}

type ListenerEntry = { element: SVGElement; event: string; handler: EventListener };

export function InteractiveSVG({ svgUrl, entities }: InteractiveSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listenersRef = useRef<ListenerEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setupSVG = useCallback(async (container: HTMLDivElement) => {
    const res = await fetch(svgUrl);
    if (!res.ok) throw new Error(`Failed to load SVG: ${res.statusText}`);

    const svgText = await res.text();
    container.innerHTML = svgText;

    const svg = container.querySelector('svg');
    if (!svg) throw new Error('No SVG element found');

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    svg.style.background = 'transparent';

    const allPaths = svg.querySelectorAll('path, rect, polygon, circle, ellipse');
    allPaths.forEach((el) => {
      const element = el as SVGElement;
      if (!element.id || !entities.find(e => e.id === element.id)) {
        element.style.opacity = '0.2';
      }
    });

    const listeners: ListenerEntry[] = [];

    entities.forEach((entity) => {
      const element = svg.querySelector(`#${entity.id}`) as SVGElement;
      if (!element) {
        console.warn(`Element with id "${entity.id}" not found in SVG`);
        return;
      }

      const colors = STATUS_COLORS[entity.status];

      element.style.cursor = 'pointer';
      element.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      element.style.fill = colors.fill;
      element.style.stroke = colors.stroke;
      element.style.strokeWidth = '1.5';

      const onEnter = () => {
        element.style.fill = colors.fill.replace('0.12', '0.28');
        element.style.strokeWidth = '3';
        element.style.filter = `drop-shadow(0 0 8px ${colors.stroke}40)`;
      };
      const onLeave = () => {
        element.style.fill = colors.fill;
        element.style.strokeWidth = '1.5';
        element.style.filter = 'none';
      };
      const onClick = (e: Event) => {
        e.stopPropagation();
        entity.onClick();
      };

      element.addEventListener('mouseenter', onEnter);
      element.addEventListener('mouseleave', onLeave);
      element.addEventListener('click', onClick);

      listeners.push(
        { element, event: 'mouseenter', handler: onEnter },
        { element, event: 'mouseleave', handler: onLeave },
        { element, event: 'click', handler: onClick },
      );

      // Add label
      try {
        const bbox = (element as SVGGraphicsElement).getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('pointer-events', 'none');

        // Label background pill
        const textWidth = entity.label.length * 7.5 + 24;
        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        textBg.setAttribute('x', (centerX - textWidth / 2).toString());
        textBg.setAttribute('y', (centerY - 13).toString());
        textBg.setAttribute('width', textWidth.toString());
        textBg.setAttribute('height', '26');
        textBg.setAttribute('rx', '13');
        textBg.setAttribute('fill', 'rgba(12, 12, 14, 0.85)');
        textBg.setAttribute('stroke', colors.stroke);
        textBg.setAttribute('stroke-width', '1');
        textBg.setAttribute('stroke-opacity', '0.4');

        // Status dot
        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        indicator.setAttribute('cx', (centerX - textWidth / 2 + 14).toString());
        indicator.setAttribute('cy', centerY.toString());
        indicator.setAttribute('r', '3');
        indicator.setAttribute('fill', colors.indicator);

        // Label text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (centerX + 4).toString());
        text.setAttribute('y', (centerY + 1).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '500');
        text.setAttribute('font-family', 'DM Sans, sans-serif');
        text.setAttribute('fill', '#F2EDE8');
        text.setAttribute('letter-spacing', '0.02em');
        text.textContent = entity.label;

        labelGroup.appendChild(textBg);
        labelGroup.appendChild(indicator);
        labelGroup.appendChild(text);
        svg.appendChild(labelGroup);
      } catch (err) {
        console.warn(`Could not add label for ${entity.id}:`, err);
      }
    });

    listenersRef.current = listeners;
  }, [svgUrl, entities]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    setupSVG(container)
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error loading SVG:', err);
          setErrorMessage(err.message);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      for (const { element, event, handler } of listenersRef.current) {
        element.removeEventListener(event, handler);
      }
      listenersRef.current = [];
      container.innerHTML = '';
    };
  }, [setupSVG]);

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--status-sold-bg)] flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--status-sold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Error al cargar el mapa</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--border-default)] border-t-[var(--accent)] rounded-full animate-spin" />
            <span className="text-xs text-[var(--text-muted)] tracking-wide">Cargando mapa</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-500 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
