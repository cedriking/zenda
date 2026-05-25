import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../services/api-client";
import {
  Search,
  X,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/customers/")({
  component: CustomersPage,
});

interface CustomerSummary {
  id: string;
  phoneNumber: string;
  name: string | null;
  language: string;
  totalAppointments: number;
  lastVisit: string | null;
}

function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError(false);
    try {
      const data = await apiFetch<CustomerSummary[]>("/customers");
      setCustomers(data);
    } catch {
      setError(true);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">{t("common.loading")}</div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-destructive" size={40} />
          <h2 className="text-lg font-semibold mb-2">
            {t("customer.loadError")}
          </h2>
          <button
            type="button"
            onClick={loadCustomers}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {t("customer.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {t("customer.listingTitle")}
        </h2>
        <span className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "customer" : "customers"}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("customer.searchPlaceholder")}
          className="w-full pl-10 pr-10 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold mb-1">
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
            key={customer.id}
            to="/dashboard/customers/$id"
            params={{ id: customer.id }}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {customer.name ? (
                <span className="text-sm font-semibold text-primary">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={18} className="text-primary" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">
                {customer.name ?? t("customer.unknownName")}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
              <span className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase">
                {customer.language}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
