import type { Appointment, AppointmentStatus } from "@zenda/shared";
import { create } from "zustand";

interface AppointmentsState {
  addAppointment: (appointment: Appointment) => void;
  appendAppointments: (appointments: Appointment[]) => void;
  appointments: Appointment[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  page: number;
  removeAppointment: (id: string) => void;
  selectedDate: Date | null;

  setAppointments: (appointments: Appointment[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setPage: (page: number) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: "calendar" | "list") => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  viewMode: "calendar" | "list";
}

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: [],
  selectedDate: new Date(),
  viewMode: "calendar",
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  page: 0,

  setAppointments: (appointments) => set({ appointments }),
  appendAppointments: (more) =>
    set((state) => ({ appointments: [...state.appointments, ...more] })),
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
  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  setHasMore: (hasMore) => set({ hasMore }),
  setPage: (page) => set({ page }),
}));
