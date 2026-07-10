'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@orasage/ui/button';

type AdminButtonProps = ComponentProps<typeof Button>;

function adminSubmitClasses(
  variant: AdminButtonProps['variant'],
  size: AdminButtonProps['size'],
  className?: string,
) {
  const variantClass =
    variant === 'destructive' ? 'admin-submit-btn--danger'
      : variant === 'secondary' ? 'admin-submit-btn--secondary'
        : variant === 'ghost' ? 'admin-submit-btn--ghost'
          : 'admin-submit-btn--primary';
  const sizeClass = size === 'sm' ? 'admin-submit-btn--sm' : size === 'lg' ? 'admin-submit-btn--lg' : '';
  return ['admin-submit-btn', variantClass, sizeClass, className].filter(Boolean).join(' ');
}

export function AdminSubmitButton({ className, children, variant, size, ...props }: AdminButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={adminSubmitClasses(variant, size, className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AdminLoginButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild className="mt-4">
      <a href={href}>{children}</a>
    </Button>
  );
}
