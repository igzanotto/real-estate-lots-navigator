import { notFound } from 'next/navigation';
import { getZoneById, getBlockById, hierarchyData } from '@/lib/data/lots-data';
import { BlockView } from '@/components/views/BlockView';

interface BlockPageProps {
  params: Promise<{ zoneId: string; blockId: string }>;
}

export default async function BlockPage({ params }: BlockPageProps) {
  const { zoneId, blockId } = await params;
  const zone = getZoneById(zoneId);
  const block = getBlockById(zoneId, blockId);

  if (!zone || !block) {
    notFound();
  }

  return <BlockView zone={zone} block={block} />;
}

export async function generateStaticParams() {
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
