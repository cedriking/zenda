import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api-client'
import { ArrowLeft, User, Phone, Globe, Brain, Calendar } from 'lucide-react'

export const Route = createFileRoute('/dashboard/customers/$id')({
  component: CustomerProfilePage,
})

interface CustomerProfile {
  id: string
  phoneNumber: string
  name: string | null
  language: string
  totalAppointments: number
  lastVisit: string | null
  memory: Array<{ key: string; value: string; source: string }>
}

function CustomerProfilePage() {
  const { id } = Route.useParams()
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomer()
  }, [id])

  async function loadCustomer() {
    setLoading(true)
    try {
      const data = await apiFetch<CustomerProfile>(`/customers/${id}`)
      setCustomer(data as any)
    } catch { /* silent */ }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>
  }

  if (!customer) {
    return <div className="p-6 text-gray-500">Customer not found</div>
  }

  return (
    <div className="p-6">
      <Link
        to="/dashboard/conversations"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={16} />
        Back to conversations
      </Link>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {customer.name ?? 'Unknown Customer'}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {customer.phoneNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={14} />
                  {customer.language === 'es' ? 'Spanish' : 'English'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div>
              <div className="text-sm text-gray-500">Total Appointments</div>
              <div className="text-lg font-semibold flex items-center gap-1">
                <Calendar size={16} />
                {customer.totalAppointments}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Visit</div>
              <div className="text-lg font-semibold">
                {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Memory */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Brain size={20} className="text-purple-500" />
            What Zenda Knows
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Information your AI receptionist has learned about this customer from conversations.
          </p>

          {customer.memory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Brain size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No preferences learned yet. They'll appear as conversations happen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.memory.map((mem, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-0.5">
                    {mem.key}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{mem.value}</p>
                    <p className="text-xs text-gray-400 mt-1">Source: {mem.source}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
