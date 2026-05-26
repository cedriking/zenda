"use client";

import { useTranslations } from "next-intl";
import React from "react";
import {
  AccordionItem,
  FadeUp,
  StaggerChild,
  StaggerContainer,
} from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

function Section({
  title,
  items,
}: {
  title: string;
  items: { title: string; content: React.ReactNode }[];
}) {
  return (
    <section className="mb-16">
      <FadeUp>
        <h2 className="mb-8 font-bold text-2xl">{title}</h2>
      </FadeUp>
      <div className="space-y-8">
        {items.map((item) => (
          <FadeUp key={item.title}>
            <div>
              <h3 className="mb-2 font-semibold text-lg">{item.title}</h3>
              {item.content}
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

export function DocsAnimations() {
  const t = useTranslations("docs");

  const GETTING_STARTED = [
    {
      title: t("step1Title"),
      content: (
        <>
          <p className="mb-3 text-muted-foreground">
            {t.rich("step1P1", {
              link: (chunk: React.ReactNode) => (
                <Link className="text-primary underline" href="/signup">
                  {chunk}
                </Link>
              ),
            })}
          </p>
          <p className="text-muted-foreground">{t("step1P2")}</p>
        </>
      ),
    },
    {
      title: t("step2Title"),
      content: (
        <>
          <p className="mb-3 text-muted-foreground">{t("step2P1")}</p>
          <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
            <li>{t("step2Li1")}</li>
            <li>
              {t.rich("step2Li2", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>{t("step2Li3")}</li>
            <li>{t("step2Li4")}</li>
          </ol>
          <p className="mt-3 text-muted-foreground">{t("step2P2")}</p>
        </>
      ),
    },
    {
      title: t("step3Title"),
      content: (
        <>
          <p className="mb-3 text-muted-foreground">{t("step3P1")}</p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              {t.rich("step3Li1", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich("step3Li2", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich("step3Li3", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich("step3Li4", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich("step3Li5", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
          </ul>
          <p className="mt-3 text-muted-foreground">{t("step3P2")}</p>
        </>
      ),
    },
    {
      title: t("step4Title"),
      content: <p className="text-muted-foreground">{t("step4P1")}</p>,
    },
  ];

  const CONVERSATIONS = [
    {
      title: t("convAutoTitle"),
      content: (
        <p className="text-muted-foreground">
          {t.rich("convAutoDesc", {
            strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
          })}
        </p>
      ),
    },
    {
      title: t("convTakeoverTitle"),
      content: (
        <>
          <p className="mb-3 text-muted-foreground">
            {t.rich("convTakeoverP1", {
              strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              strong2: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
          <p className="text-muted-foreground">{t("convTakeoverP2")}</p>
        </>
      ),
    },
    {
      title: t("convAttentionTitle"),
      content: (
        <p className="text-muted-foreground">{t("convAttentionDesc")}</p>
      ),
    },
  ];

  const CUSTOMIZATION = [
    {
      title: t("customReceptionistTitle"),
      content: (
        <>
          <p className="text-muted-foreground">
            {t.rich("customReceptionistP1", {
              strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              {t.rich("customReceptionistLi1", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich("customReceptionistLi2", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
            <li>
              {t.rich("customReceptionistLi3", {
                strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
              })}
            </li>
          </ul>
        </>
      ),
    },
    {
      title: t("customKbTitle"),
      content: (
        <>
          <p className="mb-3 text-muted-foreground">
            {t.rich("customKbP1", {
              strong: (chunk: React.ReactNode) => <strong>{chunk}</strong>,
            })}
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>{t("customKbLi1")}</li>
            <li>{t("customKbLi2")}</li>
            <li>{t("customKbLi3")}</li>
          </ul>
          <p className="mt-3 text-muted-foreground">{t("customKbP2")}</p>
        </>
      ),
    },
  ];

  const FAQ_ITEMS = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ];

  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="relative">
      <FadeUp>
        <h1 className="mb-4 font-bold text-4xl md:text-5xl">{t("title")}</h1>
        <p className="mb-12 text-lg text-muted-foreground">{t("desc")}</p>
      </FadeUp>

      <Section items={GETTING_STARTED} title={t("gettingStarted")} />
      <Section items={CONVERSATIONS} title={t("conversations")} />
      <Section items={CUSTOMIZATION} title={t("customization")} />

      {/* Billing */}
      <section className="mb-16">
        <FadeUp>
          <h2 className="mb-8 font-bold text-2xl">{t("billing")}</h2>
        </FadeUp>
        <FadeUp>
          <p className="mb-4 text-muted-foreground">{t("billingTrial")}</p>
        </FadeUp>
        <StaggerContainer
          className="mb-4 grid gap-4 md:grid-cols-4"
          stagger={0.1}
        >
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">{t("billingSolo")}</h4>
                <p className="mt-1 text-muted-foreground text-sm">
                  {t("billingSoloDesc")}
                </p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card className="ring-2 ring-primary">
              <CardContent>
                <h4 className="font-semibold">{t("billingStarter")}</h4>
                <p className="mt-1 text-muted-foreground text-sm">
                  {t("billingStarterDesc")}
                </p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">{t("billingPro")}</h4>
                <p className="mt-1 text-muted-foreground text-sm">
                  {t("billingProDesc")}
                </p>
              </CardContent>
            </Card>
          </StaggerChild>
          <StaggerChild>
            <Card>
              <CardContent>
                <h4 className="font-semibold">{t("billingBusiness")}</h4>
                <p className="mt-1 text-muted-foreground text-sm">
                  {t("billingBusinessDesc")}
                </p>
              </CardContent>
            </Card>
          </StaggerChild>
        </StaggerContainer>
        <FadeUp>
          <p className="text-muted-foreground">
            {t.rich("billingCancel", {
              link: (chunk: React.ReactNode) => (
                <Link className="text-primary underline" href="/pricing">
                  {chunk}
                </Link>
              ),
            })}
          </p>
        </FadeUp>
      </section>

      {/* FAQ */}
      <section>
        <FadeUp>
          <h2 className="mb-8 font-bold text-2xl">{t("commonQuestions")}</h2>
        </FadeUp>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              answer={item.a}
              isOpen={openFaq === i}
              key={item.q}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              question={item.q}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
