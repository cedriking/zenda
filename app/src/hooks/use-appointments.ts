import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../services/api-client'

interface Appointment {
  id: string
  customerId: string
  serviceId: string
  staffMemberId: string | null
  status: string
  startAt: string
  endAt: string
  timezone: string
  notes: string | null
  createdAt: string
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)

  const loadAppointments = useCallback(async (status?: string) => {
    setIsLoading(true)
    try {
      const query = status ? `?status=${status}` : ''
      const data = await apiFetch<Appointment[]>(`/appointments${query}`)
      setAppointments(data)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (id: string, status: string) => {
    const updated = await apiFetch<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    setAppointments(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }, [])

  useEffect(() => {
    const unsub = window.electron?.on?.('appointment:update', (data: Partial<Appointment>) => {
      setAppointments(prev =>
        prev.map(a => a.id === data.id ? { ...a, ...data } : a),
      )
    })
    return () => { unsub?.() }
  }, [])

  return {
    appointments,
    selectedDate,
    isLoading,
    setSelectedDate,
    loadAppointments,
    updateStatus,
  }
}
