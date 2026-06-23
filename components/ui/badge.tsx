import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-accent/30 bg-accent/10 text-accent',
        hot:
          'border-red-500/40 bg-red-500/10 text-red-400',
        warm:
          'border-amber-500/40 bg-amber-500/10 text-amber-400',
        cold:
          'border-sky-500/40 bg-sky-500/10 text-sky-400',
        outline:
          'border-border bg-transparent text-foreground',
        muted:
          'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
