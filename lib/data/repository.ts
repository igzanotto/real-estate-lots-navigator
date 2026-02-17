import { createClient } from '@/lib/supabase/server';
import { ExplorerPageData, Project } from '@/types/hierarchy.types';
import {
  RawProject,
  RawLayer,
  RawMedia,
  buildExplorerPageData,
  transformProject,
} from './transform';

/**
 * Fetch explorer page data for a project at a given layer path.
 * Uses the server client (cookie-based) for runtime requests.
 */
export async function getExplorerPageData(
  projectSlug: string,
  layerSlugs: string[]
): Promise<ExplorerPageData> {
  const supabase = await createClient();

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', projectSlug)
    .single();

  if (projectError || !project) {
    throw new Error(`Project not found: ${projectSlug}`);
  }

  const rawProject = project as RawProject;

  // Fetch all layers and media for this project in parallel
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
 * Fetch all projects.
 */
export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data as RawProject[]).map(transformProject);
}
