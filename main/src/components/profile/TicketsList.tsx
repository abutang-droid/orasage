'use client';

import { Alert, AlertDescription, Badge, Card, CardContent } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { fetchTickets, type UserTicket } from '@/lib/auth';
import { ProfileListSkeleton } from './ProfileListSkeleton';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'muted'> = {
  new: 'secondary',
  processing: 'outline',
  resolved: 'default',
};

export function TicketsList() {
  const t = useTranslations('profile.tickets');
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setTickets(await fetchTickets());
      } catch {
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) return <ProfileListSkeleton rows={2} />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (tickets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('empty')}{' '}
        <Link href="/profile/contact" className="text-primary underline-offset-4 hover:underline">
          {t('contactLink')}
        </Link>
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Card>
            <CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    {ticket.subject || t('noSubject', { id: ticket.id })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    #{ticket.id} · {ticket.categoryLabel}
                    {ticket.orderNo ? ` · ${ticket.orderNo}` : ''}
                  </p>
                </div>
                <Badge variant={statusVariant[ticket.status] ?? 'muted'}>{ticket.statusLabel}</Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{ticket.body}</p>
              {ticket.adminReply ? (
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-foreground">{t('replyTitle')}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{ticket.adminReply}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t('pendingReply')}</p>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
