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
    return <div className="p-6 text-muted-foreground">Loading...</div>
  }

  if (!customer) {
    return <div className="p-6 text-muted-foreground">Customer not found</div>
  }

  return (
    <div className="p-6">
      <Link
        to="/dashboard/conversations"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} />
        Back to conversations
      </Link>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {customer.name ?? 'Unknown Customer'}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
            <div>
              <div className="text-sm text-muted-foreground">Total Appointments</div>
              <div className="text-lg font-semibold flex items-center gap-1">
                <Calendar size={16} />
                {customer.totalAppointments}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Visit</div>
              <div className="text-lg font-semibold">
                {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Memory */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Brain size={20} className="text-violet-500" />
            What Zenda Knows
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Information your AI receptionist has learned about this customer from conversations.
          </p>

          {customer.memory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No preferences learned yet. They'll appear as conversations happen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.memory.map((mem, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-muted rounded-lg p-3">
                  <div className="text-xs bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded mt-0.5">
                    {mem.key}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{mem.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">Source: {mem.source}</p>
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
