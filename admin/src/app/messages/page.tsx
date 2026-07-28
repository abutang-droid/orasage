import { redirect } from 'next/navigation';

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function MessagesRedirectPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') q.set(k, v);
  }
  const qs = q.toString();
  redirect(`/ops/messages${qs ? `?${qs}` : ''}`);
}
