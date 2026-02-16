import { getHierarchyData } from '@/lib/data/lots-repository';
import { MapView } from '@/components/views/MapView';

export default async function HomePage() {
  const hierarchyData = await getHierarchyData();
  return <MapView data={hierarchyData} />;
}
