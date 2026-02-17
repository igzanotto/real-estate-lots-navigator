'use client';

import { Layer } from '@/types/hierarchy.types';
import { STATUS_DOT_CLASSES } from '@/lib/constants/status';

interface SiblingNavigatorProps {
  siblings: Layer[];
  currentLayerId: string;
  label: string;            // e.g. "Piso"
  onSelect: (sibling: Layer) => void;
}

export function SiblingNavigator({ siblings, currentLayerId, label, onSelect }: SiblingNavigatorProps) {
  // Show in reverse order so highest floor is at top
  const sorted = [...siblings].reverse();

  return (
    <aside className="w-20 bg-white border-l border-gray-200 flex flex-col">
      <div className="px-2 py-3 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                  flex items-center gap-2 px-3 py-2.5 text-sm transition-colors
                  ${isCurrent
                    ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT_CLASSES[sibling.status]}`} />
                <span className="truncate">{sibling.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
