'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Zone } from '@/types/hierarchy.types';
import { InteractiveSVG } from '@/components/svg/InteractiveSVG';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { blockSvgId } from '@/lib/utils/slug-helpers';

interface ZoneViewProps {
  zone: Zone;
}

export function ZoneView({ zone }: ZoneViewProps) {
  const router = useRouter();

  const entityConfigs = useMemo(
    () =>
      zone.blocks.map((block) => ({
        id: blockSvgId(block.slug),
        label: block.label,
        status: block.status,
        onClick: () => {
          router.push(`/zona/${zone.slug}/manzana/${block.slug}`);
        },
      })),
    [zone, router]
  );

  const breadcrumbItems = [
    { label: 'Mapa Principal', href: '/' },
    { label: zone.name },
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{zone.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona una manzana para ver los lotes disponibles
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/backgrounds/${zone.slug}.jpg)`,
            opacity: 0.6,
          }}
        />

        {/* SVG Overlay */}
        <div className="relative z-10">
          <InteractiveSVG
            svgUrl={zone.svgPath}
            entities={entityConfigs}
          />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ← Volver al Mapa
          </button>
          <div>
            <span className="font-semibold">{zone.blocks.length}</span> manzanas en esta zona
          </div>
        </div>
      </footer>
    </div>
  );
}
