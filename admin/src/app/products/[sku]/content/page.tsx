import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ sku: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductContentRedirectPage({ params, searchParams }: Props) {
  const { sku } = await params;
  const sp = (await searchParams) ?? {};
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') q.set(k, v);
  }
  const qs = q.toString();
  redirect(
    `/content/products/${encodeURIComponent(decodeURIComponent(sku))}${qs ? `?${qs}` : ''}`,
  );
}
