import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api-client'
import { Settings as SettingsIcon, Building2, Bot, Clock, Users } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const [tab, setTab] = useState<'business' | 'receptionist' | 'services' | 'availability'>('business')
  const [businessProfile, setBusinessProfile] = useState<Record<string, any>>({})
  const [receptionistProfile, setReceptionistProfile] = useState<Record<string, any>>({})

  useEffect(() => {
    async function load() {
      try {
        const [biz, rec] = await Promise.all([
          apiFetch('/business/profile'),
          apiFetch('/business/receptionist'),
        ])
        setBusinessProfile(biz as any)
        setReceptionistProfile(rec as any)
      } catch {
        // silent
      }
    }
    load()
  }, [])

  const saveBusiness = async () => {
    await apiFetch('/business/profile', {
      method: 'PATCH',
      body: JSON.stringify(businessProfile),
    })
  }

  const saveReceptionist = async () => {
    await apiFetch('/business/receptionist', {
      method: 'PATCH',
      body: JSON.stringify(receptionistProfile),
    })
  }

  const tabs = [
    { id: 'business' as const, label: 'Business', icon: <Building2 size={16} /> },
    { id: 'receptionist' as const, label: 'Receptionist', icon: <Bot size={16} /> },
    { id: 'services' as const, label: 'Services', icon: <SettingsIcon size={16} /> },
    { id: 'availability' as const, label: 'Availability', icon: <Clock size={16} /> },
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
            <textarea
              value={businessProfile.cancellationPolicy ?? ''}
              onChange={(e) => setBusinessProfile({ ...businessProfile, cancellationPolicy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <button onClick={saveBusiness} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Save Business Profile
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
          <button onClick={saveReceptionist} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Save Receptionist Settings
          </button>
        </div>
      )}

      {tab === 'services' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">Services management — add, edit, and remove services. Uses the Services API.</p>
          <p className="text-sm text-gray-400 mt-2">Full CRUD UI coming in next iteration.</p>
        </div>
      )}

      {tab === 'availability' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500">Availability rules — set business hours and staff schedules.</p>
          <p className="text-sm text-gray-400 mt-2">Full availability management coming in next iteration.</p>
        </div>
      )}
    </div>
  )
}
