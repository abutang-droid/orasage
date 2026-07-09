'use client';

import { Alert, AlertDescription, Button, Card, CardContent, Input, Label, Textarea } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useProfileAuth } from './ProfileAuth';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const CATEGORIES = ['general', 'complaint', 'refund', 'bug'] as const;

/** 「联系我们」留言表单 — 游客可提交，登录用户预填姓名/邮箱 */
export function ContactForm() {
  const t = useTranslations('profile.contact');
  const locale = useLocale();
  const { user } = useProfileAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('general');
  const [orderNo, setOrderNo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.displayName || '');
    setEmail((prev) => prev || user.email || '');
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'submitting') return;
    setState('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, category, orderNo, subject, message, locale }),
      });
      if (!res.ok) throw new Error(`submit ${res.status}`);
      setState('success');
      setSubject('');
      setMessage('');
      setOrderNo('');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <Card>
        <CardContent className="space-y-3 p-6 text-center">
          <p className="font-medium text-foreground">{t('successTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('successDesc')}</p>
          {user ? (
            <Button variant="secondary" asChild>
              <Link href="/profile/tickets">{t('viewTickets')}</Link>
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => setState('idle')}>
            {t('sendAnother')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{t('nameLabel')}</Label>
              <Input
                id="contact-name"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">{t('emailLabel')}</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={320}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-category">{t('categoryLabel')}</Label>
              <select
                id="contact-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {t(`category.${value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-order">{t('orderNoLabel')}</Label>
              <Input
                id="contact-order"
                name="orderNo"
                maxLength={64}
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder={t('orderNoPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-subject">{t('subjectLabel')}</Label>
            <Input
              id="contact-subject"
              name="subject"
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('subjectPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">{t('messageLabel')}</Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              maxLength={5000}
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messagePlaceholder')}
            />
          </div>

          {state === 'error' ? (
            <Alert variant="destructive">
              <AlertDescription>{t('submitError')}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" size="lg" disabled={state === 'submitting'} className="w-full sm:w-auto">
            {state === 'submitting' ? t('submitting') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
