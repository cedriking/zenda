'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { FadeUp, StaggerContainer, StaggerChild, AccordionItem } from '@/components/motion'

function Section({ title, items }: { title: string; items: { title: string; content: React.ReactNode }[] }) {
  return (
    <section className="mb-16">
      <FadeUp>
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
      </FadeUp>
      <div className="space-y-8">
        {items.map(item => (
          <FadeUp key={item.title}>
            <div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              {item.content}
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

export function DocsAnimations() {
  const t = useTranslations('docs')

  const GETTING_STARTED = [
    {
      title: t('step1Title'),
      content: (
        <>
          <p className="text-muted-foreground mb-3">
            {t.rich('step1P1', {
              link: (chunk: React.ReactNode) => <Link href="/signup" className="text-primary underline">{chunk}</Link>,
            })}
          </p>
          <p className="text-muted-foreground">{t('step1P2')}</p>
        </>
      ),
    },
    {
      title: t('step2Title'),
      content: (
        <>
          <p className="text-muted-foreground mb-3">{t('step2P1')}</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>{t('step2Li1')}</li>
            <li>
              {t.rich('step2Li2', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>{t('step2Li3')}</li>
            <li>{t('step2Li4')}</li>
          </ol>
          <p className="text-muted-foreground mt-3">{t('step2P2')}</p>
        </>
      ),
    },
    {
      title: t('step3Title'),
      content: (
        <>
          <p className="text-muted-foreground mb-3">{t('step3P1')}</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              {t.rich('step3Li1', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich('step3Li2', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich('step3Li3', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich('step3Li4', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich('step3Li5', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
          </ul>
          <p className="text-muted-foreground mt-3">{t('step3P2')}</p>
        </>
      ),
    },
    {
      title: t('step4Title'),
      content: (
        <p className="text-muted-foreground">{t('step4P1')}</p>
      ),
    },
  ]

  const CONVERSATIONS = [
    {
      title: t('convAutoTitle'),
      content: (
        <p className="text-muted-foreground">
          {t.rich('convAutoDesc', {
            strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
          })}
        </p>
      ),
    },
    {
      title: t('convTakeoverTitle'),
      content: (
        <>
          <p className="text-muted-foreground mb-3">
            {t.rich('convTakeoverP1', {
              strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              strong2: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
          <p className="text-muted-foreground">{t('convTakeoverP2')}</p>
        </>
      ),
    },
    {
      title: t('convAttentionTitle'),
      content: <p className="text-muted-foreground">{t('convAttentionDesc')}</p>,
    },
  ]

  const CUSTOMIZATION = [
    {
      title: t('customReceptionistTitle'),
      content: (
        <>
          <p className="text-muted-foreground">
            {t.rich('customReceptionistP1', {
              strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
            <li>
              {t.rich('customReceptionistLi1', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich('customReceptionistLi2', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich('customReceptionistLi3', {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
          </ul>
        </>
      ),
    },
    {
      title: t('customKbTitle'),
      content: (
        <>
          <p className="text-muted-foreground mb-3">
            {t.rich('customKbP1', {
              strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>{t('customKbLi1')}</li>
            <li>{t('customKbLi2')}</li>
            <li>{t('customKbLi3')}</li>
          </ul>
          <p className="text-muted-foreground mt-3">{t('customKbP2')}</p>
        </>
      ),
    },
  ]

  const FAQ_ITEMS = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
  ]

  const [openFaq, setOpenFaq] = React.useState<number | null>(null)

  return (
    <div className="relative">
      <FadeUp>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground mb-12">{t('desc')}</p>
      </FadeUp>

      <Section title={t('gettingStarted')} items={GETTING_STARTED} />
      <Section title={t('conversations')} items={CONVERSATIONS} />
      <Section title={t('customization')} items={CUSTOMIZATION} />

      {/* Billing */}
      <section className="mb-16">
        <FadeUp>
          <h2 className="text-2xl font-bold mb-8">{t('billing')}</h2>
        </FadeUp>
        <FadeUp>
          <p className="text-muted-foreground mb-4">{t('billingTrial')}</p>
        </FadeUp>
        <StaggerContainer className="grid md:grid-cols-4 gap-4 mb-4" stagger={0.1}>
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">{t('billingSolo')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('billingSoloDesc')}</p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card className="ring-2 ring-primary">
              <CardContent>
                <h4 className="font-semibold">{t('billingStarter')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('billingStarterDesc')}</p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">{t('billingPro')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('billingProDesc')}</p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">{t('billingBusiness')}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t('billingBusinessDesc')}</p>
              </CardContent>
            </Card>
          </StaggerChild>
        </StaggerContainer>
        <FadeUp>
          <p className="text-muted-foreground">
            {t.rich('billingCancel', {
              link: (chunk: React.ReactNode) => <Link href="/pricing" className="text-primary underline">{chunk}</Link>,
            })}
          </p>
        </FadeUp>
      </section>

      {/* FAQ */}
      <section>
        <FadeUp>
          <h2 className="text-2xl font-bold mb-8">{t('commonQuestions')}</h2>
        </FadeUp>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={item.q}
              question={item.q}
              answer={item.a}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
