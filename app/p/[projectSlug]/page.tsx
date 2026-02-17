import { notFound } from 'next/navigation';
import { getExplorerPageData } from '@/lib/data/repository';
import { getProjectSlugsAdmin } from '@/lib/data/repository-admin';
import { ExplorerView } from '@/components/views/ExplorerView';

interface ProjectPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectSlug } = await params;

  let data;
  try {
    data = await getExplorerPageData(projectSlug, []);
  } catch {
    notFound();
  }

  return <ExplorerView data={data} />;
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugsAdmin();
  return slugs.map((projectSlug) => ({ projectSlug }));
}
