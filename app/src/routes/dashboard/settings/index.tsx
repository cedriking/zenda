import { AlertCircle, Bot, Building2, Clock, Eye, Wrench } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import LangToggle from "@/components/lang-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { apiFetch } from "../../../services/api-client";

type TabId = "business" | "receptionist" | "services" | "availability";

interface BusinessProfile {
  cancellationPolicy?: string;
  category?: string;
  description?: string;
  location?: string;
  name: string;
}

interface ReceptionistProfile {
  greetingTemplate?: string;
  name: string;
  tone?: string;
}

interface Service {
  description?: string;
  durationMinutes: number;
  id: string;
  name: string;
  priceCents?: number;
}

interface AvailabilityRule {
  available: boolean;
  closeTime: string;
  dayOfWeek: number;
  enabled: boolean;
  endTime: string;
  id: string;
  openTime: string;
  slotDurationMinutes: number;
  startTime: string;
}

// Strip server-only fields before PATCH to avoid 422 errors
function buildPayload(
  endpoint: string,
  data: BusinessProfile | ReceptionistProfile
): Record<string, unknown> {
  if (endpoint === "/business/profile") {
    const { name, category, description, location, cancellationPolicy } =
      data as BusinessProfile;
    return { name, category, description, location, cancellationPolicy };
  }
  const { name, tone, greetingTemplate } = data as ReceptionistProfile;
  return { name, tone, greetingTemplate };
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>("business");
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: "",
  });
  const [receptionistProfile, setReceptionistProfile] =
    useState<ReceptionistProfile>({ name: "" });
  const [lastSavedBusiness, setLastSavedBusiness] =
    useState<BusinessProfile | null>(null);
  const [lastSavedReceptionist, setLastSavedReceptionist] =
    useState<ReceptionistProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadError(null);
        const [biz, rec] = await Promise.all([
          apiFetch<BusinessProfile>("/business/profile"),
          apiFetch<ReceptionistProfile>("/business/receptionist"),
        ]);
        setBusinessProfile(biz);
        setReceptionistProfile(rec);
        setLastSavedBusiness(biz);
        setLastSavedReceptionist(rec);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : t("settings.errorLoad")
        );
      }
    }
    load();
  }, [t]);

  function validateRequiredName(
    endpoint: string,
    data: BusinessProfile | ReceptionistProfile,
    translate: (key: string) => string,
    setError: (err: string | null) => void
  ): boolean {
    if (!data.name?.trim()) {
      const label =
        endpoint === "/business/profile"
          ? translate("settings.businessName")
          : translate("settings.receptionistName");
      setError(`${label} is required`);
      return false;
    }
    return true;
  }

  function cacheOnSuccess(
    endpoint: string,
    data: BusinessProfile | ReceptionistProfile
  ) {
    if (endpoint === "/business/profile") {
      setLastSavedBusiness({ ...data });
    } else if (endpoint === "/business/receptionist") {
      setLastSavedReceptionist({ ...data });
    }
  }

  function rollbackOnError(endpoint: string) {
    if (endpoint === "/business/profile" && lastSavedBusiness) {
      setBusinessProfile({ ...lastSavedBusiness });
    } else if (endpoint === "/business/receptionist" && lastSavedReceptionist) {
      setReceptionistProfile({ ...lastSavedReceptionist });
    }
  }

  const handleSave = async (
    endpoint: string,
    data: BusinessProfile | ReceptionistProfile
  ) => {
    if (!validateRequiredName(endpoint, data, t, setSaveError)) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Pick only the fields the API accepts — avoid sending server-only
      // fields (id, workspaceId, timestamps, etc.) that cause 422 errors
      const payload = buildPayload(endpoint, data);

      await apiFetch(endpoint, {
        method: "PATCH",
        body: payload,
      });

      cacheOnSuccess(endpoint, data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("settings.errorSave");
      setSaveError(message);
      rollbackOnError(endpoint);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: "business" as const,
      label: t("settings.tabBusiness"),
      icon: <Building2 size={16} />,
    },
    {
      id: "receptionist" as const,
      label: t("settings.tabReceptionist"),
      icon: <Bot size={16} />,
    },
    {
      id: "services" as const,
      label: t("settings.tabServices"),
      icon: <Wrench size={16} />,
    },
    {
      id: "availability" as const,
      label: t("settings.tabAvailability"),
      icon: <Clock size={16} />,
    },
  ];

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === tab);
      let nextIndex: number;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      } else {
        return;
      }
      setTab(tabs[nextIndex].id);
      const tabButtons = document.querySelectorAll<HTMLElement>('[role="tab"]');
      tabButtons[nextIndex]?.focus();
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: tabs is a stable memo
    [tab, tabs]
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-2xl text-foreground">
          {t("settings.heading")}
        </h2>
        <LangToggle />
      </div>

      {loadError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      <div
        aria-label={t("settings.aria.sections", "Settings sections")}
        className="mb-6 flex gap-2"
        onKeyDown={handleTabKeyDown}
        role="tablist"
      >
        {tabs.map((t) => (
          <button
            aria-controls={`panel-${t.id}`}
            aria-selected={tab === t.id}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            id={`tab-${t.id}`}
            key={t.id}
            onClick={() => setTab(t.id)}
            role="tab"
            tabIndex={tab === t.id ? 0 : -1}
            type="button"
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-primary text-sm">
          {t("settings.saved")}
        </div>
      )}

      {tab === "business" && (
        <div
          aria-labelledby="tab-business"
          className="space-y-4 rounded-lg border border-border bg-card p-6"
          id="panel-business"
          role="tabpanel"
        >
          <div>
            <Label htmlFor="settings-business-name">
              {t("settings.businessName")}
            </Label>
            <input
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-business-name"
              onChange={(e) =>
                setBusinessProfile({ ...businessProfile, name: e.target.value })
              }
              type="text"
              value={businessProfile.name ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="settings-business-category">
              {t("settings.category")}
            </Label>
            <select
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-business-category"
              onChange={(e) =>
                setBusinessProfile({
                  ...businessProfile,
                  category: e.target.value,
                })
              }
              value={businessProfile.category ?? "other"}
            >
              <option value="beauty">{t("settings.categoryBeauty")}</option>
              <option value="wellness">{t("settings.categoryWellness")}</option>
              <option value="health">{t("settings.categoryHealth")}</option>
              <option value="coaching">{t("settings.categoryCoaching")}</option>
              <option value="fitness">{t("settings.categoryFitness")}</option>
              <option value="other">{t("settings.categoryOther")}</option>
            </select>
          </div>
          <div>
            <Label htmlFor="settings-business-location">
              {t("settings.location")}
            </Label>
            <input
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-business-location"
              onChange={(e) =>
                setBusinessProfile({
                  ...businessProfile,
                  location: e.target.value,
                })
              }
              type="text"
              value={businessProfile.location ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="settings-business-description">
              {t("settings.description")}
            </Label>
            <textarea
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-business-description"
              onChange={(e) =>
                setBusinessProfile({
                  ...businessProfile,
                  description: e.target.value,
                })
              }
              placeholder={t("settings.descriptionPlaceholder")}
              rows={3}
              value={businessProfile.description ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="settings-business-cancellation">
              {t("settings.cancellationPolicy")}
            </Label>
            <textarea
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-business-cancellation"
              onChange={(e) =>
                setBusinessProfile({
                  ...businessProfile,
                  cancellationPolicy: e.target.value,
                })
              }
              rows={3}
              value={businessProfile.cancellationPolicy ?? ""}
            />
          </div>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={saving}
            onClick={() => handleSave("/business/profile", businessProfile)}
            type="button"
          >
            {saving ? t("common.saving") : t("settings.saveProfile")}
          </button>
        </div>
      )}

      {tab === "receptionist" && (
        <div
          aria-labelledby="tab-receptionist"
          className="space-y-4 rounded-lg border border-border bg-card p-6"
          id="panel-receptionist"
          role="tabpanel"
        >
          <div>
            <Label htmlFor="settings-rec-name">
              {t("settings.receptionistName")}
            </Label>
            <input
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-rec-name"
              onChange={(e) =>
                setReceptionistProfile({
                  ...receptionistProfile,
                  name: e.target.value,
                })
              }
              type="text"
              value={receptionistProfile.name ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="settings-rec-tone">{t("settings.tone")}</Label>
            <select
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-rec-tone"
              onChange={(e) =>
                setReceptionistProfile({
                  ...receptionistProfile,
                  tone: e.target.value,
                })
              }
              value={receptionistProfile.tone ?? "professional"}
            >
              <option value="professional">
                {t("settings.toneProfessional")}
              </option>
              <option value="warm">{t("settings.toneWarm")}</option>
              <option value="friendly">{t("settings.toneFriendly")}</option>
              <option value="elegant">{t("settings.toneElegant")}</option>
              <option value="casual">{t("settings.toneCasual")}</option>
            </select>
          </div>
          <div>
            <Label htmlFor="settings-rec-greeting">
              {t("settings.greetingTemplate")}
            </Label>
            <textarea
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-rec-greeting"
              onChange={(e) =>
                setReceptionistProfile({
                  ...receptionistProfile,
                  greetingTemplate: e.target.value,
                })
              }
              placeholder={t("settings.greetingPlaceholder")}
              rows={3}
              value={receptionistProfile.greetingTemplate ?? ""}
            />
          </div>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={saving}
            onClick={() =>
              handleSave("/business/receptionist", receptionistProfile)
            }
            type="button"
          >
            {saving ? t("common.saving") : t("settings.saveReceptionist")}
          </button>
        </div>
      )}

      {tab === "services" && (
        <div aria-labelledby="tab-services" id="panel-services" role="tabpanel">
          <ServicesManager />
        </div>
      )}
      {tab === "availability" && (
        <div
          aria-labelledby="tab-availability"
          id="panel-availability"
          role="tabpanel"
        >
          <AvailabilityManager />
        </div>
      )}
    </div>
  );
}

// --- Services CRUD ---

function renderServicesList(
  isLoading: boolean,
  services: Service[],
  t: (key: string, defaultValue?: string) => string,
  startEdit: (svc: Service) => void,
  setDeleteTargetId: (id: string | null) => void
): ReactNode {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((n) => (
          <div
            className="animate-pulse rounded-lg border border-border bg-card p-4"
            key={`svc-skeleton-${n}`}
          >
            <div className="flex justify-between">
              <div>
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="mt-2 h-3 w-20 rounded bg-muted" />
              </div>
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Wrench className="mx-auto mb-3 opacity-50" size={36} />
        <p>{t("services.empty")}</p>
        <p className="text-sm">{t("services.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {services.map((svc) => (
        <div
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
          key={svc.id}
        >
          <div>
            <p className="font-medium text-foreground">{svc.name}</p>
            <p className="text-muted-foreground text-sm">
              {svc.durationMinutes} {t("services.minutesShort", "min")}
              {svc.priceCents ? ` · $${(svc.priceCents / 100).toFixed(2)}` : ""}
              {svc.description ? ` · ${svc.description}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="text-primary text-sm hover:text-primary/80"
              onClick={() => startEdit(svc)}
              type="button"
            >
              {t("common.edit")}
            </button>
            <button
              className="text-destructive text-sm hover:text-destructive/80"
              onClick={() => setDeleteTargetId(svc.id)}
              type="button"
            >
              {t("common.delete")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ServicesManager() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    durationMinutes: 30,
    priceCents: "",
  });

  useEffect(() => {
    loadServices();
    // biome-ignore lint/correctness/useExhaustiveDependencies: loadServices uses stable setters and t
  }, [loadServices]);

  async function loadServices() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Service[]>("/services");
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("services.errorLoad"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        durationMinutes: form.durationMinutes,
        priceCents: form.priceCents
          ? Math.round(Number.parseFloat(form.priceCents) * 100)
          : undefined,
      };

      if (editingId) {
        await apiFetch(`/services/${editingId}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await apiFetch("/services", { method: "POST", body: payload });
      }
      setForm({
        name: "",
        description: "",
        durationMinutes: 30,
        priceCents: "",
      });
      setShowForm(false);
      setEditingId(null);
      loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("services.errorSave"));
    }
  }

  async function confirmDelete() {
    const id = deleteTargetId;
    if (!id) {
      return;
    }
    try {
      await apiFetch(`/services/${id}`, { method: "DELETE" });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("services.errorDelete"));
    }
    setDeleteTargetId(null);
  }

  function startEdit(svc: Service) {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      description: svc.description ?? "",
      durationMinutes: svc.durationMinutes,
      priceCents: svc.priceCents ? (svc.priceCents / 100).toString() : "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "", durationMinutes: 30, priceCents: "" });
  }

  const previewText = useMemo(() => {
    if (!(showForm && form.name)) {
      return null;
    }
    const price = form.priceCents
      ? `$${Number.parseFloat(form.priceCents).toFixed(2)}`
      : null;
    const duration = `${form.durationMinutes} ${t("services.minutesShort", "min")}`;
    const parts = [form.name, duration, price].filter(Boolean).join(" \u2014 ");
    const desc = form.description ? `\n${form.description}` : "";
    return `${parts}${desc}`;
  }, [
    showForm,
    form.name,
    form.description,
    form.durationMinutes,
    form.priceCents,
    t,
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-lg">
          {t("services.heading")}
        </h3>
        {!showForm && (
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            type="button"
          >
            {t("services.addService")}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form
          className="mb-6 space-y-4 rounded-lg border border-border bg-card p-6"
          onSubmit={handleSubmit}
        >
          <h4 className="font-medium text-foreground">
            {editingId ? t("services.editService") : t("services.addService")}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="settings-svc-name">{t("services.name")}</Label>
              <input
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                id="settings-svc-name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("services.namePlaceholder")}
                required
                type="text"
                value={form.name}
              />
            </div>
            <div>
              <Label htmlFor="settings-svc-duration">
                {t("services.duration")}
              </Label>
              <input
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                id="settings-svc-duration"
                min={5}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationMinutes: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
                required
                type="number"
                value={form.durationMinutes}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="settings-svc-desc">
              {t("services.descriptionField")}
            </Label>
            <input
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-svc-desc"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder={t("services.descriptionPlaceholder")}
              type="text"
              value={form.description}
            />
          </div>
          <div>
            <Label htmlFor="settings-svc-price">{t("services.price")}</Label>
            <input
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-svc-price"
              onChange={(e) => setForm({ ...form, priceCents: e.target.value })}
              placeholder={t("services.pricePlaceholder")}
              type="text"
              value={form.priceCents}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
              type="submit"
            >
              {editingId
                ? t("services.updateService")
                : t("services.addService")}
            </button>
            <button
              className="rounded-lg border border-input px-4 py-2 text-foreground text-sm hover:bg-muted"
              onClick={cancelForm}
              type="button"
            >
              {t("common.cancel")}
            </button>
          </div>

          {/* AI Preview */}
          {previewText && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Eye className="text-primary" size={14} />
                <span className="font-medium text-primary text-xs uppercase tracking-wide">
                  {t("services.previewLabel", "How it looks to customers")}
                </span>
              </div>
              <p className="whitespace-pre-line font-medium text-foreground text-sm">
                {previewText}
              </p>
            </div>
          )}
        </form>
      )}

      {renderServicesList(isLoading, services, t, startEdit, setDeleteTargetId)}

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null);
          }
        }}
        open={deleteTargetId !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("services.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "services.confirmDeleteDesc",
                "This service will be permanently removed."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Availability Manager ---

const DAY_KEYS = [
  "daysFull.0",
  "daysFull.1",
  "daysFull.2",
  "daysFull.3",
  "daysFull.4",
  "daysFull.5",
  "daysFull.6",
];

function renderRulesList(
  isLoading: boolean,
  rules: AvailabilityRule[],
  t: (key: string) => string,
  toggleRule: (rule: AvailabilityRule) => void,
  handleDelete: (id: string) => void
): ReactNode {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((n) => (
          <div
            className="animate-pulse rounded-lg border border-border bg-card p-4"
            key={`avail-skeleton-${n}`}
          >
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Clock className="mx-auto mb-3 opacity-50" size={36} />
        <p>{t("availability.empty")}</p>
        <p className="text-sm">{t("availability.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rules
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map((rule) => (
          <div
            className={`flex items-center justify-between rounded-lg border p-4 ${
              rule.available
                ? "border-border bg-card"
                : "border-border bg-muted opacity-60"
            }`}
            key={rule.id}
          >
            <div className="flex items-center gap-4">
              <span className="w-28 font-medium text-foreground">
                {t(DAY_KEYS[rule.dayOfWeek] ?? `Day ${rule.dayOfWeek}`)}
              </span>
              <span className="text-muted-foreground text-sm">
                {rule.startTime} — {rule.endTime}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                className={`rounded-full px-3 py-1 text-xs ${
                  rule.available
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
                onClick={() => toggleRule(rule)}
                type="button"
              >
                {rule.available
                  ? t("availability.open")
                  : t("availability.closed")}
              </button>
              <button
                className="text-destructive text-sm hover:text-destructive/80"
                onClick={() => handleDelete(rule.id)}
                type="button"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

function AvailabilityManager() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
  });

  useEffect(() => {
    loadRules();
    // biome-ignore lint/correctness/useExhaustiveDependencies: loadRules uses stable setters and t
  }, [loadRules]);

  async function loadRules() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AvailabilityRule[]>("/availability");
      setRules(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("availability.errorLoad")
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiFetch("/availability", {
        method: "POST",
        body: {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          available: true,
        },
      });
      setForm({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
      setShowForm(false);
      loadRules();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("availability.errorSave")
      );
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/availability/${id}`, { method: "DELETE" });
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("availability.errorDelete")
      );
    }
  }

  async function toggleRule(rule: AvailabilityRule) {
    try {
      await apiFetch(`/availability/${rule.id}`, {
        method: "PATCH",
        body: { available: !rule.available },
      });
      setRules((prev) =>
        prev.map((r) =>
          r.id === rule.id ? { ...r, available: !r.available } : r
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("availability.errorUpdate")
      );
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-lg">
          {t("availability.heading")}
        </h3>
        {!showForm && (
          <button
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
            onClick={() => setShowForm(true)}
            type="button"
          >
            {t("availability.addHours")}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form
          className="mb-6 space-y-4 rounded-lg border border-border bg-card p-6"
          onSubmit={handleSubmit}
        >
          <h4 className="font-medium text-foreground">
            {t("availability.addBusinessHours")}
          </h4>
          <div>
            <Label htmlFor="settings-avail-day">{t("availability.day")}</Label>
            <select
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              id="settings-avail-day"
              onChange={(e) =>
                setForm({
                  ...form,
                  dayOfWeek: Number.parseInt(e.target.value, 10),
                })
              }
              value={form.dayOfWeek}
            >
              {DAY_KEYS.map((key, i) => (
                <option key={`day-${key}`} value={i}>
                  {t(key)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="settings-avail-open">
                {t("availability.open")}
              </Label>
              <input
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                id="settings-avail-open"
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                required
                type="time"
                value={form.startTime}
              />
            </div>
            <div>
              <Label htmlFor="settings-avail-close">
                {t("availability.close")}
              </Label>
              <input
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                id="settings-avail-close"
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
                type="time"
                value={form.endTime}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
              type="submit"
            >
              {t("availability.addHours")}
            </button>
            <button
              className="rounded-lg border border-input px-4 py-2 text-foreground text-sm hover:bg-muted"
              onClick={() => setShowForm(false)}
              type="button"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}

      {renderRulesList(isLoading, rules, t, toggleRule, handleDelete)}
    </div>
  );
}
