import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className="relative w-full">
      <select
        data-slot="select"
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-input pl-3.5 pr-10 py-2 text-sm text-foreground outline-none transition-all duration-150 appearance-none cursor-pointer',
          'focus-visible:border-accent/50 focus-visible:bg-input-focus focus-visible:ring-2 focus-visible:ring-ring/30',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          // Style the placeholder/empty option
          '[&>option[value=""]]:text-muted-foreground',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

export { Select };
