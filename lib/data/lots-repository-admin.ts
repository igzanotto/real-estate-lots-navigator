import { createAdminClient } from '@/lib/supabase/admin';
import { transformToHierarchy } from './transform';
import { HierarchyData } from '@/types/hierarchy.types';

/**
 * Fetch all hierarchy data using the admin client (no cookies).
 * Used in generateStaticParams where request context is not available.
 */
export async function getHierarchyDataAdmin(): Promise<HierarchyData> {
  const supabase = createAdminClient();

  const [zonesResult, blocksResult, lotsResult] = await Promise.all([
    supabase.from('zones').select('*').order('slug'),
    supabase.from('blocks').select('*').order('slug'),
    supabase.from('lots').select('*').order('slug'),
  ]);

  if (zonesResult.error) throw zonesResult.error;
  if (blocksResult.error) throw blocksResult.error;
  if (lotsResult.error) throw lotsResult.error;

  return transformToHierarchy(zonesResult.data, blocksResult.data, lotsResult.data);
}
