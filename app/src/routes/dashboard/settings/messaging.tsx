import { AlertCircle, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../services/api-client";

interface MessagingSettings {
  maxOutboundWithoutReply: number;
  maxRemindersPerAppointment: number;
}

interface ConsentRecord {
  consentedAt: string | null;
  customerName: string;
  customerPhone: string;
  id: string;
  status: "opted_in" | "opted_out" | "pending";
}

const DEFAULT_SETTINGS: MessagingSettings = {
  maxOutboundWithoutReply: 3,
  maxRemindersPerAppointment: 2,
};

export default function MessagingSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<MessagingSettings>(DEFAULT_SETTINGS);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null);
        const [settingsData, consentData] = await Promise.all([
          apiFetch<MessagingSettings>("/settings/messaging").catch(() => null),
          apiFetch<ConsentRecord[]>("/settings/messaging/consent").catch(
            () => []
          ),
        ]);
        if (settingsData) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
        }
        if (Array.isArray(consentData)) {
          setConsentRecords(consentData);
        }
      } catch {
        setLoadError(t("settings.errorLoad"));
      }
    }
    load();
  }, [t]);

  async function handleSave() {
    if (
      settings.maxOutboundWithoutReply < 1 ||
      settings.maxOutboundWithoutReply > 10
    ) {
      setSaveError(
        t(
          "settings.messaging.errors.maxOutbound",
          "Max outbound messages must be between 1 and 10"
        )
      );
      return;
    }
    if (
      settings.maxRemindersPerAppointment < 0 ||
      settings.maxRemindersPerAppointment > 5
    ) {
      setSaveError(
        t(
          "settings.messaging.errors.maxReminders",
          "Max reminders must be between 0 and 5"
        )
      );
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await apiFetch("/settings/messaging", {
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

  function updateField<K extends keyof MessagingSettings>(
    key: K,
    value: MessagingSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-bold text-2xl text-foreground">
          <MessageSquare size={24} />
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

      {/* Messaging Limits */}
      <div className="mb-6 space-y-4 rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground text-lg">
          {t("settings.messaging.limitsTitle", "Messaging Limits")}
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t(
                "settings.messaging.maxOutboundLabel",
                "Max outbound messages without reply"
              )}
            </label>
            <input
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              max={10}
              min={1}
              onChange={(e) =>
                updateField(
                  "maxOutboundWithoutReply",
                  Number.parseInt(e.target.value, 10) || 1
                )
              }
              type="number"
              value={settings.maxOutboundWithoutReply}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              {t(
                "settings.messaging.maxOutboundDesc",
                "Stop sending messages after this many unanswered outbound messages"
              )}
            </p>
          </div>

          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t(
                "settings.messaging.maxRemindersLabel",
                "Max reminders per appointment"
              )}
            </label>
            <input
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              max={5}
              min={0}
              onChange={(e) =>
                updateField(
                  "maxRemindersPerAppointment",
                  Number.parseInt(e.target.value, 10) || 0
                )
              }
              type="number"
              value={settings.maxRemindersPerAppointment}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              {t(
                "settings.messaging.maxRemindersDesc",
                "Maximum reminder messages sent for each upcoming appointment"
              )}
            </p>
          </div>
        </div>

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

      {/* Consent Status */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold text-foreground text-lg">
          {t("settings.messaging.consentTitle", "Consent Status Overview")}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="pb-3 font-medium text-foreground">
                  {t("settings.messaging.tableCustomer", "Customer")}
                </th>
                <th className="pb-3 font-medium text-foreground">
                  {t("settings.messaging.tablePhone", "Phone")}
                </th>
                <th className="pb-3 font-medium text-foreground">
                  {t("receptionist.status")}
                </th>
                <th className="pb-3 font-medium text-foreground">
                  {t("settings.messaging.tableDate", "Date")}
                </th>
              </tr>
            </thead>
            <tbody>
              {consentRecords.length === 0 ? (
                <tr>
                  <td
                    className="py-8 text-center text-muted-foreground"
                    colSpan={4}
                  >
                    {t("common.noResults")}
                  </td>
                </tr>
              ) : (
                consentRecords.map((record) => (
                  <tr className="border-border border-b" key={record.id}>
                    <td className="py-3 text-foreground">
                      {record.customerName || t("common.unknown", "Unknown")}
                    </td>
                    <td className="py-3 font-mono text-muted-foreground text-xs">
                      {record.customerPhone}
                    </td>
                    <td className="py-3">
                      <ConsentBadge status={record.status} />
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {record.consentedAt
                        ? new Date(record.consentedAt).toLocaleDateString()
                        : "--"}
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

function ConsentBadge({ status }: { status: ConsentRecord["status"] }) {
  const { t } = useTranslation();
  const styles: Record<ConsentRecord["status"], string> = {
    opted_in: "bg-emerald-500/10 text-emerald-600",
    opted_out: "bg-destructive/10 text-destructive",
    pending: "bg-amber-500/10 text-amber-600",
  };
  const labels: Record<ConsentRecord["status"], string> = {
    opted_in: t("settings.messaging.optedIn", "Opted In"),
    opted_out: t("settings.messaging.optedOut", "Opted Out"),
    pending: t("settings.messaging.pending", "Pending"),
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
