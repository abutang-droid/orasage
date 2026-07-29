import { redirect } from 'next/navigation';

type Props = { params: Promise<{ sku: string }> };

export default async function ProductEditRedirectPage({ params }: Props) {
  const { sku } = await params;
  redirect(`/shop/products/${encodeURIComponent(decodeURIComponent(sku))}`);
}
