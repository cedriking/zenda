import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api-client'
import { Shield, AlertCircle, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings/safety')({
  component: SafetySettingsPage,
})

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

function SafetySettingsPage() {
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
        setLoadError('Failed to load safety settings. Using defaults.')
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
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings')
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Shield size={24} />
          Safety Configuration
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Define sensitive topics and emergency escalation procedures
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
          Safety settings saved successfully.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 mb-6">
        {/* Sensitive Topics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sensitive topics
          </label>
          <textarea
            value={settings.sensitiveTopics}
            onChange={e => updateField('sensitiveTopics', e.target.value)}
            rows={4}
            placeholder="e.g., medical advice, pricing disputes, legal matters, refunds over $500"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Comma-separated list of topics the AI should flag for human review. The receptionist will pause and escalate when these are detected.
          </p>
        </div>

        {/* Emergency Escalation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Emergency escalation instructions
          </label>
          <textarea
            value={settings.emergencyEscalationInstructions}
            onChange={e => updateField('emergencyEscalationInstructions', e.target.value)}
            rows={4}
            placeholder="e.g., Forward urgent messages to +1-555-0123. For medical emergencies, advise calling 911 immediately."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Instructions the AI follows when a conversation needs immediate human attention
          </p>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Safety Settings'}
          </button>
        </div>
      </div>

      {/* Escalation History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-yellow-500" />
          Escalation History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Trigger</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Customer</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Escalated</th>
                <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {escalations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-gray-500">
                    <Shield size={32} className="mx-auto mb-2 opacity-40" />
                    No escalations recorded yet. The AI will flag conversations matching your sensitive topics here.
                  </td>
                </tr>
              ) : (
                escalations.map(record => (
                  <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 text-gray-900 dark:text-gray-100 max-w-xs truncate">{record.trigger}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{record.customerPhone}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 text-xs">
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
    active: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
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
