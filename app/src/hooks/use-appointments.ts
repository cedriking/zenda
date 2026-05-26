import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../services/api-client'

interface Appointment {
  id: string
  customerId: string
  customerName: string | null
  customerPhone: string | null
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
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 30
  const pageRef = useRef(page)
  useEffect(() => { pageRef.current = page }, [page])

  const loadAppointments = useCallback(async (status?: string, pageNum = 0) => {
    if (pageNum === 0) {
      setIsLoading(true)
      setPage(0)
    } else {
      setIsLoadingMore(true)
    }
    setError(null)
    try {
      const params = new URLSearchParams({
        include: 'customer,service',
        limit: String(PAGE_SIZE),
        offset: String(pageNum * PAGE_SIZE),
        from: selectedDate || new Date().toISOString(),
      })
      if (status) params.set('status', status)
      const data = await apiFetch<Appointment[]>(`/appointments?${params}`)
      const result = data as Appointment[]
      if (pageNum === 0) {
        setAppointments(result)
      } else {
        setAppointments(prev => [...prev, ...result])
      }
      setHasMore(result.length === PAGE_SIZE)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  const loadMore = useCallback(async (status?: string) => {
    const nextPage = pageRef.current + 1
    pageRef.current = nextPage
    await loadAppointments(status, nextPage)
  }, [loadAppointments])

  const updateStatus = useCallback(async (id: string, status: string) => {
    const updated = await apiFetch<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    setAppointments(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }, [])

  useEffect(() => {
    const unsub = window.electron?.on?.('appointment:update', (data: unknown) => {
      const partial = data as Partial<Appointment>
      setAppointments(prev =>
        prev.map(a => a.id === partial.id ? { ...a, ...partial } : a),
      )
    })
    return () => { unsub?.() }
  }, [])

  // Reload appointments when selectedDate changes
  useEffect(() => {
    loadAppointments()
  }, [selectedDate, loadAppointments])

  return {
    appointments,
    selectedDate,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    setSelectedDate,
    loadAppointments,
    loadMore,
    updateStatus,
  }
}
