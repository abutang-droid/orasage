import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../lib/utils';
import type { OrasageControlSize } from '@orasage/tokens';

const sizeClass: Record<OrasageControlSize, string> = {
  sm: 'size-[18px]',
  md: 'size-5',
  lg: 'size-6',
};

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  size?: OrasageControlSize;
};

function Checkbox({ className, size = 'md', ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(
        'shrink-0 rounded-[6px] border border-border bg-input',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        sizeClass[size],
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
