'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = '— select —',
  className,
  id,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-input px-3.5 text-sm outline-none transition-all duration-150',
          open
            ? 'border-accent/50 bg-input-focus ring-2 ring-ring/30'
            : 'hover:border-border/60',
          selected ? 'text-foreground' : 'text-muted-foreground/60'
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={cn(
            'ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-border bg-card shadow-xl shadow-black/50"
        >
          {/* Placeholder option */}
          <div
            role="option"
            aria-selected={value === ''}
            onClick={() => { onChange(''); setOpen(false); }}
            className="flex cursor-pointer items-center px-3.5 py-2.5 text-sm text-muted-foreground/60 transition-colors hover:bg-secondary"
          >
            {placeholder}
          </div>

          <div className="border-t border-border/50" />

          {options.map(opt => (
            <div
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-secondary',
                value === opt.value ? 'text-accent' : 'text-foreground'
              )}
            >
              <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center">
                {value === opt.value && <Check className="h-3 w-3 text-accent" />}
              </span>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
