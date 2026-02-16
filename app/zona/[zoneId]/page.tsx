import { notFound } from 'next/navigation';
import { getZoneBySlug } from '@/lib/data/lots-repository';
import { getHierarchyDataAdmin } from '@/lib/data/lots-repository-admin';
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
  const hierarchyData = await getHierarchyDataAdmin();
  return hierarchyData.zones.map((zone) => ({
    zoneId: zone.slug,
  }));
}
