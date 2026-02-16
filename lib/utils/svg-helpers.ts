import { EntityStatus } from '@/types/hierarchy.types';

/**
 * Get color configuration for entity status
 */
export function getStatusColors(status: EntityStatus) {
  const colors = {
    available: {
      fill: 'rgba(76, 175, 80, 0.15)',
      stroke: '#4CAF50',
      indicator: '#4CAF50',
      name: 'Disponible',
    },
    reserved: {
      fill: 'rgba(255, 152, 0, 0.15)',
      stroke: '#FF9800',
      indicator: '#FF9800',
      name: 'Reservado',
    },
    sold: {
      fill: 'rgba(244, 67, 54, 0.15)',
      stroke: '#F44336',
      indicator: '#F44336',
      name: 'Vendido',
    },
    not_available: {
      fill: 'rgba(158, 158, 158, 0.15)',
      stroke: '#9E9E9E',
      indicator: '#9E9E9E',
      name: 'No Disponible',
    },
  };

  return colors[status];
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format area with unit
 */
export function formatArea(area: number, unit: string = 'm²'): string {
  return `${area.toLocaleString('es-AR')} ${unit}`;
}
