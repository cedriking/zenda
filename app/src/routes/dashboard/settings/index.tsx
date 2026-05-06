import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api-client'
import { Settings as SettingsIcon, Building2, Bot, Clock, Wrench, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
})

type TabId = 'business' | 'receptionist' | 'services' | 'availability'

function SettingsPage() {
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
        setLoadError(err instanceof Error ? err.message : 'Failed to load settings')
      }
    }
    load()
  }, [])

  const handleSave = async (endpoint: string, data: Record<string, any>) => {
    // Basic validation
    if (endpoint === '/business/profile') {
      if (!data.name?.trim()) {
        setSaveError('Business name is required')
        return
      }
    }
    if (endpoint === '/business/receptionist') {
      if (!data.name?.trim()) {
        setSaveError('Receptionist name is required')
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

      // Store last successfully saved values for rollback
      if (endpoint === '/business/profile') {
        setLastSavedBusiness({ ...data })
      } else if (endpoint === '/business/receptionist') {
        setLastSavedReceptionist({ ...data })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      setSaveError(message)

      // Rollback to last saved values
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
    { id: 'business' as const, label: 'Business', icon: <Building2 size={16} /> },
    { id: 'receptionist' as const, label: 'Receptionist', icon: <Bot size={16} /> },
    { id: 'services' as const, label: 'Services', icon: <Wrench size={16} /> },
    { id: 'availability' as const, label: 'Availability', icon: <Clock size={16} /> },
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

      {loadError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              tab === t.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      {tab === 'business' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              value={businessProfile.name ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={businessProfile.category ?? 'other'}
              onChange={(e) => setBusinessProfile({ ...businessProfile, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="beauty">Beauty</option>
              <option value="wellness">Wellness</option>
              <option value="health">Health</option>
              <option value="coaching">Coaching</option>
              <option value="fitness">Fitness</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={businessProfile.location ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={businessProfile.description ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Brief description of your business"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
            <textarea
              value={businessProfile.cancellationPolicy ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, cancellationPolicy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <button
            onClick={() => handleSave('/business/profile', businessProfile)}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Business Profile'}
          </button>
        </div>
      )}

      {tab === 'receptionist' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receptionist Name</label>
            <input
              type="text"
              value={receptionistProfile.name ?? ''}
              onChange={(e) => setReceptionistProfile({ ...receptionistProfile, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              value={receptionistProfile.tone ?? 'professional'}
              onChange={(e) => setReceptionistProfile({ ...receptionistProfile, tone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="professional">Professional</option>
              <option value="warm">Warm</option>
              <option value="friendly">Friendly</option>
              <option value="elegant">Elegant</option>
              <option value="casual">Casual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Template</label>
            <textarea
              value={receptionistProfile.greetingTemplate ?? ''}
              onChange={(e) => setReceptionistProfile({ ...receptionistProfile, greetingTemplate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Hi! I'm {name}, the assistant for {business}. How can I help?"
            />
          </div>
          <button
            onClick={() => handleSave('/business/receptionist', receptionistProfile)}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Receptionist Settings'}
          </button>
        </div>
      )}

      {tab === 'services' && <ServicesManager />}
      {tab === 'availability' && <AvailabilityManager />}
    </div>
  )
}

// --- Services CRUD ---

function ServicesManager() {
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
      setError(err instanceof Error ? err.message : 'Failed to load services')
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
      setError(err instanceof Error ? err.message : 'Failed to save service')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return
    try {
      await apiFetch(`/services/${id}`, { method: 'DELETE' })
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Services</h3>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Add Service
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
          <h4 className="font-medium text-gray-900">{editingId ? 'Edit Service' : 'Add Service'}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g., Haircut"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                required
                min={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="text"
              value={form.priceCents}
              onChange={e => setForm({ ...form, priceCents: e.target.value })}
              placeholder="e.g., 25.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              {editingId ? 'Update Service' : 'Add Service'}
            </button>
            <button type="button" onClick={cancelForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
              <div className="flex justify-between">
                <div><div className="h-4 w-32 bg-gray-200 rounded" /><div className="h-3 w-20 bg-gray-100 rounded mt-2" /></div>
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Wrench size={36} className="mx-auto mb-3 opacity-50" />
          <p>No services yet</p>
          <p className="text-sm">Add services so your AI receptionist can offer them to customers.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map(svc => (
            <div key={svc.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">{svc.name}</p>
                <p className="text-sm text-gray-500">
                  {svc.durationMinutes} min{svc.priceCents ? ` · $${(svc.priceCents / 100).toFixed(2)}` : ''}
                  {svc.description ? ` · ${svc.description}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(svc)} className="text-sm text-blue-500 hover:text-blue-700">Edit</button>
                <button onClick={() => handleDelete(svc.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Availability Manager ---

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function AvailabilityManager() {
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
      setError(err instanceof Error ? err.message : 'Failed to load availability')
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
      setError(err instanceof Error ? err.message : 'Failed to save availability rule')
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/availability/${id}`, { method: 'DELETE' })
      setRules(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule')
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
      setError(err instanceof Error ? err.message : 'Failed to update rule')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Add Hours
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
          <h4 className="font-medium text-gray-900">Add Business Hours</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={form.dayOfWeek}
              onChange={e => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Close</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">Add Hours</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock size={36} className="mx-auto mb-3 opacity-50" />
          <p>No availability rules yet</p>
          <p className="text-sm">Set your business hours so the AI knows when to book appointments.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(rule => (
            <div key={rule.id} className={`flex items-center justify-between p-4 rounded-lg border ${
              rule.available ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
            }`}>
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900 w-28">{DAYS[rule.dayOfWeek] ?? `Day ${rule.dayOfWeek}`}</span>
                <span className="text-sm text-gray-600">
                  {rule.startTime} — {rule.endTime}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleRule(rule)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    rule.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {rule.available ? 'Open' : 'Closed'}
                </button>
                <button onClick={() => handleDelete(rule.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
