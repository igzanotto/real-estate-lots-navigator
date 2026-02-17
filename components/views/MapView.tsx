'use client';

import { useRouter } from 'next/navigation';
import { HierarchyData } from '@/types/hierarchy.types';
import { InteractiveSVG } from '@/components/svg/InteractiveSVG';

interface MapViewProps {
  data: HierarchyData;
}

export function MapView({ data }: MapViewProps) {
  const router = useRouter();

  const entityConfigs = data.zones.map((zone) => ({
    id: zone.id,
    label: zone.label,
    status: zone.status,
    onClick: () => {
      router.push(`/zona/${zone.slug}`);
    },
  }));

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Mapa Principal</h1>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona una zona para explorar las manzanas
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/backgrounds/mapa-principal.jpg)`,
          }}
        />

        {/* SVG Overlay */}
        <div className="relative z-10">
          <InteractiveSVG
            svgUrl={data.mapSvgPath}
            entities={entityConfigs}
            level="map"
          />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
          <div>
            <span className="font-semibold">{data.zones.length}</span> zonas disponibles
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Vendido</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
