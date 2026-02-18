import { EntityStatus } from '@/types/hierarchy.types';

export const STATUS_LABELS: Record<EntityStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
  not_available: 'No Disponible',
};

export const STATUS_CLASSES: Record<EntityStatus, string> = {
  available: 'bg-[var(--status-available-bg)] text-[var(--status-available)] border border-[var(--status-available)]/20',
  reserved: 'bg-[var(--status-reserved-bg)] text-[var(--status-reserved)] border border-[var(--status-reserved)]/20',
  sold: 'bg-[var(--status-sold-bg)] text-[var(--status-sold)] border border-[var(--status-sold)]/20',
  not_available: 'bg-[var(--status-unavailable-bg)] text-[var(--status-unavailable)] border border-[var(--status-unavailable)]/20',
};

export const STATUS_DOT_CLASSES: Record<EntityStatus, string> = {
  available: 'bg-[var(--status-available)]',
  reserved: 'bg-[var(--status-reserved)]',
  sold: 'bg-[var(--status-sold)]',
  not_available: 'bg-[var(--status-unavailable)]',
};

export const STATUS_COLORS: Record<EntityStatus, { fill: string; stroke: string; indicator: string }> = {
  available: {
    fill: 'rgba(107, 175, 123, 0.12)',
    stroke: '#6BAF7B',
    indicator: '#6BAF7B',
  },
  reserved: {
    fill: 'rgba(212, 162, 76, 0.12)',
    stroke: '#D4A24C',
    indicator: '#D4A24C',
  },
  sold: {
    fill: 'rgba(196, 96, 90, 0.12)',
    stroke: '#C4605A',
    indicator: '#C4605A',
  },
  not_available: {
    fill: 'rgba(94, 90, 93, 0.12)',
    stroke: '#5E5A5D',
    indicator: '#5E5A5D',
  },
};
