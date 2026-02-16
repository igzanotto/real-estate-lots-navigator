'use client';

import { useRouter, usePathname } from 'next/navigation';
import { NavigationLevel, BreadcrumbItem } from '@/types/navigation.types';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentLevel = (): NavigationLevel => {
    if (pathname === '/') return 'map';
    if (pathname.includes('/manzana/')) return 'block';
    if (pathname.includes('/zona/')) return 'zone';
    return 'map';
  };

  const navigateToMap = () => {
    router.push('/');
  };

  const navigateToZone = (zoneId: string) => {
    router.push(`/zona/${zoneId}`);
  };

  const navigateToBlock = (zoneId: string, blockId: string) => {
    router.push(`/zona/${zoneId}/manzana/${blockId}`);
  };

  const goBack = () => {
    router.back();
  };

  return {
    currentLevel: getCurrentLevel(),
    pathname,
    navigateToMap,
    navigateToZone,
    navigateToBlock,
    goBack,
  };
}
