import { notFound } from 'next/navigation';
import { getExplorerPageData } from '@/lib/data/repository';
import { getProjectSlugsAdmin } from '@/lib/data/repository-admin';
import { ExplorerView } from '@/components/views/ExplorerView';

interface ProjectPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectSlug } = await params;

  try {
    const data = await getExplorerPageData(projectSlug, []);
    return <ExplorerView data={data} />;
  } catch {
    notFound();
  }
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugsAdmin();
  return slugs.map((projectSlug) => ({ projectSlug }));
}
