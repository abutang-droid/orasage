import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--os-radius-btn)] text-sm font-semibold',
    'transition-[background-color,border-color,color,box-shadow,opacity,transform] duration-fast ease-standard',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[var(--os-opacity-disabled)]',
    'aria-disabled:pointer-events-none aria-disabled:opacity-[var(--os-opacity-disabled)]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-[rgb(var(--os-rgb-mono-black-hover))] hover:-translate-y-px active:translate-y-0 active:bg-primary/90',
        secondary:
          'border border-border bg-secondary text-secondary-foreground hover:bg-muted active:bg-muted/80',
        outline: 'border border-border bg-background text-foreground hover:bg-muted active:bg-muted/80',
        ghost: 'text-muted-foreground hover:bg-transparent hover:text-foreground active:text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        link: 'h-auto min-h-0 rounded-none px-0 text-primary underline-offset-4 hover:underline',
        'brand-purple':
          'bg-brand-purple text-primary-foreground hover:bg-brand-purple/90 active:bg-brand-purple/80',
      },
      size: {
        sm: 'h-control-sm min-h-control-sm px-4 text-sm [&_svg]:size-4',
        default: 'h-control-md min-h-control-md px-6 text-sm [&_svg]:size-4',
        lg: 'h-control-lg min-h-control-lg px-7 text-base [&_svg]:size-5',
        icon: 'size-11 min-h-target min-w-11 p-0 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          aria-disabled={disabled || loading ? true : undefined}
          aria-busy={loading || undefined}
          data-loading={loading || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        <span className={cn(loading && 'opacity-90')}>{children}</span>
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
