import {
  AlertCircle,
  BookOpen,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../services/api-client";

interface KBItem {
  answer: string;
  category: string;
  createdAt: string;
  id: string;
  language: string;
  question: string;
}

export default function KnowledgeBasePage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<KBItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "general",
  });
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const data = await apiFetch<KBItem[]>("/knowledge-base");
      setItems(data);
      setSaveError(null);
    } catch {
      setSaveError(
        t("knowledgeBase.errorLoad", "Failed to load knowledge base items")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      loadItems();
      return;
    }
    try {
      const data = await apiFetch<KBItem[]>(
        `/knowledge-base/search?q=${encodeURIComponent(searchQuery)}`
      );
      setItems(data);
      setSaveError(null);
    } catch {
      setSaveError(
        t("knowledgeBase.errorSearch", "Search failed. Please try again.")
      );
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    const sanitizedQuestion = form.question.trim().slice(0, 500);
    const sanitizedAnswer = form.answer.trim().slice(0, 2000);

    if (!(sanitizedQuestion && sanitizedAnswer)) {
      setSaveError(
        t("knowledgeBase.errorEmptyFields", "Question and answer are required.")
      );
      return;
    }

    setLoading(true);
    setSaveError(null);
    try {
      await apiFetch("/knowledge-base", {
        method: "POST",
        body: { ...form, question: sanitizedQuestion, answer: sanitizedAnswer },
      });
      setForm({ question: "", answer: "", category: "general" });
      setShowForm(false);
      loadItems();
    } catch {
      setSaveError(
        t("knowledgeBase.errorSave", "Failed to save item. Please try again.")
      );
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/knowledge-base/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSaveError(null);
    } catch {
      setSaveError(
        t(
          "knowledgeBase.errorDelete",
          "Failed to delete item. Please try again."
        )
      );
    }
  }

  return (
    <div className="p-6">
      {saveError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          <AlertCircle className="shrink-0" size={16} />
          <span>{saveError}</span>
          <button
            className="ml-auto text-destructive/70 hover:text-destructive"
            onClick={() => setSaveError(null)}
            type="button"
          >
            &times;
          </button>
        </div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-2xl text-foreground">
            <BookOpen size={24} />
            {t("knowledgeBase.heading")}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {t("knowledgeBase.subtitle")}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
          {t("knowledgeBase.addItem")}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            className="w-full rounded-lg border border-input py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-ring"
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("knowledgeBase.searchPlaceholder")}
            type="text"
            value={searchQuery}
          />
        </div>
        <button
          className="rounded-lg bg-muted px-4 py-2 text-sm hover:bg-muted/80"
          onClick={handleSearch}
        >
          {t("knowledgeBase.searchButton")}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          className="mb-6 space-y-4 rounded-lg border border-border bg-card p-6"
          onSubmit={handleAdd}
        >
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("knowledgeBase.question")}
            </label>
            <input
              className="w-full rounded-lg border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={500}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder={t("knowledgeBase.questionPlaceholder")}
              required
              type="text"
              value={form.question}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("knowledgeBase.answer")}
            </label>
            <textarea
              className="w-full rounded-lg border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={2000}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder={t("knowledgeBase.answerPlaceholder")}
              required
              rows={4}
              value={form.answer}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium text-foreground text-sm">
              {t("knowledgeBase.category")}
            </label>
            <select
              className="rounded-lg border border-input px-3 py-2"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              value={form.category}
            >
              <option value="general">
                {t("knowledgeBase.categoryGeneral")}
              </option>
              <option value="services">
                {t("knowledgeBase.categoryServices")}
              </option>
              <option value="policies">
                {t("knowledgeBase.categoryPolicies")}
              </option>
              <option value="pricing">
                {t("knowledgeBase.categoryPricing")}
              </option>
              <option value="location">
                {t("knowledgeBase.categoryLocation")}
              </option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading
                ? t("knowledgeBase.adding")
                : t("knowledgeBase.addToKnowledgeBase")}
            </button>
            <button
              className="rounded-lg border border-input px-4 py-2 hover:bg-muted"
              onClick={() => setShowForm(false)}
              type="button"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 opacity-50" size={40} />
            <p>{t("knowledgeBase.empty")}</p>
          </div>
        )}
        {!loading &&
          items.map((item) => (
            <div
              className="rounded-lg border border-border bg-card p-4"
              key={item.id}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground">
                    {item.question}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                    {item.answer}
                  </p>
                </div>
                <button
                  className="p-1 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
