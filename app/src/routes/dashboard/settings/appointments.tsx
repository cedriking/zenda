import { AlertCircle, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../services/api-client";

type CancellationStrictness = "flexible" | "moderate" | "strict";
interface AppointmentSettings {
  approvedCancellationText: string;
  approvedRefundText: string;
  cancellationPolicyStrictness: CancellationStrictness;
  cancellationWindowHours: number;
  depositAmountCents: number;
  depositRequired: boolean;
  reschedulingWindowHours: number;
}

const DEFAULT_SETTINGS: AppointmentSettings = {
  cancellationWindowHours: 24,
  reschedulingWindowHours: 12,
  cancellationPolicyStrictness: "moderate",
  depositRequired: false,
  depositAmountCents: 0,
  approvedCancellationText: "",
  approvedRefundText: "",
};

export default function AppointmentSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] =
    useState<AppointmentSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null);
        const data = await apiFetch<AppointmentSettings>(
          "/settings/appointments"
        );
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      } catch {
        setLoadError(t("settings.errorLoad"));
      }
    }
    load();
  }, [t]);

  async function handleSave() {
    if (settings.cancellationWindowHours < 0) {
      setSaveError(t("settings.appointments.errors.cancellationWindow", "Cancellation window must be 0 or more hours"));
      return;
    }
    if (settings.reschedulingWindowHours < 0) {
      setSaveError(t("settings.appointments.errors.reschedulingWindow", "Rescheduling window must be 0 or more hours"));
      return;
    }
    if (settings.depositRequired && settings.depositAmountCents <= 0) {
      setSaveError(
        t("settings.appointments.errors.depositAmount", "Deposit amount must be greater than 0 when deposits are required")
      );
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await apiFetch("/settings/appointments", {
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

  function updateField<K extends keyof AppointmentSettings>(
    key: K,
    value: AppointmentSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-bold text-2xl text-foreground">
          <Calendar size={24} />
          {t("settings.cancellationPolicy")}
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
        {/* Window Settings */}
        <div>
          <h3 className="mb-4 font-semibold text-base text-foreground">
            {t("settings.appointments.windowsTitle", "Cancellation & Rescheduling Windows")}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-foreground text-sm">
                {t("settings.appointments.cancellationWindowLabel", "Cancellation window (hours)")}
              </label>
              <input
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                min={0}
                onChange={(e) =>
                  updateField(
                    "cancellationWindowHours",
                    Number.parseInt(e.target.value, 10) || 0
                  )
                }
                type="number"
                value={settings.cancellationWindowHours}
              />
              <p className="mt-1 text-muted-foreground text-xs">
                {t("settings.appointments.cancellationWindowDesc", "Minimum hours before an appointment that cancellation is allowed")}
              </p>
            </div>

            <div>
              <label className="mb-1 block font-medium text-foreground text-sm">
                {t("settings.appointments.reschedulingWindowLabel", "Rescheduling window (hours)")}
              </label>
              <input
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                min={0}
                onChange={(e) =>
                  updateField(
                    "reschedulingWindowHours",
                    Number.parseInt(e.target.value, 10) || 0
                  )
                }
                type="number"
                value={settings.reschedulingWindowHours}
              />
              <p className="mt-1 text-muted-foreground text-xs">
                {t("settings.appointments.reschedulingWindowDesc", "Minimum hours before an appointment that rescheduling is allowed")}
              </p>
            </div>
          </div>
        </div>

        {/* Policy Strictness */}
        <div>
          <label className="mb-1 block font-medium text-foreground text-sm">
            {t("settings.appointments.policyStrictnessLabel", "Cancellation policy strictness")}
          </label>
          <select
            className="w-full max-w-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) =>
              updateField(
                "cancellationPolicyStrictness",
                e.target.value as CancellationStrictness
              )
            }
            value={settings.cancellationPolicyStrictness}
          >
            <option value="flexible">{t("settings.appointments.flexible", "Flexible")}</option>
            <option value="moderate">{t("settings.appointments.moderate", "Moderate")}</option>
            <option value="strict">{t("settings.appointments.strict", "Strict")}</option>
          </select>
          <div className="mt-2 space-y-1 text-muted-foreground text-xs">
            <p>
              <span className="font-medium text-foreground">{t("settings.appointments.flexible", "Flexible")}:</span>{" "}
              {t("settings.appointments.flexibleDesc", "Customers can cancel anytime with a full refund")}
            </p>
            <p>
              <span className="font-medium text-foreground">{t("settings.appointments.moderate", "Moderate")}:</span>{" "}
              {t("settings.appointments.moderateDesc", "Cancellations within the window may incur a partial charge")}
            </p>
            <p>
              <span className="font-medium text-foreground">{t("settings.appointments.strict", "Strict")}:</span>{" "}
              {t("settings.appointments.strictDesc", "No refunds for cancellations within the window")}
            </p>
          </div>
        </div>

        {/* Deposit */}
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 hover:bg-muted">
            <div>
              <span className="font-medium text-foreground text-sm">
                {t("settings.appointments.requireDeposit", "Require deposit")}
              </span>
              <p className="text-muted-foreground text-xs">
                {t("settings.appointments.requireDepositDesc", "Charge a deposit when customers book appointments")}
              </p>
            </div>
            <button
              aria-checked={settings.depositRequired}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.depositRequired ? "bg-primary" : "bg-muted"
              }`}
              onClick={() =>
                updateField("depositRequired", !settings.depositRequired)
              }
              role="switch"
              type="button"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.depositRequired ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          {settings.depositRequired && (
            <div className="pl-4">
              <label className="mb-1 block font-medium text-foreground text-sm">
                {t("settings.appointments.depositAmountLabel", "Deposit amount ($)")}
              </label>
              <input
                className="w-full max-w-xs rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                min={0}
                onChange={(e) =>
                  updateField(
                    "depositAmountCents",
                    Math.round(Number.parseFloat(e.target.value) * 100) || 0
                  )
                }
                placeholder="0.00"
                step={0.01}
                type="number"
                value={settings.depositAmountCents / 100}
              />
            </div>
          )}
        </div>

        {/* Policy Texts */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base text-foreground">
            {t("settings.appointments.policyTextTitle", "Customer-Facing Policy Text")}
          </h3>

          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("settings.appointments.cancellationMessageLabel", "Approved cancellation message")}
            </label>
            <textarea
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                updateField("approvedCancellationText", e.target.value)
              }
              placeholder={t("settings.appointments.cancellationMessagePlaceholder", "e.g., Your appointment has been cancelled. We hope to see you again soon!")}
              rows={3}
              value={settings.approvedCancellationText}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              {t("settings.appointments.cancellationMessageDesc", "Message sent to the customer when their cancellation is approved")}
            </p>
          </div>

          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("settings.appointments.refundMessageLabel", "Approved refund message")}
            </label>
            <textarea
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                updateField("approvedRefundText", e.target.value)
              }
              placeholder={t("settings.appointments.refundMessagePlaceholder", "e.g., A refund of {amount} has been issued and will appear in 3-5 business days.")}
              rows={3}
              value={settings.approvedRefundText}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              {t("settings.appointments.refundMessageDesc", "Message sent when a refund is approved. Use {{amount}} as a placeholder for the refund value")}
            </p>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? t("common.saving") : t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
