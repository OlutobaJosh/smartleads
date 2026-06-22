import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-mono font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 transition-colors overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-accent/30 bg-accent/10 text-accent',
        secondary: 'border-border bg-muted text-muted-foreground',
        hot: 'border-accent/40 bg-accent/15 text-accent',
        warm: 'border-border bg-secondary text-secondary-foreground',
        cold: 'border-border bg-muted text-muted-foreground',
        error: 'border-destructive/40 bg-destructive/10 text-destructive',
        outline: 'border-border text-foreground bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
