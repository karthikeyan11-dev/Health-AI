import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gradient-primary text-white shadow-sm',
        gradient: 'border-transparent bg-gradient-primary text-white shadow-sm',
        secondary:
          'border-transparent bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/80',
        destructive:
          'border-transparent bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
        outline: 'text-foreground border-border bg-white',
        success:
          'border-transparent bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
