import { createClient } from '@/lib/supabase/server';
import { transformToHierarchy } from './transform';
import { HierarchyData } from '@/types/hierarchy.types';

/**
 * Fetch all hierarchy data from Supabase using the server client (cookie-based).
 */
export async function getHierarchyData(): Promise<HierarchyData> {
  const supabase = await createClient();

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
