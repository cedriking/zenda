import { create } from 'zustand'
import type { Appointment, AppointmentStatus } from '@zenda/shared'

interface AppointmentsState {
  appointments: Appointment[]
  selectedDate: Date | null
  viewMode: 'calendar' | 'list'
  isLoading: boolean

  setAppointments: (appointments: Appointment[]) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  removeAppointment: (id: string) => void
  setSelectedDate: (date: Date | null) => void
  setViewMode: (mode: 'calendar' | 'list') => void
  setLoading: (loading: boolean) => void
}

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: [],
  selectedDate: new Date(),
  viewMode: 'calendar',
  isLoading: false,

  setAppointments: (appointments) => set({ appointments }),
  addAppointment: (appointment) =>
    set((state) => ({ appointments: [...state.appointments, appointment] })),
  updateAppointmentStatus: (id, status) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),
  removeAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id),
    })),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLoading: (isLoading) => set({ isLoading }),
}))
