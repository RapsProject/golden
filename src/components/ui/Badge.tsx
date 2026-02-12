import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-brand-secondary/20 text-brand-dark',
        className
      )}
    >
      {children}
    </span>
  );
}
