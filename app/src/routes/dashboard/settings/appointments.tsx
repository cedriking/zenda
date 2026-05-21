import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { Calendar, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings/appointments')({
  component: AppointmentSettingsPage,
})

type CancellationStrictness = 'flexible' | 'moderate' | 'strict'

interface AppointmentSettings {
  cancellationWindowHours: number
  reschedulingWindowHours: number
  cancellationPolicyStrictness: CancellationStrictness
  depositRequired: boolean
  depositAmountCents: number
  approvedCancellationText: string
  approvedRefundText: string
}

const DEFAULT_SETTINGS: AppointmentSettings = {
  cancellationWindowHours: 24,
  reschedulingWindowHours: 12,
  cancellationPolicyStrictness: 'moderate',
  depositRequired: false,
  depositAmountCents: 0,
  approvedCancellationText: '',
  approvedRefundText: '',
}

function AppointmentSettingsPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<AppointmentSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null)
        const data = await apiFetch<AppointmentSettings>('/settings/appointments')
        setSettings({ ...DEFAULT_SETTINGS, ...data })
      } catch {
        setLoadError(t('settings.errorLoad'))
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (settings.cancellationWindowHours < 0) {
      setSaveError('Cancellation window must be 0 or more hours')
      return
    }
    if (settings.reschedulingWindowHours < 0) {
      setSaveError('Rescheduling window must be 0 or more hours')
      return
    }
    if (settings.depositRequired && settings.depositAmountCents <= 0) {
      setSaveError('Deposit amount must be greater than 0 when deposits are required')
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await apiFetch('/settings/appointments', {
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

  function updateField<K extends keyof AppointmentSettings>(key: K, value: AppointmentSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calendar size={24} />
          {t('settings.cancellationPolicy')}
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

      <div className="bg-card rounded-lg border border-border p-6 space-y-6">
        {/* Window Settings */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Cancellation & Rescheduling Windows</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Cancellation window (hours)
              </label>
              <input
                type="number"
                min={0}
                value={settings.cancellationWindowHours}
                onChange={e => updateField('cancellationWindowHours', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum hours before an appointment that cancellation is allowed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Rescheduling window (hours)
              </label>
              <input
                type="number"
                min={0}
                value={settings.reschedulingWindowHours}
                onChange={e => updateField('reschedulingWindowHours', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum hours before an appointment that rescheduling is allowed
              </p>
            </div>
          </div>
        </div>

        {/* Policy Strictness */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Cancellation policy strictness
          </label>
          <select
            value={settings.cancellationPolicyStrictness}
            onChange={e => updateField('cancellationPolicyStrictness', e.target.value as CancellationStrictness)}
            className="w-full max-w-xs px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
          >
            <option value="flexible">Flexible</option>
            <option value="moderate">Moderate</option>
            <option value="strict">Strict</option>
          </select>
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium text-foreground">Flexible:</span> Customers can cancel anytime with a full refund</p>
            <p><span className="font-medium text-foreground">Moderate:</span> Cancellations within the window may incur a partial charge</p>
            <p><span className="font-medium text-foreground">Strict:</span> No refunds for cancellations within the window</p>
          </div>
        </div>

        {/* Deposit */}
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">Require deposit</span>
              <p className="text-xs text-muted-foreground">Charge a deposit when customers book appointments</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.depositRequired}
              onClick={() => updateField('depositRequired', !settings.depositRequired)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.depositRequired ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.depositRequired ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {settings.depositRequired && (
            <div className="pl-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Deposit amount ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={settings.depositAmountCents / 100}
                onChange={e => updateField('depositAmountCents', Math.round(parseFloat(e.target.value) * 100) || 0)}
                placeholder="0.00"
                className="w-full max-w-xs px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              />
            </div>
          )}
        </div>

        {/* Policy Texts */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">Customer-Facing Policy Text</h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Approved cancellation message
            </label>
            <textarea
              value={settings.approvedCancellationText}
              onChange={e => updateField('approvedCancellationText', e.target.value)}
              rows={3}
              placeholder="e.g., Your appointment has been cancelled. We hope to see you again soon!"
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Message sent to the customer when their cancellation is approved
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Approved refund message
            </label>
            <textarea
              value={settings.approvedRefundText}
              onChange={e => updateField('approvedRefundText', e.target.value)}
              rows={3}
              placeholder="e.g., A refund of {amount} has been issued and will appear in 3-5 business days."
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Message sent when a refund is approved. Use {'{amount}'} as a placeholder for the refund value
            </p>
          </div>
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
    </div>
  )
}
