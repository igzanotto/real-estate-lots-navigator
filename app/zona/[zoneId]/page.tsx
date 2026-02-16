import { notFound } from 'next/navigation';
import { getZoneBySlug, getHierarchyData } from '@/lib/data/lots-repository';
import { ZoneView } from '@/components/views/ZoneView';

interface ZonePageProps {
  params: Promise<{ zoneId: string }>;
}

export default async function ZonePage({ params }: ZonePageProps) {
  const { zoneId } = await params;
  const zone = await getZoneBySlug(zoneId);

  if (!zone) {
    notFound();
  }

  return <ZoneView zone={zone} />;
}

export async function generateStaticParams() {
  const hierarchyData = await getHierarchyData();
  return hierarchyData.zones.map((zone) => ({
    zoneId: zone.slug,
  }));
}
