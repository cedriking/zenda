import { AlertCircle, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../services/api-client";

type PersonalityPreset =
  | "Professional"
  | "Warm"
  | "Minimal"
  | "Premium"
  | "Friendly";

interface ReceptionistSettings {
  concisenessLevel: number;
  confirmsBeforeBooking: boolean;
  formalityLevel: number;
  greetingStyle: string;
  personalityPreset: PersonalityPreset;
  proactivelySuggestTimes: boolean;
  speaksAsBusiness: boolean;
  useEmoji: boolean;
  warmthLevel: number;
}

const DEFAULT_SETTINGS: ReceptionistSettings = {
  personalityPreset: "Professional",
  formalityLevel: 3,
  concisenessLevel: 3,
  warmthLevel: 3,
  useEmoji: false,
  speaksAsBusiness: true,
  proactivelySuggestTimes: true,
  confirmsBeforeBooking: true,
  greetingStyle: "",
};

const PERSONALITY_PRESETS: PersonalityPreset[] = [
  "Professional",
  "Warm",
  "Minimal",
  "Premium",
  "Friendly",
];

export default function ReceptionistSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] =
    useState<ReceptionistSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null);
        const data = await apiFetch<ReceptionistSettings>(
          "/settings/receptionist"
        );
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      } catch {
        setLoadError(t("settings.errorLoad"));
      }
    }
    load();
  }, [t]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await apiFetch("/settings/receptionist", {
        method: "PATCH",
        body: settings,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : t("settings.errorSave")
      );
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ReceptionistSettings>(
    key: K,
    value: ReceptionistSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-bold text-2xl text-foreground">
          <Bot size={24} />
          {t("receptionist.settings")}
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          {t("settings.description")}
        </p>
      </div>

      {loadError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-600 text-sm">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      {saveError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          <AlertCircle size={16} />
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-600 text-sm">
          {t("settings.saved")}
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-border bg-card p-6">
        {/* Personality Preset */}
        <fieldset>
          <legend className="mb-3 block font-medium text-foreground text-sm">
            {t("settings.tone")}
          </legend>
          <div className="flex flex-wrap gap-3">
            {PERSONALITY_PRESETS.map((preset) => (
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                  settings.personalityPreset === preset
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
                key={preset}
              >
                <input
                  checked={settings.personalityPreset === preset}
                  className="sr-only"
                  name="personalityPreset"
                  onChange={() => updateField("personalityPreset", preset)}
                  type="radio"
                  value={preset}
                />
                <span className="font-medium text-sm">
                  {preset === "Professional"
                    ? t("settings.toneProfessional")
                    : preset === "Warm"
                      ? t("settings.toneWarm")
                      : preset === "Friendly"
                        ? t("settings.toneFriendly")
                        : preset}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Level Sliders */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SliderField
            highLabel={t("settings.slider.formal", "Formal")}
            label={t("settings.slider.formality", "Formality")}
            lowLabel={t("settings.toneCasual")}
            onChange={(v) => updateField("formalityLevel", v)}
            value={settings.formalityLevel}
          />
          <SliderField
            highLabel={t("settings.slider.brief", "Brief")}
            label={t("settings.slider.conciseness", "Conciseness")}
            lowLabel={t("settings.slider.detailed", "Detailed")}
            onChange={(v) => updateField("concisenessLevel", v)}
            value={settings.concisenessLevel}
          />
          <SliderField
            highLabel={t("settings.toneWarm")}
            label={t("settings.slider.warmth", "Warmth")}
            lowLabel={t("settings.slider.reserved", "Reserved")}
            onChange={(v) => updateField("warmthLevel", v)}
            value={settings.warmthLevel}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <ToggleField
            checked={settings.useEmoji}
            description={t("settings.toggles.useEmojiDesc", "Allow the receptionist to include emoji for a friendlier tone")}
            label={t("settings.toggles.useEmoji", "Use emoji in messages")}
            onChange={(v) => updateField("useEmoji", v)}
          />
          <ToggleField
            checked={settings.speaksAsBusiness}
            description={t("settings.toggles.speaksAsBusinessDesc", "Use 'we' instead of 'I' to represent the business collectively")}
            label={t("settings.toggles.speaksAsBusiness", "Speak as the business")}
            onChange={(v) => updateField("speaksAsBusiness", v)}
          />
          <ToggleField
            checked={settings.proactivelySuggestTimes}
            description={t("settings.toggles.proactiveSuggestDesc", "Offer available time slots without waiting for the customer to ask")}
            label={t("settings.toggles.proactiveSuggest", "Proactively suggest times")}
            onChange={(v) => updateField("proactivelySuggestTimes", v)}
          />
          <ToggleField
            checked={settings.confirmsBeforeBooking}
            description={t("settings.toggles.confirmBeforeDesc", "Always ask for explicit confirmation before finalizing an appointment")}
            label={t("settings.toggles.confirmBefore", "Confirm before booking")}
            onChange={(v) => updateField("confirmsBeforeBooking", v)}
          />
        </div>

        {/* Greeting Style */}
        <div>
          <label className="mb-1 block font-medium text-foreground text-sm">
            {t("settings.greetingTemplate")}
          </label>
          <input
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => updateField("greetingStyle", e.target.value)}
            placeholder={t("settings.greetingPlaceholder")}
            type="text"
            value={settings.greetingStyle}
          />
          <p className="mt-1 text-muted-foreground text-xs">
            {t("settings.greetingPlaceholderHint", "Use {{business}} and {{name}} as placeholders for your business and receptionist name")}
          </p>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? t("common.saving") : t("settings.saveReceptionist")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div>
      <label className="mb-1 block font-medium text-foreground text-sm">
        {label}
      </label>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
        max={5}
        min={1}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        step={1}
        type="range"
        value={value}
      />
      <div className="mt-1 flex justify-between text-muted-foreground text-xs">
        <span>{lowLabel}</span>
        <span className="font-medium text-foreground">{value} / 5</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 hover:bg-muted">
      <div>
        <span className="font-medium text-foreground text-sm">{label}</span>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <button
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
