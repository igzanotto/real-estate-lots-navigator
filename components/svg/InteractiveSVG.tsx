'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { EntityStatus } from '@/types/hierarchy.types';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants/status';

export interface SVGEntityConfig {
  id: string;
  label: string;
  status: EntityStatus;
  onClick: () => void;
}

interface InteractiveSVGProps {
  svgUrl: string;
  entities: SVGEntityConfig[];
  backgroundUrl?: string;
}

type ListenerEntry = { element: SVGElement; event: string; handler: EventListener };

export function InteractiveSVG({ svgUrl, entities, backgroundUrl }: InteractiveSVGProps) {
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

    // Make SVG responsive and transparent
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
    svg.style.background = 'transparent';

    // Inject background image inside SVG so it scales with the same coordinate system
    if (backgroundUrl) {
      const viewBox = svg.getAttribute('viewBox');
      const [, , vbWidth, vbHeight] = (viewBox ?? '0 0 1920 1080').split(' ');
      const bgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      bgImage.setAttribute('href', backgroundUrl);
      bgImage.setAttribute('x', '0');
      bgImage.setAttribute('y', '0');
      bgImage.setAttribute('width', vbWidth);
      bgImage.setAttribute('height', vbHeight);
      bgImage.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      bgImage.setAttribute('opacity', '0.6');
      svg.insertBefore(bgImage, svg.firstChild);
    }

    // Make non-interactive elements semi-transparent so background shows through
    const allPaths = svg.querySelectorAll('path, rect, polygon, circle, ellipse');
    allPaths.forEach((el) => {
      const element = el as SVGElement;
      if (!element.id || !entities.find(e => e.id === element.id)) {
        element.style.opacity = '0.3';
      }
    });

    const listeners: ListenerEntry[] = [];

    // Process each entity
    entities.forEach((entity) => {
      const element = svg.querySelector(`#${entity.id}`) as SVGElement;
      if (!element) {
        console.warn(`Element with id "${entity.id}" not found in SVG`);
        return;
      }

      const colors = STATUS_COLORS[entity.status];

      element.style.cursor = 'pointer';
      element.style.transition = 'all 0.3s ease';
      element.style.fill = colors.fill;
      element.style.stroke = colors.stroke;

      // Keyboard accessibility
      element.setAttribute('tabindex', '0');
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', `${entity.label} — ${STATUS_LABELS[entity.status]}`);
      element.style.outline = 'none';

      const onEnter = () => {
        element.style.fill = colors.fill.replace('0.15', '0.35');
        element.style.strokeWidth = '4';
      };
      const onLeave = () => {
        element.style.fill = colors.fill;
        element.style.strokeWidth = '2';
      };
      const onClick = (e: Event) => {
        e.stopPropagation();
        entity.onClick();
      };
      const onFocus = () => {
        element.style.fill = colors.fill.replace('0.15', '0.35');
        element.style.strokeWidth = '4';
        element.style.outline = '2px solid white';
        element.style.outlineOffset = '2px';
      };
      const onBlur = () => {
        element.style.fill = colors.fill;
        element.style.strokeWidth = '2';
        element.style.outline = 'none';
      };
      const onKeyDown = (e: Event) => {
        const key = (e as KeyboardEvent).key;
        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          entity.onClick();
        }
      };

      element.addEventListener('mouseenter', onEnter);
      element.addEventListener('mouseleave', onLeave);
      element.addEventListener('click', onClick);
      element.addEventListener('focus', onFocus);
      element.addEventListener('blur', onBlur);
      element.addEventListener('keydown', onKeyDown);

      listeners.push(
        { element, event: 'mouseenter', handler: onEnter },
        { element, event: 'mouseleave', handler: onLeave },
        { element, event: 'click', handler: onClick },
        { element, event: 'focus', handler: onFocus },
        { element, event: 'blur', handler: onBlur },
        { element, event: 'keydown', handler: onKeyDown },
      );

      // Add label
      try {
        const bbox = (element as SVGGraphicsElement).getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('pointer-events', 'none');

        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        indicator.setAttribute('cx', (centerX - 20).toString());
        indicator.setAttribute('cy', (centerY - 5).toString());
        indicator.setAttribute('r', '6');
        indicator.setAttribute('fill', colors.indicator);
        indicator.setAttribute('stroke', 'white');
        indicator.setAttribute('stroke-width', '2');

        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textWidth = entity.label.length * 8 + 10;
        textBg.setAttribute('x', (centerX - textWidth / 2).toString());
        textBg.setAttribute('y', (centerY - 15).toString());
        textBg.setAttribute('width', textWidth.toString());
        textBg.setAttribute('height', '22');
        textBg.setAttribute('rx', '4');
        textBg.setAttribute('fill', 'rgba(255, 255, 255, 0.9)');
        textBg.setAttribute('stroke', colors.stroke);
        textBg.setAttribute('stroke-width', '1');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX.toString());
        text.setAttribute('y', (centerY - 1).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', '600');
        text.setAttribute('fill', '#333');
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
  }, [svgUrl, entities, backgroundUrl]);

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
      <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-4 rounded">
        <p>Error loading interactive map: {errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" aria-live="polite">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100" role="status">
          <div className="animate-pulse text-gray-600">Cargando mapa...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px]"
      />
    </div>
  );
}
