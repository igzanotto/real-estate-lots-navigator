import { EntityStatus } from '@/types/hierarchy.types';

export const STATUS_LABELS: Record<EntityStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
  not_available: 'No Disponible',
};

export const STATUS_CLASSES: Record<EntityStatus, string> = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-orange-100 text-orange-800',
  sold: 'bg-red-100 text-red-800',
  not_available: 'bg-gray-100 text-gray-800',
};

export const STATUS_DOT_CLASSES: Record<EntityStatus, string> = {
  available: 'bg-green-400',
  reserved: 'bg-orange-400',
  sold: 'bg-red-400',
  not_available: 'bg-gray-400',
};

export const STATUS_COLORS: Record<EntityStatus, { fill: string; stroke: string; indicator: string }> = {
  available: {
    fill: 'rgba(76, 175, 80, 0.15)',
    stroke: '#4CAF50',
    indicator: '#4CAF50',
  },
  reserved: {
    fill: 'rgba(255, 152, 0, 0.15)',
    stroke: '#FF9800',
    indicator: '#FF9800',
  },
  sold: {
    fill: 'rgba(244, 67, 54, 0.15)',
    stroke: '#F44336',
    indicator: '#F44336',
  },
  not_available: {
    fill: 'rgba(158, 158, 158, 0.15)',
    stroke: '#9E9E9E',
    indicator: '#9E9E9E',
  },
};
