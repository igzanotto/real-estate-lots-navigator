import Link from 'next/link';
import { BreadcrumbItem } from '@/types/hierarchy.types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'dark' | 'light';
}

const styles = {
  dark: {
    separator: 'text-gray-600',
    link: 'text-gray-400 hover:text-white hover:underline',
    current: 'text-gray-300 font-medium',
  },
  light: {
    separator: 'text-gray-400',
    link: 'text-gray-500 hover:text-gray-900 hover:underline',
    current: 'text-gray-700 font-medium',
  },
};

export function Breadcrumb({ items, variant = 'dark' }: BreadcrumbProps) {
  const s = styles[variant];

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className={`mx-2 ${s.separator}`}>/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className={s.link}
            >
              {item.label}
            </Link>
          ) : (
            <span className={s.current}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
