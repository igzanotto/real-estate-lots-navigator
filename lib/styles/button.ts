type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

const base = 'rounded-lg transition-colors inline-flex items-center justify-center';

const variants: Record<Variant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
  ghost: 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
};

export function buttonStyles(variant: Variant = 'primary', size: Size = 'md'): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}
