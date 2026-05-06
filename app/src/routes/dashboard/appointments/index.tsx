import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { useAppointments } from '../../../hooks/use-appointments'
import { apiFetch } from '../../../services/api-client'
import { Calendar, Clock, User, AlertCircle, ChevronLeft, ChevronRight, Plus, X, Search } from 'lucide-react'

export const Route = createFileRoute('/dashboard/appointments/')({
  component: AppointmentsPage,
})

const STATUS_COLORS: Record<string, string> = {
  pending_confirmation: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  no_show: 'bg-gray-100 text-gray-700',
  rescheduled: 'bg-purple-100 text-purple-700',
  needs_attention: 'bg-orange-100 text-orange-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending_confirmation: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
  rescheduled: 'Rescheduled',
  needs_attention: 'Attention',
  requested: 'Requested',
  reminder_sent: 'Reminder Sent',
  client_confirmed: 'Confirmed by Client',
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM to 10 PM
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending_confirmation', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'completed', label: 'Completed' },
  { id: 'no_show', label: 'No-show' },
] as const

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

function AppointmentsPage() {
  const { appointments, isLoading, error, loadAppointments } = useAppointments()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Navigate weeks
  const weekStart = useMemo(() => {
    const d = new Date(selectedDate)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }, [selectedDate])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const prevWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 7)
    setSelectedDate(d)
  }

  const nextWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 7)
    setSelectedDate(d)
  }

  const goToday = () => setSelectedDate(new Date())

  const today = new Date().toISOString().split('T')[0]

  // Group appointments by date and hour for calendar view
  const appointmentsByDateHour = useMemo(() => {
    const map = new Map<string, typeof appointments>()
    filteredAppointments.forEach(apt => {
      const date = new Date(apt.startAt).toISOString().split('T')[0]
      const key = `${date}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(apt)
    })
    return map
  }, [filteredAppointments])

  // Filter appointments for list view
  const listAppointments = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    return filteredAppointments.filter(apt => apt.startAt.startsWith(dateStr))
  }, [filteredAppointments, selectedDate])

  // Filtered appointments based on search and status
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
      if (!matchesStatus) return false
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        (apt.customerName ?? '').toLowerCase().includes(query) ||
        (apt.serviceName ?? '').toLowerCase().includes(query)
      )
    })
  }, [appointments, statusFilter, searchQuery])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar</h2>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm ${view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              aria-label="Calendar view"
            >
              Week
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              aria-label="List view"
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            aria-label="Create new appointment"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400 flex items-center gap-2" role="alert">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => loadAppointments()} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-1 hover:bg-gray-100 rounded" aria-label="Previous week">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToday} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Today
          </button>
          <button onClick={nextWeek} className="p-1 hover:bg-gray-100 rounded" aria-label="Next week">
            <ChevronRight size={20} />
          </button>
        </div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </h3>
      </div>

      {/* Search and filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer or service name..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                statusFilter === f.id
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div>
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-20 bg-gray-100 dark:bg-gray-600 rounded mt-1" />
                </div>
              </div>
              <div className="h-5 w-20 bg-gray-100 dark:bg-gray-600 rounded-full" />
            </div>
          ))}
        </div>
      ) : view === 'calendar' ? (
        <CalendarWeekView
          weekDays={weekDays}
          appointmentsByDate={appointmentsByDateHour}
          today={today}
        />
      ) : (
        <ListView appointments={listAppointments} selectedDate={selectedDate} />
      )}

      {/* Create appointment modal */}
      {showCreateForm && (
        <CreateAppointmentModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => { loadAppointments(); setShowCreateForm(false) }}
        />
      )}
    </div>
  )
}

function CalendarWeekView({
  weekDays,
  appointmentsByDate,
  today,
}: {
  weekDays: Date[]
  appointmentsByDate: Map<string, any[]>
  today: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto">
      <table className="w-full min-w-[700px]" role="grid" aria-label="Weekly calendar">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="w-16 p-2 text-xs text-gray-400 dark:text-gray-500 text-left" scope="col">Time</th>
            {weekDays.map(day => {
              const dateStr = day.toISOString().split('T')[0]
              const isToday = dateStr === today
              return (
                <th key={dateStr} className={`p-2 text-center text-xs font-medium ${isToday ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400'}`} scope="col">
                  <div>{DAYS[day.getDay()]}</div>
                  <div className={`text-lg ${isToday ? 'font-bold' : ''}`}>{day.getDate()}</div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hour => (
            <tr key={hour} className="border-b border-gray-100 dark:border-gray-700/50 h-12">
              <td className="p-1 text-xs text-gray-400 dark:text-gray-500 align-top">{formatHour(hour)}</td>
              {weekDays.map(day => {
                const dateStr = day.toISOString().split('T')[0]
                const dayApts = appointmentsByDate.get(dateStr) ?? []
                const hourApts = dayApts.filter(apt => new Date(apt.startAt).getHours() === hour)

                return (
                  <td key={dateStr} className={`p-0.5 align-top ${dateStr === today ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    {hourApts.map(apt => (
                      <div
                        key={apt.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate mb-0.5 ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending_confirmation' ? 'bg-yellow-100 text-yellow-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700 line-through' :
                          'bg-blue-100 text-blue-700'
                        }`}
                        title={`${apt.customerName ?? apt.customerId} — ${apt.serviceName ?? apt.serviceId} (${STATUS_LABELS[apt.status] ?? apt.status})`}
                      >
                        {new Date(apt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {apt.customerName ?? 'Customer'}
                      </div>
                    ))}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListView({ appointments, selectedDate }: { appointments: any[]; selectedDate: Date }) {

  return (
    <div className="space-y-2">
      {appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>No appointments for {selectedDate.toLocaleDateString()}</p>
          <p className="text-sm">Appointments will appear when the AI books them.</p>
        </div>
      ) : (
        appointments.map((apt) => (
          <div
            key={apt.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Clock size={16} />
                <span className="text-sm">
                  {new Date(apt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  <User size={14} className="inline mr-1" />
                  {apt.customerName ?? apt.customerId}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{apt.serviceName ?? apt.serviceId}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[apt.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {STATUS_LABELS[apt.status] ?? apt.status.replace(/_/g, ' ')}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

function CreateAppointmentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    notes: '',
  })
  const [services, setServices] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<any[]>('/services').then(setServices).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const startAt = new Date(`${form.date}T${form.startTime}:00`).toISOString()

    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: {
          customerName: form.customerName,
          customerPhone: form.customerPhone || undefined,
          serviceId: form.serviceId || undefined,
          startAt,
          notes: form.notes || undefined,
        },
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Appointment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
            <input
              type="text"
              value={form.customerName}
              onChange={e => setForm({ ...form, customerName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Maria Garcia"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={e => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service</label>
            <select
              value={form.serviceId}
              onChange={e => setForm({ ...form, serviceId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a service</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Any additional notes"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
            >
              {saving ? 'Creating...' : 'Create Appointment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
