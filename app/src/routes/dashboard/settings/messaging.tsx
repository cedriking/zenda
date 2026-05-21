import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { MessageSquare, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings/messaging')({
  component: MessagingSettingsPage,
})

interface MessagingSettings {
  maxOutboundWithoutReply: number
  maxRemindersPerAppointment: number
}

interface ConsentRecord {
  id: string
  customerPhone: string
  customerName: string
  status: 'opted_in' | 'opted_out' | 'pending'
  consentedAt: string | null
}

const DEFAULT_SETTINGS: MessagingSettings = {
  maxOutboundWithoutReply: 3,
  maxRemindersPerAppointment: 2,
}

function MessagingSettingsPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<MessagingSettings>(DEFAULT_SETTINGS)
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null)
        const [settingsData, consentData] = await Promise.all([
          apiFetch<MessagingSettings>('/settings/messaging').catch(() => null),
          apiFetch<ConsentRecord[]>('/settings/messaging/consent').catch(() => []),
        ])
        if (settingsData) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsData })
        }
        if (Array.isArray(consentData)) {
          setConsentRecords(consentData)
        }
      } catch {
        setLoadError(t('settings.errorLoad'))
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (settings.maxOutboundWithoutReply < 1 || settings.maxOutboundWithoutReply > 10) {
      setSaveError('Max outbound messages must be between 1 and 10')
      return
    }
    if (settings.maxRemindersPerAppointment < 0 || settings.maxRemindersPerAppointment > 5) {
      setSaveError('Max reminders must be between 0 and 5')
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await apiFetch('/settings/messaging', {
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

  function updateField<K extends keyof MessagingSettings>(key: K, value: MessagingSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare size={24} />
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

      {/* Messaging Limits */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Messaging Limits</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Max outbound messages without reply
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.maxOutboundWithoutReply}
              onChange={e => updateField('maxOutboundWithoutReply', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Stop sending messages after this many unanswered outbound messages
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Max reminders per appointment
            </label>
            <input
              type="number"
              min={0}
              max={5}
              value={settings.maxRemindersPerAppointment}
              onChange={e => updateField('maxRemindersPerAppointment', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum reminder messages sent for each upcoming appointment
            </p>
          </div>
        </div>

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

      {/* Consent Status */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Consent Status Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 font-medium text-foreground">Customer</th>
                <th className="pb-3 font-medium text-foreground">Phone</th>
                <th className="pb-3 font-medium text-foreground">{t('receptionist.status')}</th>
                <th className="pb-3 font-medium text-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {consentRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t('common.noResults')}
                  </td>
                </tr>
              ) : (
                consentRecords.map(record => (
                  <tr key={record.id} className="border-b border-border">
                    <td className="py-3 text-foreground">{record.customerName || 'Unknown'}</td>
                    <td className="py-3 text-muted-foreground font-mono text-xs">{record.customerPhone}</td>
                    <td className="py-3">
                      <ConsentBadge status={record.status} />
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {record.consentedAt ? new Date(record.consentedAt).toLocaleDateString() : '--'}
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

function ConsentBadge({ status }: { status: ConsentRecord['status'] }) {
  const styles: Record<ConsentRecord['status'], string> = {
    opted_in: 'bg-emerald-500/10 text-emerald-600',
    opted_out: 'bg-destructive/10 text-destructive',
    pending: 'bg-amber-500/10 text-amber-600',
  }
  const labels: Record<ConsentRecord['status'], string> = {
    opted_in: 'Opted In',
    opted_out: 'Opted Out',
    pending: 'Pending',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
