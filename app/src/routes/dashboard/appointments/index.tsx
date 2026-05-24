import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppointments } from "../../../hooks/use-appointments";
import { apiFetch } from "../../../services/api-client";

export const Route = createFileRoute("/dashboard/appointments/")({
  component: AppointmentsPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-primary/10 text-primary",
  no_show: "bg-muted text-muted-foreground",
  rescheduled: "bg-primary/10 text-primary",
  needs_attention: "bg-amber-100 text-amber-700",
};

function getStatusLabels(t: (key: string) => string): Record<string, string> {
  return {
    pending_confirmation: t("status.pending"),
    confirmed: t("status.confirmed"),
    cancelled: t("status.cancelled"),
    completed: t("status.completed"),
    no_show: t("status.noShow"),
    rescheduled: t("status.rescheduled"),
    needs_attention: t("status.attention"),
    requested: t("status.requested"),
    reminder_sent: t("status.reminderSent"),
    client_confirmed: t("status.clientConfirmed"),
  };
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

function getDaysShort(t: (key: string) => string): string[] {
  return [
    t("daysShort.sun"),
    t("daysShort.mon"),
    t("daysShort.tue"),
    t("daysShort.wed"),
    t("daysShort.thu"),
    t("daysShort.fri"),
    t("daysShort.sat"),
  ];
}

function getStatusFilters(t: (key: string) => string) {
  return [
    { id: "all", label: t("conversations.all") },
    { id: "confirmed", label: t("appointments.confirmed") },
    { id: "pending_confirmation", label: t("appointments.pending") },
    { id: "cancelled", label: t("appointments.cancelled") },
    { id: "completed", label: t("appointments.completed") },
    { id: "no_show", label: t("appointments.noShow") },
  ] as const;
}

function formatHour(hour: number): string {
  if (hour === 0) {
    return "12 AM";
  }
  if (hour < 12) {
    return `${hour} AM`;
  }
  if (hour === 12) {
    return "12 PM";
  }
  return `${hour - 12} PM`;
}

function AppointmentsPage() {
  const { t } = useTranslation();
  const { appointments, isLoading, error, loadAppointments } =
    useAppointments();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Navigate weeks
  const weekStart = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
  };

  const goToday = () => setSelectedDate(new Date());

  const today = new Date().toISOString().split("T")[0];

  // Filtered appointments based on search and status
  const filteredAppointments = useMemo(
    () =>
      appointments.filter((apt) => {
        const matchesStatus =
          statusFilter === "all" || apt.status === statusFilter;
        if (!matchesStatus) {
          return false;
        }
        if (!searchQuery.trim()) {
          return true;
        }
        const query = searchQuery.toLowerCase();
        return (
          (apt.customerName ?? "").toLowerCase().includes(query) ||
          (apt.serviceName ?? "").toLowerCase().includes(query)
        );
      }),
    [appointments, statusFilter, searchQuery]
  );

  // Group appointments by date and hour for calendar view
  const appointmentsByDateHour = useMemo(() => {
    const map = new Map<string, typeof appointments>();
    filteredAppointments.forEach((apt) => {
      const date = new Date(apt.startAt).toISOString().split("T")[0];
      const key = `${date}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(apt);
    });
    return map;
  }, [filteredAppointments]);

  // Filter appointments for list view
  const listAppointments = useMemo(() => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    return filteredAppointments.filter((apt) =>
      apt.startAt.startsWith(dateStr)
    );
  }, [filteredAppointments, selectedDate]);

  const statusFilters = getStatusFilters(t);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-2xl text-foreground">
          {t("calendar.heading")}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              aria-label="Calendar view"
              className={`px-3 py-1.5 text-sm ${view === "calendar" ? "bg-primary text-white" : "bg-card text-foreground"}`}
              onClick={() => setView("calendar")}
            >
              {t("calendar.viewWeek")}
            </button>
            <button
              aria-label="List view"
              className={`px-3 py-1.5 text-sm ${view === "list" ? "bg-primary text-white" : "bg-card text-foreground"}`}
              onClick={() => setView("list")}
            >
              {t("calendar.viewList")}
            </button>
          </div>
          <button
            aria-label="Create new appointment"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={16} />
            {t("calendar.newButton")}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm"
          role="alert"
        >
          <AlertCircle size={16} />
          {error}
          <button className="ml-2 underline" onClick={() => loadAppointments()}>
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Date navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous week"
            className="rounded p-1 hover:bg-muted"
            onClick={prevWeek}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="rounded-lg border border-border px-3 py-1 text-sm hover:bg-muted"
            onClick={goToday}
          >
            {t("calendar.today")}
          </button>
          <button
            aria-label="Next week"
            className="rounded p-1 hover:bg-muted"
            onClick={nextWeek}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <h3 className="font-medium text-foreground text-sm">
          {weekDays[0].toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}{" "}
          —{" "}
          {weekDays[6].toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </h3>
      </div>

      {/* Search and filters */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground/50"
            size={16}
          />
          <input
            className="w-full rounded-lg border border-border bg-card py-2 pr-3 pl-9 text-foreground text-sm placeholder-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("conversations.searchPlaceholder")}
            type="text"
            value={searchQuery}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                statusFilter === f.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="flex animate-pulse items-center justify-between rounded-lg border border-border bg-card p-4"
              key={i}
            >
              <div className="flex items-center gap-4">
                <div className="h-4 w-16 rounded bg-muted" />
                <div>
                  <div className="h-4 w-28 rounded bg-muted" />
                  <div className="mt-1 h-3 w-20 rounded bg-muted" />
                </div>
              </div>
              <div className="h-5 w-20 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : view === "calendar" ? (
        <CalendarWeekView
          appointmentsByDate={appointmentsByDateHour}
          today={today}
          weekDays={weekDays}
        />
      ) : (
        <ListView appointments={listAppointments} selectedDate={selectedDate} />
      )}

      {/* Create appointment modal */}
      {showCreateForm && (
        <CreateAppointmentModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            loadAppointments();
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}

function CalendarWeekView({
  weekDays,
  appointmentsByDate,
  today,
}: {
  weekDays: Date[];
  appointmentsByDate: Map<string, any[]>;
  today: string;
}) {
  const { t } = useTranslation();
  const days = getDaysShort(t);
  const statusLabels = getStatusLabels(t);

  return (
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <table
        aria-label="Weekly calendar"
        className="w-full min-w-[700px]"
        role="grid"
      >
        <thead>
          <tr className="border-border border-b">
            <th
              className="w-16 p-2 text-left text-muted-foreground/50 text-xs"
              scope="col"
            >
              {t("calendar.time")}
            </th>
            {weekDays.map((day) => {
              const dateStr = day.toISOString().split("T")[0];
              const isToday = dateStr === today;
              return (
                <th
                  className={`p-2 text-center font-medium text-xs ${isToday ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  key={dateStr}
                  scope="col"
                >
                  <div>{days[day.getDay()]}</div>
                  <div className={`text-lg ${isToday ? "font-bold" : ""}`}>
                    {day.getDate()}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) => (
            <tr className="h-12 border-border border-b" key={hour}>
              <td className="p-1 align-top text-muted-foreground/50 text-xs">
                {formatHour(hour)}
              </td>
              {weekDays.map((day) => {
                const dateStr = day.toISOString().split("T")[0];
                const dayApts = appointmentsByDate.get(dateStr) ?? [];
                const hourApts = dayApts.filter(
                  (apt) => new Date(apt.startAt).getHours() === hour
                );

                return (
                  <td
                    className={`p-0.5 align-top ${dateStr === today ? "bg-primary/5" : ""}`}
                    key={dateStr}
                  >
                    {hourApts.map((apt) => {
                      const aptTime = new Date(apt.startAt);
                      const endTime = apt.endAt ? new Date(apt.endAt) : null;
                      const timeStr = aptTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const endTimeStr = endTime
                        ? ` – ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "";

                      return (
                        <div
                          className={`mb-0.5 cursor-default rounded px-1.5 py-1 text-[10px] leading-tight ${
                            apt.status === "confirmed"
                              ? "border-emerald-500 border-l-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : apt.status === "pending_confirmation"
                                ? "border-amber-400 border-l-2 bg-amber-100 text-amber-700"
                                : apt.status === "cancelled"
                                  ? "border-destructive/50 border-l-2 bg-destructive/10 text-destructive line-through"
                                  : "border-primary/50 border-l-2 bg-primary/10 text-primary"
                          }`}
                          key={apt.id}
                          title={`${apt.customerName ?? apt.customerId ?? "Unknown"} — ${apt.serviceName ?? ""}${apt.notes ? "\n" + apt.notes : ""}\n${statusLabels[apt.status] ?? apt.status}`}
                        >
                          <div className="truncate font-semibold">
                            {timeStr}
                            {endTimeStr}
                          </div>
                          <div className="truncate font-medium">
                            {apt.customerName ?? t("calendar.customer")}
                          </div>
                          <div className="truncate opacity-75">
                            {apt.serviceName ?? ""}
                          </div>
                        </div>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListView({
  appointments,
  selectedDate,
}: {
  appointments: any[];
  selectedDate: Date;
}) {
  const { t } = useTranslation();
  const statusLabels = getStatusLabels(t);

  return (
    <div className="space-y-2">
      {appointments.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Calendar className="mx-auto mb-4 opacity-50" size={48} />
          <p>
            {t("calendar.noAppointmentsForDate", {
              date: selectedDate.toLocaleDateString(),
            })}
          </p>
          <p className="text-sm">{t("calendar.appointmentsWillAppear")}</p>
        </div>
      ) : (
        appointments.map((apt) => (
          <div
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            key={apt.id}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span className="text-sm">
                  {new Date(apt.startAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  <User className="mr-1 inline" size={14} />
                  {apt.customerName ?? apt.customerId}
                </p>
                <p className="text-muted-foreground text-sm">
                  {apt.serviceName ?? apt.serviceId}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${STATUS_COLORS[apt.status] ?? "bg-muted text-muted-foreground"}`}
            >
              {statusLabels[apt.status] ?? apt.status.replace(/_/g, " ")}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function CreateAppointmentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    notes: "",
  });
  const [services, setServices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any[]>("/services")
      .then(setServices)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const startAt = new Date(`${form.date}T${form.startTime}:00`).toISOString();

    try {
      await apiFetch("/appointments", {
        method: "POST",
        body: {
          customerName: form.customerName,
          customerPhone: form.customerPhone || undefined,
          serviceId: form.serviceId || undefined,
          startAt,
          notes: form.notes || undefined,
        },
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("calendar.errorCreate"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-lg">
            {t("calendar.newAppointment")}
          </h3>
          <button
            aria-label={t("common.close")}
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("calendar.customerName")}
            </label>
            <input
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
              placeholder={t("calendar.customerNamePlaceholder")}
              required
              type="text"
              value={form.customerName}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("calendar.phone")}
            </label>
            <input
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) =>
                setForm({ ...form, customerPhone: e.target.value })
              }
              placeholder={t("calendar.phonePlaceholder")}
              type="tel"
              value={form.customerPhone}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium text-foreground text-sm">
                {t("calendar.date")}
              </label>
              <input
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                type="date"
                value={form.date}
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-foreground text-sm">
                {t("calendar.timeField")}
              </label>
              <input
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                required
                type="time"
                value={form.startTime}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("calendar.service")}
            </label>
            <select
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              value={form.serviceId}
            >
              <option value="">{t("calendar.servicePlaceholder")}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("calendar.notes")}
            </label>
            <textarea
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("calendar.notesPlaceholder")}
              rows={2}
              value={form.notes}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white hover:bg-primary/90 disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving
                ? t("calendar.creatingButton")
                : t("calendar.createButton")}
            </button>
            <button
              className="rounded-lg border border-border px-4 py-2 text-foreground text-sm hover:bg-muted"
              onClick={onClose}
              type="button"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
