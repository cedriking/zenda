import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { Shield, AlertCircle, AlertTriangle } from 'lucide-react'

interface SafetySettings {
  sensitiveTopics: string
  emergencyEscalationInstructions: string
}

interface EscalationRecord {
  id: string
  trigger: string
  customerPhone: string
  escalatedAt: string
  resolvedAt: string | null
  status: 'active' | 'resolved'
}

const DEFAULT_SETTINGS: SafetySettings = {
  sensitiveTopics: '',
  emergencyEscalationInstructions: '',
}

export default function SafetySettingsPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<SafetySettings>(DEFAULT_SETTINGS)
  const [escalations, setEscalations] = useState<EscalationRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null)
        const [settingsData, escalationData] = await Promise.all([
          apiFetch<SafetySettings>('/settings/safety').catch(() => null),
          apiFetch<EscalationRecord[]>('/settings/safety/escalations').catch(() => []),
        ])
        if (settingsData) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsData })
        }
        if (Array.isArray(escalationData)) {
          setEscalations(escalationData)
        }
      } catch {
        setLoadError(t('settings.errorLoad'))
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await apiFetch('/settings/safety', {
        method: 'PATCH',
        body: settings,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('settings.errorSave'))
    } finally {
      setSaving(false)
    }
  }

  function updateField<K extends keyof SafetySettings>(key: K, value: SafetySettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield size={24} />
          {t('settings.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('settings.description')}
        </p>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-600 flex items-center gap-2">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      {saveError && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600">
          {t('settings.saved')}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border p-6 space-y-6 mb-6">
        {/* Sensitive Topics */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Sensitive topics
          </label>
          <textarea
            value={settings.sensitiveTopics}
            onChange={e => updateField('sensitiveTopics', e.target.value)}
            rows={4}
            placeholder="e.g., medical advice, pricing disputes, legal matters, refunds over $500"
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Comma-separated list of topics the AI should flag for human review. The receptionist will pause and escalate when these are detected.
          </p>
        </div>

        {/* Emergency Escalation */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Emergency escalation instructions
          </label>
          <textarea
            value={settings.emergencyEscalationInstructions}
            onChange={e => updateField('emergencyEscalationInstructions', e.target.value)}
            rows={4}
            placeholder="e.g., Forward urgent messages to +1-555-0123. For medical emergencies, advise calling 911 immediately."
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Instructions the AI follows when a conversation needs immediate human attention
          </p>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? t('common.saving') : t('settings.save')}
          </button>
        </div>
      </div>

      {/* Escalation History */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          Escalation History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 font-medium text-foreground">Trigger</th>
                <th className="pb-3 font-medium text-foreground">Customer</th>
                <th className="pb-3 font-medium text-foreground">Escalated</th>
                <th className="pb-3 font-medium text-foreground">{t('receptionist.status')}</th>
              </tr>
            </thead>
            <tbody>
              {escalations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    <Shield size={32} className="mx-auto mb-2 opacity-40" />
                    {t('common.noResults')}
                  </td>
                </tr>
              ) : (
                escalations.map(record => (
                  <tr key={record.id} className="border-b border-border">
                    <td className="py-3 text-foreground max-w-xs truncate">{record.trigger}</td>
                    <td className="py-3 text-muted-foreground font-mono text-xs">{record.customerPhone}</td>
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
  )
}

function EscalationBadge({ status }: { status: EscalationRecord['status'] }) {
  const styles: Record<EscalationRecord['status'], string> = {
    active: 'bg-amber-500/10 text-amber-600',
    resolved: 'bg-emerald-500/10 text-emerald-600',
  }
  const labels: Record<EscalationRecord['status'], string> = {
    active: 'Active',
    resolved: 'Resolved',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
