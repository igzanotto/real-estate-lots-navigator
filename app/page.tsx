import { hierarchyData } from '@/lib/data/lots-data';
import { MapView } from '@/components/views/MapView';

export default function HomePage() {
  return <MapView data={hierarchyData} />;
}
