import * as React from 'react';

import { cn } from '@/lib/utils';

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-accent/50 focus-visible:bg-input-focus',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
