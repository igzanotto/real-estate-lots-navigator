import { createAdminClient } from '@/lib/supabase/admin';
import { ExplorerPageData, Project } from '@/types/hierarchy.types';
import {
  RawProject,
  RawLayer,
  RawMedia,
  buildExplorerPageData,
  generateAllLayerPaths,
  transformProject,
} from './transform';

/**
 * Fetch explorer page data using the admin client (no cookies).
 * Used in generateStaticParams where request context is not available.
 */
export async function getExplorerPageDataAdmin(
  projectSlug: string,
  layerSlugs: string[]
): Promise<ExplorerPageData> {
  const supabase = createAdminClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', projectSlug)
    .single();

  if (projectError || !project) {
    throw new Error(`Project not found: ${projectSlug}`);
  }

  const rawProject = project as RawProject;

  const [layersResult, mediaResult] = await Promise.all([
    supabase
      .from('layers')
      .select('*')
      .eq('project_id', rawProject.id)
      .order('depth')
      .order('sort_order'),
    supabase
      .from('media')
      .select('*')
      .eq('project_id', rawProject.id)
      .order('sort_order'),
  ]);

  if (layersResult.error) throw layersResult.error;
  if (mediaResult.error) throw mediaResult.error;

  return buildExplorerPageData(
    rawProject,
    layersResult.data as RawLayer[],
    mediaResult.data as RawMedia[],
    layerSlugs
  );
}

/**
 * Get all project slugs for generateStaticParams.
 */
export async function getProjectSlugsAdmin(): Promise<string[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .select('slug')
    .order('slug');

  if (error) throw error;
  return (data ?? []).map((p) => p.slug);
}

/**
 * Get all valid layer paths for a project (for generateStaticParams).
 * Returns arrays of slugs, e.g. [["zona-a"], ["zona-a", "manzana-1"], ...]
 */
export async function getLayerPathsAdmin(
  projectSlug: string
): Promise<string[][]> {
  const supabase = createAdminClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, max_depth')
    .eq('slug', projectSlug)
    .single();

  if (projectError || !project) return [];

  const { data: layers, error: layersError } = await supabase
    .from('layers')
    .select('id, parent_id, slug, depth, sort_order')
    .eq('project_id', project.id)
    .order('depth')
    .order('sort_order');

  if (layersError || !layers) return [];

  return generateAllLayerPaths(layers as RawLayer[], project.max_depth);
}

/**
 * Fetch all projects using admin client.
 */
export async function getProjectsAdmin(): Promise<Project[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data as RawProject[]).map(transformProject);
}
