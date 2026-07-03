import * as React from 'react';
import { cn } from '../lib/utils';

function FieldError({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn('mt-1.5 text-sm text-destructive', className)}
      {...props}
    />
  );
}

function FieldHint({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-hint"
      className={cn('mt-1.5 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function FormField({
  className,
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  className?: string;
  label: React.ReactNode;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div data-slot="form-field" className={cn('space-y-2', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? <FieldError>{error}</FieldError> : null}
      {!error && hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

export { FieldError, FieldHint, FormField };
