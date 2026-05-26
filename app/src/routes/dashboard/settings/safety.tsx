import { AlertCircle, AlertTriangle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../services/api-client";

interface SafetySettings {
  emergencyEscalationInstructions: string;
  sensitiveTopics: string;
}

interface EscalationRecord {
  customerPhone: string;
  escalatedAt: string;
  id: string;
  resolvedAt: string | null;
  status: "active" | "resolved";
  trigger: string;
}

const DEFAULT_SETTINGS: SafetySettings = {
  sensitiveTopics: "",
  emergencyEscalationInstructions: "",
};

export default function SafetySettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SafetySettings>(DEFAULT_SETTINGS);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null);
        const [settingsData, escalationData] = await Promise.all([
          apiFetch<SafetySettings>("/settings/safety").catch(() => null),
          apiFetch<EscalationRecord[]>("/settings/safety/escalations").catch(
            () => []
          ),
        ]);
        if (settingsData) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
        }
        if (Array.isArray(escalationData)) {
          setEscalations(escalationData);
        }
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
      await apiFetch("/settings/safety", {
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

  function updateField<K extends keyof SafetySettings>(
    key: K,
    value: SafetySettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-bold text-2xl text-foreground">
          <Shield size={24} />
          {t("settings.title")}
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

      <div className="mb-6 space-y-6 rounded-lg border border-border bg-card p-6">
        {/* Sensitive Topics */}
        <div>
          <label className="mb-1 block font-medium text-foreground text-sm">
            Sensitive topics
          </label>
          <textarea
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => updateField("sensitiveTopics", e.target.value)}
            placeholder="e.g., medical advice, pricing disputes, legal matters, refunds over $500"
            rows={4}
            value={settings.sensitiveTopics}
          />
          <p className="mt-1 text-muted-foreground text-xs">
            Comma-separated list of topics the AI should flag for human review.
            The receptionist will pause and escalate when these are detected.
          </p>
        </div>

        {/* Emergency Escalation */}
        <div>
          <label className="mb-1 block font-medium text-foreground text-sm">
            Emergency escalation instructions
          </label>
          <textarea
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) =>
              updateField("emergencyEscalationInstructions", e.target.value)
            }
            placeholder="e.g., Forward urgent messages to +1-555-0123. For medical emergencies, advise calling 911 immediately."
            rows={4}
            value={settings.emergencyEscalationInstructions}
          />
          <p className="mt-1 text-muted-foreground text-xs">
            Instructions the AI follows when a conversation needs immediate
            human attention
          </p>
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

      {/* Escalation History */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground text-lg">
          <AlertTriangle className="text-amber-500" size={18} />
          Escalation History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="pb-3 font-medium text-foreground">Trigger</th>
                <th className="pb-3 font-medium text-foreground">Customer</th>
                <th className="pb-3 font-medium text-foreground">Escalated</th>
                <th className="pb-3 font-medium text-foreground">
                  {t("receptionist.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {escalations.length === 0 ? (
                <tr>
                  <td
                    className="py-8 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    <Shield className="mx-auto mb-2 opacity-40" size={32} />
                    {t("common.noResults")}
                  </td>
                </tr>
              ) : (
                escalations.map((record) => (
                  <tr className="border-border border-b" key={record.id}>
                    <td className="max-w-xs truncate py-3 text-foreground">
                      {record.trigger}
                    </td>
                    <td className="py-3 font-mono text-muted-foreground text-xs">
                      {record.customerPhone}
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {new Date(record.escalatedAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <EscalationBadge status={record.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EscalationBadge({ status }: { status: EscalationRecord["status"] }) {
  const styles: Record<EscalationRecord["status"], string> = {
    active: "bg-amber-500/10 text-amber-600",
    resolved: "bg-emerald-500/10 text-emerald-600",
  };
  const labels: Record<EscalationRecord["status"], string> = {
    active: "Active",
    resolved: "Resolved",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
