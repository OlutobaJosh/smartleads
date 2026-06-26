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

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} id={id}>
      {/* Trigger — white background to pop on zinc-100 card */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3.5 text-sm outline-none transition-all duration-150',
          open
            ? 'border-black/25 ring-2 ring-black/8 shadow-sm'
            : 'border-black/10 hover:border-black/20 shadow-sm',
          selected ? 'text-zinc-900' : 'text-zinc-400'
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={cn(
            'ml-2 h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-black/8 bg-white shadow-xl shadow-black/10"
        >
          {/* Placeholder */}
          <div
            role="option"
            aria-selected={value === ''}
            onClick={() => { onChange(''); setOpen(false); }}
            className="flex cursor-pointer items-center px-3.5 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-50"
          >
            {placeholder}
          </div>

          <div className="border-t border-black/5" />

          {options.map(opt => (
            <div
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-zinc-50',
                value === opt.value ? 'text-zinc-900 font-medium' : 'text-zinc-600'
              )}
            >
              <span className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center">
                {value === opt.value && <Check className="h-3 w-3 text-zinc-900" />}
              </span>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
