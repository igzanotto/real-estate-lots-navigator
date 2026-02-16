'use client';

import { useEffect, useRef, useState } from 'react';
import { InteractiveSVGProps } from '@/types/svg.types';
import { EntityStatus } from '@/types/hierarchy.types';

const STATUS_COLORS: Record<EntityStatus, { fill: string; stroke: string; indicator: string }> = {
  available: {
    fill: 'rgba(76, 175, 80, 0.15)',
    stroke: '#4CAF50',
    indicator: '#4CAF50',
  },
  reserved: {
    fill: 'rgba(255, 152, 0, 0.15)',
    stroke: '#FF9800',
    indicator: '#FF9800',
  },
  sold: {
    fill: 'rgba(244, 67, 54, 0.15)',
    stroke: '#F44336',
    indicator: '#F44336',
  },
  not_available: {
    fill: 'rgba(158, 158, 158, 0.15)',
    stroke: '#9E9E9E',
    indicator: '#9E9E9E',
  },
};

export function InteractiveSVG({ svgUrl, entities, level }: InteractiveSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setError(null);

    // Fetch and load SVG
    fetch(svgUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load SVG: ${res.statusText}`);
        return res.text();
      })
      .then((svgText) => {
        // Inject SVG into DOM
        container.innerHTML = svgText;

        const svg = container.querySelector('svg');
        if (!svg) throw new Error('No SVG element found');

        // Make SVG responsive
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.display = 'block';

        // Process each entity
        entities.forEach((entity) => {
          const element = svg.querySelector(`#${entity.id}`) as SVGElement;
          if (!element) {
            console.warn(`Element with id "${entity.id}" not found in SVG`);
            return;
          }

          const colors = STATUS_COLORS[entity.status];

          // Set initial styles
          element.style.cursor = 'pointer';
          element.style.transition = 'all 0.3s ease';
          element.style.fill = colors.fill;
          element.style.stroke = colors.stroke;

          // Add hover effects
          element.addEventListener('mouseenter', () => {
            element.style.fill = colors.fill.replace('0.15', '0.35');
            element.style.strokeWidth = '4';
          });

          element.addEventListener('mouseleave', () => {
            element.style.fill = colors.fill;
            element.style.strokeWidth = '2';
          });

          // Add click handler
          element.addEventListener('click', (e) => {
            e.stopPropagation();
            entity.onClick();
          });

          // Add label
          try {
            const bbox = (element as SVGGraphicsElement).getBBox();
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            // Create label group
            const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelGroup.setAttribute('pointer-events', 'none');

            // Status indicator (circle)
            const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            indicator.setAttribute('cx', (centerX - 20).toString());
            indicator.setAttribute('cy', (centerY - 5).toString());
            indicator.setAttribute('r', '6');
            indicator.setAttribute('fill', colors.indicator);
            indicator.setAttribute('stroke', 'white');
            indicator.setAttribute('stroke-width', '2');

            // Label background
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

            // Label text
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

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading SVG:', err);
        setError(err.message);
        setIsLoading(false);
      });

    // Cleanup
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [svgUrl, entities]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-700 p-4 rounded">
        <p>Error loading interactive map: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse text-gray-600">Loading map...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
