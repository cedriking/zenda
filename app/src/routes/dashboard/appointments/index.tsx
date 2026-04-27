import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAppointments } from '../../../hooks/use-appointments'
import { Calendar, Clock, User } from 'lucide-react'

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

function AppointmentsPage() {
  const { appointments, isLoading, loadAppointments, selectedDate, setSelectedDate } = useAppointments()

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value)
            loadAppointments()
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>No appointments</p>
          <p className="text-sm">Appointments will appear when the AI books them.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={16} />
                  <span className="text-sm">
                    {new Date(apt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    <User size={14} className="inline mr-1" />
                    {apt.customerId}
                  </p>
                  <p className="text-sm text-gray-500">{apt.serviceId}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[apt.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {apt.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
