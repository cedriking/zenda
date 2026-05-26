import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Calendar,
  Globe,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "@/utils/router";
import { apiFetch } from "../../../services/api-client";

interface CustomerProfile {
  id: string;
  language: string;
  lastVisit: string | null;
  memory: Array<{ key: string; value: string; source: string }>;
  name: string | null;
  phoneNumber: string;
  totalAppointments: number;
}

export default function CustomerProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  async function loadCustomer() {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<CustomerProfile>(`/customers/${id}`);
      setCustomer(data);
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="max-w-2xl">
          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-64 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-border border-t pt-4">
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-6 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  className="h-16 animate-pulse rounded-lg bg-muted"
                  key={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mx-auto mt-12 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-destructive" size={40} />
          <h2 className="mb-2 font-semibold text-lg">
            {t("customer.errorTitle")}
          </h2>
          <p className="mb-4 text-muted-foreground">
            {t("customer.errorDescription")}
          </p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={loadCustomer}
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 text-muted-foreground">{t("customer.notFound")}</div>
    );
  }

  return (
    <div className="p-6">
      <Link
        className="mb-6 flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
        to="/dashboard/customers"
      >
        <ArrowLeft size={16} />
        {t("customer.backToCustomers")}
      </Link>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-xl">
                {customer.name ?? t("customer.unknownName")}
              </h2>
              <div className="mt-1 flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {customer.phoneNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={14} />
                  {t(
                    `customer.lang.${customer.language}`,
                    customer.language.toUpperCase()
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-border border-t pt-4">
            <div>
              <div className="text-muted-foreground text-sm">
                {t("customer.totalAppointments")}
              </div>
              <div className="flex items-center gap-1 font-semibold text-lg">
                <Calendar size={16} />
                {customer.totalAppointments}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">
                {t("customer.lastVisit")}
              </div>
              <div className="font-semibold text-lg">
                {customer.lastVisit
                  ? new Date(customer.lastVisit).toLocaleDateString()
                  : t("customer.never")}
              </div>
            </div>
          </div>
        </div>

        {/* AI Memory */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground text-lg">
            <Brain className="text-primary" size={20} />
            {t("customer.aiMemoryHeading")}
          </h3>
          <p className="mb-4 text-muted-foreground text-sm">
            {t("customer.aiMemoryDescription")}
          </p>

          {customer.memory.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Brain className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">{t("customer.aiMemoryEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.memory.map((mem) => (
                <div
                  className="flex items-start gap-3 rounded-lg bg-muted p-3"
                  key={`${mem.key}-${mem.source}`}
                >
                  <div className="mt-0.5 rounded bg-primary/10 px-2 py-0.5 text-primary text-xs">
                    {mem.key}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground text-sm">{mem.value}</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {t("customer.aiMemorySource", { source: mem.source })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
