import { notFound } from 'next/navigation';
import { getZoneById, hierarchyData } from '@/lib/data/lots-data';
import { ZoneView } from '@/components/views/ZoneView';

interface ZonePageProps {
  params: Promise<{ zoneId: string }>;
}

export default async function ZonePage({ params }: ZonePageProps) {
  const { zoneId } = await params;
  const zone = getZoneById(zoneId);

  if (!zone) {
    notFound();
  }

  return <ZoneView zone={zone} />;
}

export async function generateStaticParams() {
  return hierarchyData.zones.map((zone) => ({
    zoneId: zone.slug,
  }));
}
