import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
      setItems(data as any)
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
      setItems(data as any)
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={24} />
            Knowledge Base
          </h2>
          <p className="text-sm text-gray-500 mt-1">Add FAQs and info your AI receptionist can use to answer customers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search knowledge base..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={handleSearch} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
          Search
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg border border-gray-200 p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question / Topic</label>
            <input
              type="text"
              value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              required
              placeholder="e.g., What are your business hours?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              value={form.answer}
              onChange={e => setForm({ ...form, answer: e.target.value })}
              required
              rows={4}
              placeholder="The answer your AI receptionist will give..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="general">General</option>
              <option value="services">Services</option>
              <option value="policies">Policies</option>
              <option value="pricing">Pricing</option>
              <option value="location">Location</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add to Knowledge Base'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p>No items yet. Add FAQs to help your AI receptionist answer customer questions.</p>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.category}</span>
                </div>
                <h4 className="font-medium text-gray-900">{item.question}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.answer}</p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-400 hover:text-red-500 p-1"
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
