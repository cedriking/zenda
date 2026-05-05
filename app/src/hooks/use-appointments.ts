import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../services/api-client'

interface Appointment {
  id: string
  customerId: string
  customerName: string | null
  serviceId: string
  serviceName: string | null
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
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 30

  const loadAppointments = useCallback(async (status?: string, page = 0) => {
    if (page === 0) setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ include: 'customer,service', limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) })
      if (status) params.set('status', status)
      const data = await apiFetch<Appointment[]>(`/appointments?${params}`)
      const result = data as Appointment[]
      if (page === 0) {
        setAppointments(result)
      } else {
        setAppointments(prev => [...prev, ...result])
      }
      setHasMore(result.length === PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateStatus = useCallback(async (id: string, status: string) => {
    const updated = await apiFetch<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: { status },
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
    error,
    hasMore,
    setSelectedDate,
    loadAppointments,
    updateStatus,
  }
}
