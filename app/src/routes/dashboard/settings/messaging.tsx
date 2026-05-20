import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
        setLoadError('Failed to load messaging settings. Using defaults.')
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
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings')
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare size={24} />
          Messaging Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure messaging limits and consent management
        </p>
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      {saveError && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
          Messaging settings saved successfully.
        </div>
      )}

      {/* Messaging Limits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messaging Limits</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max outbound messages without reply
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.maxOutboundWithoutReply}
              onChange={e => updateField('maxOutboundWithoutReply', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stop sending messages after this many unanswered outbound messages
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max reminders per appointment
            </label>
            <input
              type="number"
              min={0}
              max={5}
              value={settings.maxRemindersPerAppointment}
              onChange={e => updateField('maxRemindersPerAppointment', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum reminder messages sent for each upcoming appointment
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Messaging Settings'}
          </button>
        </div>
      </div>

      {/* Consent Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Consent Status Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Customer</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Phone</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {consentRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-gray-500">
                    No consent records yet. Records will appear as customers interact with your receptionist.
                  </td>
                </tr>
              ) : (
                consentRecords.map(record => (
                  <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 text-gray-900 dark:text-gray-100">{record.customerName || 'Unknown'}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{record.customerPhone}</td>
                    <td className="py-3">
                      <ConsentBadge status={record.status} />
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 text-xs">
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
    opted_in: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    opted_out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
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
