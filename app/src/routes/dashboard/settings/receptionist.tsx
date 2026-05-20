import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api-client'
import { Bot, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings/receptionist')({
  component: ReceptionistSettingsPage,
})

type PersonalityPreset = 'Professional' | 'Warm' | 'Minimal' | 'Premium' | 'Friendly'

interface ReceptionistSettings {
  personalityPreset: PersonalityPreset
  formalityLevel: number
  concisenessLevel: number
  warmthLevel: number
  useEmoji: boolean
  speaksAsBusiness: boolean
  proactivelySuggestTimes: boolean
  confirmsBeforeBooking: boolean
  greetingStyle: string
}

const DEFAULT_SETTINGS: ReceptionistSettings = {
  personalityPreset: 'Professional',
  formalityLevel: 3,
  concisenessLevel: 3,
  warmthLevel: 3,
  useEmoji: false,
  speaksAsBusiness: true,
  proactivelySuggestTimes: true,
  confirmsBeforeBooking: true,
  greetingStyle: '',
}

const PERSONALITY_PRESETS: PersonalityPreset[] = ['Professional', 'Warm', 'Minimal', 'Premium', 'Friendly']

function ReceptionistSettingsPage() {
  const [settings, setSettings] = useState<ReceptionistSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null)
        const data = await apiFetch<ReceptionistSettings>('/settings/receptionist')
        setSettings({ ...DEFAULT_SETTINGS, ...data })
      } catch {
        setLoadError('Failed to load receptionist settings. Using defaults.')
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await apiFetch('/settings/receptionist', {
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

  function updateField<K extends keyof ReceptionistSettings>(key: K, value: ReceptionistSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Bot size={24} />
          AI Receptionist Personality
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure how your AI receptionist communicates with customers
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
          Receptionist settings saved successfully.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {/* Personality Preset */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Personality Preset</legend>
          <div className="flex flex-wrap gap-3">
            {PERSONALITY_PRESETS.map(preset => (
              <label
                key={preset}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  settings.personalityPreset === preset
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="personalityPreset"
                  value={preset}
                  checked={settings.personalityPreset === preset}
                  onChange={() => updateField('personalityPreset', preset)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{preset}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Level Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SliderField
            label="Formality"
            value={settings.formalityLevel}
            onChange={v => updateField('formalityLevel', v)}
            lowLabel="Casual"
            highLabel="Formal"
          />
          <SliderField
            label="Conciseness"
            value={settings.concisenessLevel}
            onChange={v => updateField('concisenessLevel', v)}
            lowLabel="Detailed"
            highLabel="Brief"
          />
          <SliderField
            label="Warmth"
            value={settings.warmthLevel}
            onChange={v => updateField('warmthLevel', v)}
            lowLabel="Reserved"
            highLabel="Warm"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <ToggleField
            label="Use emoji in messages"
            description="Allow the receptionist to include emoji for a friendlier tone"
            checked={settings.useEmoji}
            onChange={v => updateField('useEmoji', v)}
          />
          <ToggleField
            label="Speak as the business"
            description="Use 'we' instead of 'I' to represent the business collectively"
            checked={settings.speaksAsBusiness}
            onChange={v => updateField('speaksAsBusiness', v)}
          />
          <ToggleField
            label="Proactively suggest times"
            description="Offer available time slots without waiting for the customer to ask"
            checked={settings.proactivelySuggestTimes}
            onChange={v => updateField('proactivelySuggestTimes', v)}
          />
          <ToggleField
            label="Confirm before booking"
            description="Always ask for explicit confirmation before finalizing an appointment"
            checked={settings.confirmsBeforeBooking}
            onChange={v => updateField('confirmsBeforeBooking', v)}
          />
        </div>

        {/* Greeting Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Greeting Style
          </label>
          <input
            type="text"
            value={settings.greetingStyle}
            onChange={e => updateField('greetingStyle', e.target.value)}
            placeholder="e.g., Hi! Welcome to {business}. I'm {name}, how can I help?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use {'{business}'} and {'{name}'} as placeholders for your business and receptionist name
          </p>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Receptionist Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SliderField({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  lowLabel: string
  highLabel: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{lowLabel}</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">{value} / 5</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
      <div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  )
}
