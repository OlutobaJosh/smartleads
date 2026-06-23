import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 select-none leading-none',
        className
      )}
      {...props}
    />
  );
}

export { Label };
