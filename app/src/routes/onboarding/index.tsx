import { PERSONALITY_PRESETS } from "@zenda/shared/personality/presets";
import {
  ArrowLeft,
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
import { useNavigate } from "@/utils/router";
import { openExternalLink } from "../../actions/shell";
import { apiFetch } from "../../services/api-client";
import { useAuthStore } from "../../stores/auth";

const STEP_IDS = [
  "whatsapp_connected",
  "business_info",
  "services",
  "availability",
  "policies",
  "safety",
  "receptionist_config",
  "review",
  "test_receptionist",
  "plan_selection",
] as const;

const STEP_ICONS = ["📱", "🏢", "✂️", "🕐", "📋", "🛡️", "🤖", "✅", "💬", "🚀"];

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
  safety: "onboarding.steps.safety",
  receptionist_config: "onboarding.steps.receptionistSetup",
  review: "onboarding.steps.review",
  test_receptionist: "onboarding.steps.testReceptionist",
  plan_selection: "onboarding.steps.choosePlan",
};

interface ChatMessage {
  content: string;
  id: number;
  role: "assistant" | "user";
}

export default function OnboardingPage() {
  const msgIdRef = useRef(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, workspace: authWorkspace } = useAuthStore();
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
  const [savedResponses, setSavedResponses] = useState<Record<string, string>>(
    {}
  );
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages and typing updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

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
          { role: "assistant", content: text, id: ++msgIdRef.current },
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

      // Load saved responses for review/go-back
      try {
        const resp = await apiFetch<{ responses: Record<string, string> }>(
          "/onboarding/responses"
        );
        setSavedResponses(resp.responses ?? {});
      } catch {
        // Non-critical
      }

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
      { role: "user", content: userMsg, id: ++msgIdRef.current },
    ]);
    setLoading(true);

    try {
      const result = await apiFetch<{
        acknowledged: string;
        nextStep: string;
      }>("/onboarding/respond", {
        method: "POST",
        body: { step: currentStep, response: userMsg },
      });

      setCurrentStep(result.nextStep);

      // Save response locally for review/go-back
      setSavedResponses((prev) => ({ ...prev, [currentStep]: userMsg }));

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
            /* intentionally ignored */
          });
      });
      return;
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("common.error"),
          id: ++msgIdRef.current,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoBack() {
    if (loading || isTyping) {
      return;
    }
    setLoading(true);
    try {
      const result = await apiFetch<{
        previousStep: string;
        progress: number;
        question: { question: string; step: string } | null;
      }>("/onboarding/go-back", {
        method: "POST",
        body: { currentStep },
      });

      setCurrentStep(result.previousStep);
      setProgress(result.progress);

      // Clear messages after the go-back point and show the question again
      setMessages((prev) => prev.slice(0, -2));
      const questionText = result.question?.question;
      if (questionText) {
        setTimeout(() => typeMessage(questionText), 300);
      }
    } catch {
      // Silently fail
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
          id: ++msgIdRef.current,
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
        {
          role: "assistant",
          content: t("common.error"),
          id: ++msgIdRef.current,
        },
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
        { role: "user", content: t("common.skip"), id: ++msgIdRef.current },
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
  const isTestReceptionist = currentStep === "test_receptionist";
  const isReview = currentStep === "review";
  const isReceptionistConfig = currentStep === "receptionist_config";
  const canGoBack = currentStepIndex > 0 && currentStep !== "plan_selection";

  // Direct confirm for review step (bypasses input state)
  async function handleConfirmReview() {
    setLoading(true);
    try {
      const result = await apiFetch<{
        acknowledged: string;
        nextStep: string;
      }>("/onboarding/respond", {
        method: "POST",
        body: { step: currentStep, response: "looks good" },
      });
      setCurrentStep(result.nextStep);
      setSavedResponses((prev) => ({ ...prev, [currentStep]: "looks good" }));
    } catch {
      // Error handled silently — user can retry
    } finally {
      setLoading(false);
    }
  }

  // Handle personality picker selection
  async function handlePickPersonality(name: string, preset: string) {
    setLoading(true);
    try {
      const toneMap: Record<string, string> = {
        professional: "professional",
        warm: "warm",
        minimal: "casual",
        premium: "elegant",
        friendly: "friendly",
      };
      const tone = toneMap[preset] ?? "professional";
      const response = `${name}, ${tone}`;
      const result = await apiFetch<{
        acknowledged: string;
        nextStep: string;
      }>("/onboarding/respond", {
        method: "POST",
        body: { step: currentStep, response },
      });
      setCurrentStep(result.nextStep);
      setSavedResponses((prev) => ({ ...prev, [currentStep]: response }));
    } catch {
      // Error handled silently — user can retry
    } finally {
      setLoading(false);
    }
  }
  const allMessages = [
    ...messages,
    ...(typingText
      ? [{ role: "assistant" as const, content: typingText, id: -1 }]
      : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Progress sidebar */}
      <aside
        className={`flex w-80 flex-col border-border border-r bg-card/80 p-8 backdrop-blur-sm transition-all duration-700 ease-out ${
          sidebarVisible
            ? "translate-x-0 opacity-100"
            : "-translate-x-8 opacity-0"
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
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
              stepClass = "text-primary";
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
                {isComplete && <Check className="text-primary" size={16} />}
                {isCurrent && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>

        {/* Go-back button */}
        {canGoBack && (
          <button
            className="mb-4 flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
            disabled={loading || isTyping}
            onClick={handleGoBack}
            type="button"
          >
            <ArrowLeft size={14} />
            {t("onboarding.goBack")}
          </button>
        )}

        {/* Progress bar */}
        <div className="border-border border-t pt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-xs">
              {t("onboarding.progress")}
            </span>
            <span className="font-bold text-primary text-xs">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-border border-b bg-card/60 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
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

        {isPlanSelection && (
          <PlanSelectionView
            chatEndRef={chatEndRef}
            checkoutLoading={checkoutLoading}
            messages={allMessages}
            onSelect={handlePlanSelect}
            onSkip={handleSkipPlan}
          />
        )}
        {!isPlanSelection && isTestReceptionist && (
          <TestReceptionistView
            chatEndRef={chatEndRef}
            input={input}
            isTyping={isTyping}
            loading={loading}
            messages={allMessages}
            onSubmit={handleSubmit}
            setInput={setInput}
          />
        )}
        {isReceptionistConfig && (
          <PersonalityPickerView
            chatEndRef={chatEndRef}
            loading={loading}
            messages={allMessages}
            onPickPersonality={handlePickPersonality}
            workspaceName={authWorkspace?.name ?? ""}
          />
        )}
        {isReview && (
          <ReviewStepView
            chatEndRef={chatEndRef}
            loading={loading}
            messages={allMessages}
            onConfirmReview={handleConfirmReview}
            savedResponses={savedResponses}
          />
        )}
        {!(
          isPlanSelection ||
          isTestReceptionist ||
          isReview ||
          isReceptionistConfig
        ) && (
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
            className="rounded-xl bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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

/* ── Test Receptionist View ─────────────────────────────────── */

function TestReceptionistView({
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
        {/* Hint banner */}
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="text-primary" size={16} />
            </div>
            <p className="text-foreground text-sm">
              {t("onboarding.testReceptionist")}
            </p>
          </div>
        </div>

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
            placeholder={t("onboarding.testMessage")}
            type="text"
            value={input}
          />
          <button
            className="rounded-xl bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
            ? "rounded-br-md bg-primary text-primary-foreground shadow-lg shadow-primary/15"
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

/* ── Personality Picker View ───────────────────────────────── */

const PRESET_KEYS: (
  | "professional"
  | "warm"
  | "minimal"
  | "premium"
  | "friendly"
)[] = ["professional", "warm", "minimal", "premium", "friendly"];

function PersonalityPickerView({
  messages,
  loading,
  onPickPersonality,
  chatEndRef,
  workspaceName,
}: {
  messages: ChatMessage[];
  loading: boolean;
  onPickPersonality: (name: string, preset: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  workspaceName: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("es") ? "es" : "en") as "en" | "es";
  const [selected, setSelected] = useState<(typeof PRESET_KEYS)[number] | null>(
    null
  );
  const [hoveredPreset, setHoveredPreset] = useState<
    (typeof PRESET_KEYS)[number] | null
  >(null);
  const [receptionistName, setReceptionistName] = useState("Sofía");

  function handleConfirm() {
    if (!selected) {
      return;
    }
    onPickPersonality(receptionistName, selected);
  }

  const activePreset = hoveredPreset ?? selected;

  return (
    <div className="flex-1 space-y-4 overflow-auto px-6 py-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      <div
        className="mx-auto max-w-3xl space-y-4"
        style={{ animation: "fadeSlideIn 0.5s ease-out 0.2s both" }}
      >
        {/* Name input */}
        <div className="space-y-2">
          <label
            className="font-medium text-muted-foreground text-sm"
            htmlFor="receptionist-name"
          >
            {lang === "es"
              ? "Nombre de tu recepcionista"
              : "Your receptionist's name"}
          </label>
          <input
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            id="receptionist-name"
            onChange={(e) => setReceptionistName(e.target.value)}
            placeholder={lang === "es" ? "Ej: Sofía" : "e.g., Sofia"}
            value={receptionistName}
          />
        </div>

        {/* Preset cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {PRESET_KEYS.map((key) => {
            const preset = PERSONALITY_PRESETS[key];
            if (!preset) {
              return null;
            }
            const isSelected = selected === key;
            const isHovered = hoveredPreset === key;
            let stateClass =
              "border-border bg-card hover:border-primary/40 hover:bg-primary/5";
            if (isSelected) {
              stateClass =
                "border-primary bg-primary/10 shadow-md shadow-primary/10";
            } else if (isHovered) {
              stateClass = "border-primary/40 bg-primary/5";
            }
            return (
              <button
                className={`relative rounded-xl border-2 p-3 text-left transition-all duration-200 ${stateClass}`}
                key={key}
                onClick={() => setSelected(key)}
                onMouseEnter={() => setHoveredPreset(key)}
                onMouseLeave={() => setHoveredPreset(null)}
                type="button"
              >
                <div className="font-semibold text-foreground text-sm">
                  {lang === "es" ? preset.nameEs : preset.name}
                </div>
                <div className="mt-1 text-muted-foreground text-xs leading-snug">
                  {lang === "es" ? preset.descriptionEs : preset.description}
                </div>
                {/* Check mark for selected */}
                {isSelected && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Live preview */}
        {activePreset && PERSONALITY_PRESETS[activePreset] && (
          <div
            className="space-y-3 rounded-xl border border-border bg-muted/30 p-4"
            style={{ animation: "fadeSlideIn 0.3s ease-out" }}
          >
            <div className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              {t("onboarding.personalityPreview")}
            </div>

            {/* Greeting preview */}
            <div className="space-y-1.5">
              <div className="font-medium text-muted-foreground text-xs">
                {t("onboarding.personalityGreeting")}
              </div>
              <div className="max-w-md whitespace-pre-wrap rounded-lg border border-border/50 bg-white/80 px-4 py-3 text-foreground text-sm shadow-sm dark:bg-card/80">
                {PERSONALITY_PRESETS[activePreset].greetingTemplate[lang]
                  .replace("{name}", receptionistName || "Sofía")
                  .replace("{business}", workspaceName || "your business")}
              </div>
            </div>

            {/* Booking confirmation preview */}
            <div className="space-y-1.5">
              <div className="font-medium text-muted-foreground text-xs">
                {t("onboarding.personalityBooking")}
              </div>
              <div className="max-w-md whitespace-pre-wrap rounded-lg border border-border/50 bg-white/80 px-4 py-3 text-foreground text-sm shadow-sm dark:bg-card/80">
                {PERSONALITY_PRESETS[activePreset].previewBookingMessage[lang]
                  .replace(
                    "{service}",
                    lang === "es" ? "Corte de cabello" : "Haircut"
                  )
                  .replace(
                    "{date}",
                    lang === "es" ? "Lunes 2 de Junio" : "Monday, June 2"
                  )
                  .replace("{time}", "10:00 AM")}
              </div>
            </div>
          </div>
        )}

        {/* Confirm button */}
        <div className="flex justify-center pt-2 pb-4">
          <button
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!selected || loading}
            onClick={handleConfirm}
            type="button"
          >
            <Check size={16} />
            {t("onboarding.continue")}
          </button>
        </div>
      </div>

      <div ref={chatEndRef} />
    </div>
  );
}

/* ── Review Step View ───────────────────────────────────────── */

function ReviewStepView({
  messages,
  loading,
  onConfirmReview,
  chatEndRef,
  savedResponses,
}: {
  messages: ChatMessage[];
  loading: boolean;
  onConfirmReview: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  savedResponses: Record<string, string>;
}) {
  const { t } = useTranslation();

  const reviewSections = [
    {
      key: "business_info",
      label: t("onboarding.steps.businessInfo"),
      icon: "🏢",
    },
    { key: "services", label: t("onboarding.steps.services"), icon: "✂️" },
    {
      key: "availability",
      label: t("onboarding.steps.availability"),
      icon: "🕐",
    },
    { key: "policies", label: t("onboarding.steps.policies"), icon: "📋" },
    { key: "safety", label: t("onboarding.steps.safety"), icon: "🛡️" },
    {
      key: "receptionist_config",
      label: t("onboarding.steps.receptionistSetup"),
      icon: "🤖",
    },
  ];

  return (
    <div className="flex-1 space-y-4 overflow-auto px-6 py-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {/* Review cards */}
      <div
        className="mx-auto max-w-2xl space-y-3"
        style={{ animation: "fadeSlideIn 0.5s ease-out 0.2s both" }}
      >
        {reviewSections.map((section) => {
          const response = savedResponses[section.key];
          if (!response) {
            return null;
          }
          return (
            <div
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
              key={section.key}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-base">{section.icon}</span>
                <span className="font-medium text-foreground text-sm">
                  {section.label}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                {response}
              </p>
            </div>
          );
        })}
      </div>

      {/* Confirm button */}
      <div
        className="flex justify-center pt-2 pb-4"
        style={{ animation: "fadeSlideIn 0.5s ease-out 0.5s both" }}
      >
        <button
          className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={loading}
          onClick={onConfirmReview}
          type="button"
        >
          <Check size={16} />
          {t("onboarding.continue")}
        </button>
      </div>

      <div ref={chatEndRef} />
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
        <span className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-5 py-2.5 font-semibold text-sm text-warning shadow-sm">
          <Sparkles className="text-warning" size={14} />
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
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 font-semibold text-primary-foreground text-xs shadow-lg shadow-primary/30">
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
                    <span className="mt-0.5 flex-shrink-0 text-primary">
                      &#10003;
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
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
