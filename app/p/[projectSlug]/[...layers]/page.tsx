import { notFound } from 'next/navigation';
import { getExplorerPageData } from '@/lib/data/repository';
import { getProjectSlugsAdmin, getLayerPathsAdmin } from '@/lib/data/repository-admin';
import { ExplorerView } from '@/components/views/ExplorerView';

interface LayerPageProps {
  params: Promise<{ projectSlug: string; layers: string[] }>;
}

export default async function LayerPage({ params }: LayerPageProps) {
  const { projectSlug, layers } = await params;

  try {
    const data = await getExplorerPageData(projectSlug, layers);
    return <ExplorerView data={data} />;
  } catch {
    notFound();
  }
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugsAdmin();
  const params: { projectSlug: string; layers: string[] }[] = [];

  for (const projectSlug of slugs) {
    const paths = await getLayerPathsAdmin(projectSlug);
    for (const layers of paths) {
      params.push({ projectSlug, layers });
    }
  }

  return params;
}
