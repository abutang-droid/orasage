import type { ReactNode } from 'react';

/** 门户页面内容区 */
export async function PortalChrome({ children }: { children: ReactNode }) {
  return <main className="flex-1">{children}</main>;
}
