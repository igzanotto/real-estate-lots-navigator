'use client';

import { Layer } from '@/types/hierarchy.types';
import { STATUS_DOT_CLASSES } from '@/lib/constants/status';

interface SiblingNavigatorProps {
  siblings: Layer[];
  currentLayerId: string;
  label: string;
  onSelect: (sibling: Layer) => void;
}

export function SiblingNavigator({ siblings, currentLayerId, label, onSelect }: SiblingNavigatorProps) {
  const sorted = [...siblings].reverse();

  return (
    <aside className="w-[72px] border-l border-[var(--border-subtle)] flex flex-col bg-[var(--bg-surface)] animate-fade-in">
      <div className="px-2 py-3 border-b border-[var(--border-subtle)]">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.12em]">
          {label}s
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col py-1">
          {sorted.map((sibling) => {
            const isCurrent = sibling.id === currentLayerId;
            return (
              <button
                key={sibling.id}
                onClick={() => onSelect(sibling)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-2.5 text-xs transition-all duration-200 relative
                  ${isCurrent
                    ? 'text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }
                `}
              >
                {isCurrent && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[var(--accent)] rounded-r" />
                )}
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT_CLASSES[sibling.status]}`} />
                <span className="truncate">{sibling.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
