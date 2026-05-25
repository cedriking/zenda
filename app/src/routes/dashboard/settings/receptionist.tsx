import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { Bot, AlertCircle } from 'lucide-react'

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

export default function ReceptionistSettingsPage() {
  const { t } = useTranslation()
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
      await apiFetch('/settings/receptionist', {
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

  function updateField<K extends keyof ReceptionistSettings>(key: K, value: ReceptionistSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot size={24} />
          {t('receptionist.settings')}
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
        {/* Personality Preset */}
        <fieldset>
          <legend className="block text-sm font-medium text-foreground mb-3">{t('settings.tone')}</legend>
          <div className="flex flex-wrap gap-3">
            {PERSONALITY_PRESETS.map(preset => (
              <label
                key={preset}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  settings.personalityPreset === preset
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border text-foreground hover:bg-muted'
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
                <span className="text-sm font-medium">
                  {preset === 'Professional' ? t('settings.toneProfessional')
                    : preset === 'Warm' ? t('settings.toneWarm')
                    : preset === 'Friendly' ? t('settings.toneFriendly')
                    : preset}
                </span>
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
            lowLabel={t('settings.toneCasual')}
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
            highLabel={t('settings.toneWarm')}
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
          <label className="block text-sm font-medium text-foreground mb-1">
            {t('settings.greetingTemplate')}
          </label>
          <input
            type="text"
            value={settings.greetingStyle}
            onChange={e => updateField('greetingStyle', e.target.value)}
            placeholder={t('settings.greetingPlaceholder')}
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use {'{business}'} and {'{name}'} as placeholders for your business and receptionist name
          </p>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? t('common.saving') : t('settings.saveReceptionist')}
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
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{lowLabel}</span>
        <span className="font-medium text-foreground">{value} / 5</span>
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
    <label className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted cursor-pointer">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
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
