import {
  AlertCircle,
  Calendar,
  Phone,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/utils/router";
import { apiFetch } from "../../../services/api-client";

interface CustomerSummary {
  id: string;
  language: string;
  lastVisit: string | null;
  name: string | null;
  phoneNumber: string;
  totalAppointments: number;
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<CustomerSummary[]>("/customers");
      setCustomers(data);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return customers;
    }
    return customers.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-11 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              key={i}
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
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
            {t("customer.loadError")}
          </h2>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={loadCustomers}
            type="button"
          >
            {t("customer.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-2xl text-foreground">
          {t("customer.listingTitle")}
        </h2>
        <span className="text-muted-foreground text-sm">
          {t("customer.customerCount", "{{count}} customer(s)", {
            count: filtered.length,
          })}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          className="w-full rounded-lg border border-border bg-input py-2.5 pr-10 pl-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("customer.searchPlaceholder")}
          type="text"
          value={searchQuery}
        />
        {searchQuery && (
          <button
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchQuery("")}
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="mb-1 font-semibold text-lg">
            {searchQuery
              ? t("common.noResults", "No results")
              : t("customer.noCustomers")}
          </h3>
          {!searchQuery && (
            <p className="text-muted-foreground text-sm">
              {t("customer.noCustomersHint")}
            </p>
          )}
        </div>
      )}

      {/* Customer list */}
      <div className="space-y-2">
        {filtered.map((customer) => (
          <Link
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
            key={customer.id}
            params={{ id: customer.id }}
            to="/dashboard/customers/$id"
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              {customer.name ? (
                <span className="font-semibold text-primary text-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="text-primary" size={18} />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-foreground">
                {customer.name ?? t("customer.unknownName")}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <Phone size={13} />
                  {customer.phoneNumber}
                </span>
                {customer.totalAppointments > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {t("customer.appointmentsCount", {
                      count: customer.totalAppointments,
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Language badge */}
            {customer.language && (
              <span className="flex-shrink-0 rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground text-xs uppercase">
                {customer.language}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
