import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const inputVariants = cva(
  [
    'w-full rounded-[var(--orasage-radius-md)] border border-border bg-input text-foreground',
    'px-4 placeholder:text-muted-foreground',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-control-sm min-h-control-sm text-sm',
        md: 'h-control-md min-h-control-md text-sm',
        lg: 'h-control-lg min-h-control-lg text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size = 'md', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input, inputVariants };
