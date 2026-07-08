'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@orasage/ui/button';

type AdminButtonProps = ComponentProps<typeof Button>;

export function AdminSubmitButton({ className, children, ...props }: AdminButtonProps) {
  return (
    <Button type="submit" className={className} {...props}>
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
