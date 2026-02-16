import { notFound } from 'next/navigation';
import { getZoneBySlug, getBlockBySlug, getHierarchyData } from '@/lib/data/lots-repository';
import { BlockView } from '@/components/views/BlockView';

interface BlockPageProps {
  params: Promise<{ zoneId: string; blockId: string }>;
}

export default async function BlockPage({ params }: BlockPageProps) {
  const { zoneId, blockId } = await params;
  const zone = await getZoneBySlug(zoneId);
  const block = await getBlockBySlug(zoneId, blockId);

  if (!zone || !block) {
    notFound();
  }

  return <BlockView zone={zone} block={block} />;
}

export async function generateStaticParams() {
  const hierarchyData = await getHierarchyData();
  const params: { zoneId: string; blockId: string }[] = [];

  hierarchyData.zones.forEach((zone) => {
    zone.blocks.forEach((block) => {
      params.push({
        zoneId: zone.slug,
        blockId: block.slug,
      });
    });
  });

  return params;
}
