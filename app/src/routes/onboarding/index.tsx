import { useNavigate } from "@/utils/router";
import {
  ArrowRight,
  Building2,
  Check,
  MessageSquare,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { openExternalLink } from "../../actions/shell";
import { apiFetch } from "../../services/api-client";
import { useAuthStore } from "../../stores/auth";

const STEP_IDS = [
  "whatsapp_connected",
  "business_info",
  "services",
  "availability",
  "policies",
  "receptionist_config",
  "plan_selection",
] as const;

const STEP_ICONS = ["📱", "🏢", "✂️", "🕐", "📋", "🤖", "🚀"];

const PLAN_TIERS = [
  {
    id: "local_solo" as const,
    price: 29,
    contacts: 75,
    icon: Zap,
    highlight: false,
  },
  {
    id: "local_starter" as const,
    price: 49,
    contacts: 200,
    icon: MessageSquare,
    highlight: true,
  },
  {
    id: "local_pro" as const,
    price: 89,
    contacts: 600,
    icon: Users,
    highlight: false,
  },
  {
    id: "local_business" as const,
    price: 149,
    contacts: 1200,
    icon: Building2,
    highlight: false,
  },
];

const STEP_KEYS: Record<string, string> = {
  whatsapp_connected: "onboarding.steps.connectWhatsapp",
  business_info: "onboarding.steps.businessInfo",
  services: "onboarding.steps.services",
  availability: "onboarding.steps.availability",
  policies: "onboarding.steps.policies",
  receptionist_config: "onboarding.steps.receptionistSetup",
  plan_selection: "onboarding.steps.choosePlan",
};

interface ChatMessage {
  content: string;
  id: number;
  role: "assistant" | "user";
}

let msgId = 0;

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { updateWorkspace } = useAuthStore();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);

  const steps = STEP_IDS.map((id, idx) => ({
    id,
    label: t(STEP_KEYS[id] ?? id),
    icon: STEP_ICONS[idx],
  }));

  useEffect(() => {
    const timer = setTimeout(() => setSidebarVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadStatus();
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: only run once on mount
  }, [loadStatus]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const typeMessage = useCallback((text: string, onComplete?: () => void) => {
    setIsTyping(true);
    setTypingText("");
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        setTypingText(text.slice(0, i + 1));
        i++;
        typingRef.current = setTimeout(tick, 18 + Math.random() * 22);
      } else {
        setTypingText("");
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: text, id: ++msgId },
        ]);
        onComplete?.();
      }
    };
    typingRef.current = setTimeout(tick, 400);
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, []);

  useEffect(
    () => () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    },
    []
  );

  async function loadStatus() {
    try {
      const status = await apiFetch<{
        currentStep: string;
        progress: number;
        nextStep: string | null;
        steps: string[];
      }>("/onboarding/status");

      setProgress(status.progress);
      setCurrentStep(status.currentStep);

      if (status.currentStep === "ready") {
        updateWorkspace({ onboardingStep: "ready" });
        navigate("/dashboard");
        return;
      }

      const q = await apiFetch<{ question: string; step: string }>(
        "/onboarding/question"
      );
      if (q) {
        setCurrentStep(q.step);
        setTimeout(() => typeMessage(q.question), 600);
      }
    } catch {
      setTimeout(() => typeMessage(t("onboarding.setupAssistantDesc")), 600);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) {
      return;
    }

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, id: ++msgId },
    ]);
    setLoading(true);

    try {
      const result = await apiFetch<{
        acknowledged: string;
        nextStep: string;
        selectedTier?: string;
      }>("/onboarding/respond", {
        method: "POST",
        body: { step: currentStep, response: userMsg },
      });

      setCurrentStep(result.nextStep);

      const status = await apiFetch<{ currentStep: string; progress: number }>(
        "/onboarding/status"
      );
      setProgress(status.progress);

      if (result.nextStep === "ready") {
        updateWorkspace({ onboardingStep: "ready" });
        typeMessage(result.acknowledged, () => {
          setTimeout(() => navigate("/dashboard"), 1500);
        });
        return;
      }

      typeMessage(result.acknowledged, () => {
        setLoading(false);
        apiFetch<{ question: string; step: string }>("/onboarding/question")
          .then((q) => {
            if (q) {
              setTimeout(() => typeMessage(q.question), 500);
            }
          })
          .catch(() => {
            /* checkout URL open failure is non-critical */
          });
      });
      return;
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("common.error"), id: ++msgId },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanSelect(tier: string) {
    setCheckoutLoading(tier);
    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string }>(
        "/onboarding/respond",
        {
          method: "POST",
          body: { step: currentStep, response: tier },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `${t("onboarding.selectPlan")}: ${tier.charAt(0).toUpperCase()}${tier.slice(1)}`,
          id: ++msgId,
        },
      ]);

      setCurrentStep(result.nextStep);

      if (tier === "local_pro" || tier === "local_business") {
        const email = user?.email ?? "";
        const checkout = await apiFetch<{ url: string }>("/billing/checkout", {
          method: "POST",
          body: { tier, email },
        });
        if (checkout.url) {
          openExternalLink(checkout.url);
        }
      }

      const status = await apiFetch<{ currentStep: string; progress: number }>(
        "/onboarding/status"
      );
      setProgress(status.progress);

      typeMessage(result.acknowledged, () => {
        if (result.nextStep === "ready") {
          updateWorkspace({ onboardingStep: "ready" });
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("common.error"), id: ++msgId },
      ]);
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleSkipPlan() {
    setCheckoutLoading("skip");
    try {
      const result = await apiFetch<{ acknowledged: string; nextStep: string }>(
        "/onboarding/respond",
        {
          method: "POST",
          body: { step: currentStep, response: "skip" },
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "user", content: t("common.skip"), id: ++msgId },
      ]);
      setCurrentStep(result.nextStep);

      const status = await apiFetch<{ currentStep: string; progress: number }>(
        "/onboarding/status"
      );
      setProgress(status.progress);

      typeMessage(result.acknowledged, () => {
        if (result.nextStep === "ready") {
          updateWorkspace({ onboardingStep: "ready" });
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      });
    } catch {
      setTimeout(() => navigate("/dashboard"), 2000);
    } finally {
      setCheckoutLoading(null);
    }
  }

  const currentStepIndex = STEP_IDS.indexOf(
    currentStep as (typeof STEP_IDS)[number]
  );
  const isPlanSelection = currentStep === "plan_selection";
  const allMessages = [
    ...messages,
    ...(typingText
      ? [{ role: "assistant" as const, content: typingText, id: -1 }]
      : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Progress sidebar */}
      <aside
        className={`flex w-80 flex-col border-border border-r bg-white/80 p-8 backdrop-blur-sm transition-all duration-700 ease-out ${
          sidebarVisible
            ? "translate-x-0 opacity-100"
            : "-translate-x-8 opacity-0"
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20 shadow-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">
              {t("onboarding.setupTitle")}
            </h2>
            <p className="text-muted-foreground text-xs">
              {t("onboarding.setupSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          {steps.map((step, idx) => {
            const isComplete = idx < currentStepIndex;
            const isCurrent = step.id === currentStep;
            let stepClass = "text-muted-foreground";
            if (isComplete) {
              stepClass = "bg-emerald-50/50 text-emerald-600";
            } else if (isCurrent) {
              stepClass = "bg-primary/10 font-medium text-primary shadow-sm";
            }
            return (
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-500 ${stepClass}`}
                key={step.id}
                style={{
                  transitionDelay: `${idx * 80}ms`,
                  transform: sidebarVisible
                    ? "translateX(0)"
                    : "translateX(-12px)",
                  opacity: sidebarVisible ? 1 : 0,
                }}
              >
                <span
                  className={[
                    "text-base transition-transform duration-300",
                    isCurrent && "scale-125",
                    isComplete && !isCurrent && "scale-100",
                    !(isCurrent || isComplete) &&
                      "scale-100 opacity-50 grayscale",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {step.icon}
                </span>
                <span className="flex-1">{step.label}</span>
                {isComplete && <Check className="text-emerald-500" size={16} />}
                {isCurrent && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 border-border border-t pt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-xs">
              {t("onboarding.progress")}
            </span>
            <span className="font-bold text-primary text-xs">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-border border-b bg-white/60 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <MessageSquare className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {t("onboarding.setupAssistant")}
              </h3>
              <p className="text-muted-foreground text-xs">
                {t("onboarding.setupAssistantDesc")}
              </p>
            </div>
          </div>
        </div>

        {isPlanSelection ? (
          <PlanSelectionView
            chatEndRef={chatEndRef}
            checkoutLoading={checkoutLoading}
            messages={allMessages}
            onSelect={handlePlanSelect}
            onSkip={handleSkipPlan}
          />
        ) : (
          <ChatView
            chatEndRef={chatEndRef}
            input={input}
            isTyping={isTyping}
            loading={loading}
            messages={allMessages}
            onSubmit={handleSubmit}
            setInput={setInput}
          />
        )}
      </div>
    </div>
  );
}

/* ── Chat View ──────────────────────────────────────────────── */

function ChatView({
  messages,
  input,
  setInput,
  loading,
  isTyping,
  onSubmit,
  chatEndRef,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  isTyping: boolean;
  onSubmit: (e: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex-1 space-y-4 overflow-auto px-6 py-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && !messages.some((m) => m.id === -1) && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-border bg-card px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                    key={i}
                    style={{ animationDelay: `${i * 160}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form
        className="border-border border-t bg-white/80 px-6 py-4 backdrop-blur-sm"
        onSubmit={onSubmit}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <input
            className="flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
            disabled={loading || isTyping}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("onboarding.typeAnswer")}
            type="text"
            value={input}
          />
          <button
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 text-white shadow-emerald-500/20 shadow-lg transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={loading || isTyping || !input.trim()}
            type="submit"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </>
  );
}

/* ── Message Bubble ─────────────────────────────────────────── */

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in`}
      style={{
        animation: "fadeSlideIn 0.4s ease-out",
      }}
    >
      <div
        className={`max-w-lg rounded-2xl px-4 py-3 ${
          isUser
            ? "rounded-br-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/15 shadow-lg"
            : "rounded-bl-md border border-border bg-card text-foreground shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {msg.content}
        </p>
      </div>
    </div>
  );
}

/* ── Plan Selection View ────────────────────────────────────── */

function PlanSelectionView({
  messages,
  checkoutLoading,
  onSelect,
  onSkip,
  chatEndRef,
}: {
  messages: ChatMessage[];
  checkoutLoading: string | null;
  onSelect: (tier: string) => void;
  onSkip: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();

  const planFeatures: Record<string, string[]> = {
    local_solo: [
      t("onboarding.plans.local_solo.features.contacts", { count: 75 }),
      t("onboarding.plans.local_solo.features.whatsapp"),
      t("onboarding.plans.local_solo.features.reminders"),
      t("onboarding.plans.local_solo.features.languages"),
    ],
    local_starter: [
      t("onboarding.plans.local_starter.features.contacts", { count: 200 }),
      t("onboarding.plans.local_starter.features.whatsapp"),
      t("onboarding.plans.local_starter.features.reminders"),
      t("onboarding.plans.local_starter.features.staff"),
      t("onboarding.plans.local_starter.features.languages"),
    ],
    local_pro: [
      t("onboarding.plans.local_pro.features.contacts", { count: 600 }),
      t("onboarding.plans.local_pro.features.everythingStarter"),
      t("onboarding.plans.local_pro.features.staff"),
      t("onboarding.plans.local_pro.features.voice"),
      t("onboarding.plans.local_pro.features.support"),
    ],
    local_business: [
      t("onboarding.plans.local_business.features.contacts", { count: 1200 }),
      t("onboarding.plans.local_business.features.everythingPro"),
      t("onboarding.plans.local_business.features.staff"),
      t("onboarding.plans.local_business.features.api"),
      t("onboarding.plans.local_business.features.training"),
      t("onboarding.plans.local_business.features.support"),
    ],
  };

  return (
    <div className="flex-1 space-y-6 overflow-auto px-6 py-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {/* Founding pricing badge */}
      <div
        className="flex justify-center"
        style={{ animation: "fadeSlideIn 0.5s ease-out 0.2s both" }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-2.5 font-semibold text-amber-800 text-sm shadow-sm">
          <Sparkles className="text-amber-500" size={14} />
          {t("onboarding.foundingPricing")}
        </span>
      </div>

      {/* Plan cards */}
      <div
        className="mx-auto grid max-w-5xl grid-cols-2 gap-5 md:grid-cols-4"
        style={{ animation: "fadeSlideIn 0.6s ease-out 0.3s both" }}
      >
        {PLAN_TIERS.map((plan, idx) => {
          const Icon = plan.icon;
          const isCheckingOut = checkoutLoading === plan.id;
          const planKey = plan.id;
          const name = t(`onboarding.plans.${planKey}.name`);
          const desc = t(`onboarding.plans.${planKey}.desc`);
          const features = planFeatures[planKey] ?? [];

          return (
            <div
              className={`rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.highlight
                  ? "relative border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                  : "border-border hover:border-border"
              }`}
              key={plan.id}
              style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-1 font-semibold text-white text-xs shadow-emerald-500/30 shadow-lg">
                  {t("onboarding.mostPopular")}
                </div>
              )}
              <div className="mb-2 flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${plan.highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  <Icon size={18} />
                </div>
                <h4 className="font-bold text-foreground text-lg">{name}</h4>
              </div>
              <p className="mb-4 text-muted-foreground text-xs">{desc}</p>
              <div className="mb-5">
                <span className="font-extrabold text-3xl text-foreground">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground text-sm">
                  {t("plan.perMonth")}
                </span>
                <p className="mt-1 text-muted-foreground text-xs">
                  {t("plan.upToContacts", { count: plan.contacts })}
                </p>
              </div>
              <ul className="mb-6 space-y-2">
                {features.map((f) => (
                  <li
                    className="flex items-start gap-2 text-muted-foreground text-xs"
                    key={f}
                  >
                    <span className="mt-0.5 flex-shrink-0 text-emerald-400">
                      &#10003;
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20 shadow-lg hover:from-emerald-600 hover:to-emerald-700"
                    : "border-border text-muted-foreground hover:border-border hover:bg-muted"
                }`}
                disabled={checkoutLoading !== null}
                onClick={() => onSelect(plan.id)}
                type="button"
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("onboarding.processing")}
                  </span>
                ) : (
                  <>
                    {t("onboarding.selectPlan")}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Skip option */}
      <div
        className="flex justify-center pb-4"
        style={{ animation: "fadeSlideIn 0.6s ease-out 0.7s both" }}
      >
        <button
          className="flex items-center gap-1.5 text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground disabled:opacity-40"
          disabled={checkoutLoading !== null}
          onClick={onSkip}
          type="button"
        >
          {checkoutLoading === "skip" ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("onboarding.settingUp")}
            </span>
          ) : (
            t("onboarding.skipForNow")
          )}
        </button>
      </div>

      <div ref={chatEndRef} />
    </div>
  );
}
