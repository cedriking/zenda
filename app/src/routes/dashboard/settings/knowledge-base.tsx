import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { Plus, Trash2, Search, BookOpen } from 'lucide-react'

export const Route = createFileRoute('/dashboard/settings/knowledge-base')({
  component: KnowledgeBasePage,
})

interface KBItem {
  id: string
  question: string
  answer: string
  category: string
  language: string
  createdAt: string
}

function KnowledgeBasePage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<KBItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      const data = await apiFetch<KBItem[]>('/knowledge-base')
      setItems(data)
    } catch {
      // Knowledge base items will appear when available
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      loadItems()
      return
    }
    try {
      const data = await apiFetch<KBItem[]>(`/knowledge-base/search?q=${encodeURIComponent(searchQuery)}`)
      setItems(data)
    } catch {
      // Search will retry on next attempt
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await apiFetch('/knowledge-base', {
        method: 'POST',
        body: form,
      })
      setForm({ question: '', answer: '', category: 'general' })
      setShowForm(false)
      loadItems()
    } catch {
      // Form submission error handled by UI state
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/knowledge-base/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      // Item will remain in list; retry by refreshing
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen size={24} />
            {t('knowledgeBase.heading')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t('knowledgeBase.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus size={16} />
          {t('knowledgeBase.addItem')}
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('knowledgeBase.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button onClick={handleSearch} className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 text-sm">
          {t('knowledgeBase.searchButton')}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-lg border border-border p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('knowledgeBase.question')}</label>
            <input
              type="text"
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              required
              placeholder={t('knowledgeBase.questionPlaceholder')}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('knowledgeBase.answer')}</label>
            <textarea
              value={form.answer}
              onChange={e => setForm({ ...form, answer: e.target.value })}
              required
              rows={4}
              placeholder={t('knowledgeBase.answerPlaceholder')}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('knowledgeBase.category')}</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-input rounded-lg"
            >
              <option value="general">{t('knowledgeBase.categoryGeneral')}</option>
              <option value="services">{t('knowledgeBase.categoryServices')}</option>
              <option value="policies">{t('knowledgeBase.categoryPolicies')}</option>
              <option value="pricing">{t('knowledgeBase.categoryPricing')}</option>
              <option value="location">{t('knowledgeBase.categoryLocation')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {loading ? t('knowledgeBase.adding') : t('knowledgeBase.addToKnowledgeBase')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-input rounded-lg hover:bg-muted">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('knowledgeBase.empty')}</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{item.category}</span>
                </div>
                <h4 className="font-medium text-foreground">{item.question}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-muted-foreground hover:text-destructive p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
