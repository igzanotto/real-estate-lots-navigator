import { notFound } from 'next/navigation';
import { getHierarchyData } from '@/lib/data/lots-repository';
import { getHierarchyDataAdmin } from '@/lib/data/lots-repository-admin';
import { BlockView } from '@/components/views/BlockView';

interface BlockPageProps {
  params: Promise<{ zoneId: string; blockId: string }>;
}

export default async function BlockPage({ params }: BlockPageProps) {
  const { zoneId, blockId } = await params;
  const data = await getHierarchyData();
  const zone = data.zones.find((z) => z.slug === zoneId);
  const block = zone?.blocks.find((b) => b.slug === blockId);

  if (!zone || !block) {
    notFound();
  }

  return <BlockView zone={zone} block={block} />;
}

export async function generateStaticParams() {
  const hierarchyData = await getHierarchyDataAdmin();
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
