import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { Settings as SettingsIcon, Building2, Bot, Clock, Wrench, AlertCircle, Eye } from 'lucide-react'
import LangToggle from '@/components/lang-toggle'

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
})

type TabId = 'business' | 'receptionist' | 'services' | 'availability'

function SettingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabId>('business')
  const [businessProfile, setBusinessProfile] = useState<Record<string, any>>({})
  const [receptionistProfile, setReceptionistProfile] = useState<Record<string, any>>({})
  const [lastSavedBusiness, setLastSavedBusiness] = useState<Record<string, any> | null>(null)
  const [lastSavedReceptionist, setLastSavedReceptionist] = useState<Record<string, any> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null)
        const [biz, rec] = await Promise.all([
          apiFetch('/business/profile'),
          apiFetch('/business/receptionist'),
        ])
        setBusinessProfile(biz as any)
        setReceptionistProfile(rec as any)
        setLastSavedBusiness(biz as any)
        setLastSavedReceptionist(rec as any)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : t('settings.errorLoad'))
      }
    }
    load()
  }, [t])

  const handleSave = async (endpoint: string, data: Record<string, any>) => {
    if (endpoint === '/business/profile') {
      if (!data.name?.trim()) {
        setSaveError(t('settings.businessName') + ' is required')
        return
      }
    }
    if (endpoint === '/business/receptionist') {
      if (!data.name?.trim()) {
        setSaveError(t('settings.receptionistName') + ' is required')
        return
      }
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await apiFetch(endpoint, {
        method: 'PATCH',
        body: data,
      })

      if (endpoint === '/business/profile') {
        setLastSavedBusiness({ ...data })
      } else if (endpoint === '/business/receptionist') {
        setLastSavedReceptionist({ ...data })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('settings.errorSave')
      setSaveError(message)

      if (endpoint === '/business/profile' && lastSavedBusiness) {
        setBusinessProfile({ ...lastSavedBusiness })
      } else if (endpoint === '/business/receptionist' && lastSavedReceptionist) {
        setReceptionistProfile({ ...lastSavedReceptionist })
      }
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'business' as const, label: t('settings.tabBusiness'), icon: <Building2 size={16} /> },
    { id: 'receptionist' as const, label: t('settings.tabReceptionist'), icon: <Bot size={16} /> },
    { id: 'services' as const, label: t('settings.tabServices'), icon: <Wrench size={16} /> },
    { id: 'availability' as const, label: t('settings.tabAvailability'), icon: <Clock size={16} /> },
  ]

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(t => t.id === tab)
    let nextIndex: number
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (currentIndex + 1) % tabs.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = tabs.length - 1
    } else {
      return
    }
    setTab(tabs[nextIndex].id)
    const tabButtons = document.querySelectorAll<HTMLElement>('[role="tab"]')
    tabButtons[nextIndex]?.focus()
  }, [tab, tabs])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t('settings.heading')}</h2>
        <LangToggle />
      </div>

      {loadError && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      <div className="flex gap-2 mb-6" role="tablist" aria-label="Settings sections" onKeyDown={handleTabKeyDown}>
        {tabs.map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600">
          {t('settings.saved')}
        </div>
      )}

      {tab === 'business' && (
        <div id="panel-business" role="tabpanel" aria-labelledby="tab-business" className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.businessName')}</label>
            <input
              type="text"
              value={businessProfile.name ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.category')}</label>
            <select
              value={businessProfile.category ?? 'other'}
              onChange={(e) => setBusinessProfile({ ...businessProfile, category: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            >
              <option value="beauty">{t('settings.categoryBeauty')}</option>
              <option value="wellness">{t('settings.categoryWellness')}</option>
              <option value="health">{t('settings.categoryHealth')}</option>
              <option value="coaching">{t('settings.categoryCoaching')}</option>
              <option value="fitness">{t('settings.categoryFitness')}</option>
              <option value="other">{t('settings.categoryOther')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.location')}</label>
            <input
              type="text"
              value={businessProfile.location ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, location: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.description')}</label>
            <textarea
              value={businessProfile.description ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              rows={3}
              placeholder={t('settings.descriptionPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.cancellationPolicy')}</label>
            <textarea
              value={businessProfile.cancellationPolicy ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, cancellationPolicy: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              rows={3}
            />
          </div>
          <button
            onClick={() => handleSave('/business/profile', businessProfile)}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? t('common.saving') : t('settings.saveProfile')}
          </button>
        </div>
      )}

      {tab === 'receptionist' && (
        <div id="panel-receptionist" role="tabpanel" aria-labelledby="tab-receptionist" className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.receptionistName')}</label>
            <input
              type="text"
              value={receptionistProfile.name ?? ''}
              onChange={(e) => setReceptionistProfile({ ...receptionistProfile, name: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.tone')}</label>
            <select
              value={receptionistProfile.tone ?? 'professional'}
              onChange={(e) => setReceptionistProfile({ ...receptionistProfile, tone: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            >
              <option value="professional">{t('settings.toneProfessional')}</option>
              <option value="warm">{t('settings.toneWarm')}</option>
              <option value="friendly">{t('settings.toneFriendly')}</option>
              <option value="elegant">{t('settings.toneElegant')}</option>
              <option value="casual">{t('settings.toneCasual')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settings.greetingTemplate')}</label>
            <textarea
              value={receptionistProfile.greetingTemplate ?? ''}
              onChange={(e) => setReceptionistProfile({ ...receptionistProfile, greetingTemplate: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              rows={3}
              placeholder={t('settings.greetingPlaceholder')}
            />
          </div>
          <button
            onClick={() => handleSave('/business/receptionist', receptionistProfile)}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? t('common.saving') : t('settings.saveReceptionist')}
          </button>
        </div>
      )}

      {tab === 'services' && (
        <div id="panel-services" role="tabpanel" aria-labelledby="tab-services">
          <ServicesManager />
        </div>
      )}
      {tab === 'availability' && (
        <div id="panel-availability" role="tabpanel" aria-labelledby="tab-availability">
          <AvailabilityManager />
        </div>
      )}
    </div>
  )
}

// --- Services CRUD ---

function ServicesManager() {
  const { t } = useTranslation()
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', durationMinutes: 30, priceCents: '' })

  useEffect(() => { loadServices() }, [])

  async function loadServices() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiFetch<any[]>('/services')
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('services.errorLoad'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        durationMinutes: form.durationMinutes,
        priceCents: form.priceCents ? Math.round(parseFloat(form.priceCents) * 100) : undefined,
      }

      if (editingId) {
        await apiFetch(`/services/${editingId}`, { method: 'PATCH', body: payload })
      } else {
        await apiFetch('/services', { method: 'POST', body: payload })
      }
      setForm({ name: '', description: '', durationMinutes: 30, priceCents: '' })
      setShowForm(false)
      setEditingId(null)
      loadServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('services.errorSave'))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('services.confirmDelete'))) return
    try {
      await apiFetch(`/services/${id}`, { method: 'DELETE' })
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('services.errorDelete'))
    }
  }

  function startEdit(svc: any) {
    setEditingId(svc.id)
    setForm({
      name: svc.name,
      description: svc.description ?? '',
      durationMinutes: svc.durationMinutes,
      priceCents: svc.priceCents ? (svc.priceCents / 100).toString() : '',
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', description: '', durationMinutes: 30, priceCents: '' })
  }

  const previewText = useMemo(() => {
    if (!showForm || !form.name) return null
    const price = form.priceCents ? `$${parseFloat(form.priceCents).toFixed(2)}` : null
    const duration = `${form.durationMinutes} min`
    const parts = [form.name, duration, price].filter(Boolean).join(' \u2014 ')
    const desc = form.description ? `\n${form.description}` : ''
    return `${parts}${desc}`
  }, [showForm, form.name, form.description, form.durationMinutes, form.priceCents])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('services.heading')}</h3>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
          >
            {t('services.addService')}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 mb-6 space-y-4">
          <h4 className="font-medium text-foreground">{editingId ? t('services.editService') : t('services.addService')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('services.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder={t('services.namePlaceholder')}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('services.duration')}</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                required
                min={5}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('services.descriptionField')}</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder={t('services.descriptionPlaceholder')}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('services.price')}</label>
            <input
              type="text"
              value={form.priceCents}
              onChange={e => setForm({ ...form, priceCents: e.target.value })}
              placeholder={t('services.pricePlaceholder')}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm">
              {editingId ? t('services.updateService') : t('services.addService')}
            </button>
            <button type="button" onClick={cancelForm} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm text-foreground">
              {t('common.cancel')}
            </button>
          </div>

          {/* AI Preview */}
          {previewText && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={14} className="text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wide">How it looks to customers</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-line font-medium">
                {previewText}
              </p>
            </div>
          )}
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-card rounded-lg border border-border animate-pulse">
              <div className="flex justify-between">
                <div><div className="h-4 w-32 bg-muted rounded" /><div className="h-3 w-20 bg-muted rounded mt-2" /></div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wrench size={36} className="mx-auto mb-3 opacity-50" />
          <p>{t('services.empty')}</p>
          <p className="text-sm">{t('services.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map(svc => (
            <div key={svc.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{svc.name}</p>
                <p className="text-sm text-muted-foreground">
                  {svc.durationMinutes} min{svc.priceCents ? ` · $${(svc.priceCents / 100).toFixed(2)}` : ''}
                  {svc.description ? ` · ${svc.description}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(svc)} className="text-sm text-primary hover:text-primary/80">{t('common.edit')}</button>
                <button onClick={() => handleDelete(svc.id)} className="text-sm text-destructive hover:text-destructive/80">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Availability Manager ---

const DAY_KEYS = ['daysFull.0', 'daysFull.1', 'daysFull.2', 'daysFull.3', 'daysFull.4', 'daysFull.5', 'daysFull.6']

function AvailabilityManager() {
  const { t } = useTranslation()
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })

  useEffect(() => { loadRules() }, [])

  async function loadRules() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiFetch<any[]>('/availability')
      setRules(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('availability.errorLoad'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiFetch('/availability', {
        method: 'POST',
        body: {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          available: true,
        },
      })
      setForm({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
      setShowForm(false)
      loadRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('availability.errorSave'))
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/availability/${id}`, { method: 'DELETE' })
      setRules(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('availability.errorDelete'))
    }
  }

  async function toggleRule(rule: any) {
    try {
      await apiFetch(`/availability/${rule.id}`, {
        method: 'PATCH',
        body: { available: !rule.available },
      })
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, available: !r.available } : r))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('availability.errorUpdate'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('availability.heading')}</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
          >
            {t('availability.addHours')}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 mb-6 space-y-4">
          <h4 className="font-medium text-foreground">{t('availability.addBusinessHours')}</h4>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('availability.day')}</label>
            <select
              value={form.dayOfWeek}
              onChange={e => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
            >
              {DAY_KEYS.map((key, i) => <option key={i} value={i}>{t(key)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('availability.open')}</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('availability.close')}</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary bg-card text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm">{t('availability.addHours')}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm text-foreground">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-card rounded-lg border border-border animate-pulse">
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock size={36} className="mx-auto mb-3 opacity-50" />
          <p>{t('availability.empty')}</p>
          <p className="text-sm">{t('availability.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(rule => (
            <div key={rule.id} className={`flex items-center justify-between p-4 rounded-lg border ${
              rule.available
                ? 'bg-card border-border'
                : 'bg-muted border-border opacity-60'
            }`}>
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground w-28">{t(DAY_KEYS[rule.dayOfWeek] ?? `Day ${rule.dayOfWeek}`)}</span>
                <span className="text-sm text-muted-foreground">
                  {rule.startTime} — {rule.endTime}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleRule(rule)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    rule.available ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {rule.available ? t('availability.open') : t('availability.closed')}
                </button>
                <button onClick={() => handleDelete(rule.id)} className="text-sm text-destructive hover:text-destructive/80">{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
