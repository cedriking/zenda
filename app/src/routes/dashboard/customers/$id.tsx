import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../../../services/api-client'
import { ArrowLeft, User, Phone, Globe, Brain, Calendar, AlertCircle } from 'lucide-react'

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
  const { t } = useTranslation()
  const { id } = Route.useParams()
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadCustomer()
  }, [id])

  async function loadCustomer() {
    setLoading(true)
    setError(false)
    try {
      const data = await apiFetch<CustomerProfile>(`/customers/${id}`)
      setCustomer(data as any)
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">{t('common.loading')}</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-destructive" size={40} />
          <h2 className="text-lg font-semibold mb-2">{t('customer.errorTitle')}</h2>
          <p className="text-muted-foreground mb-4">{t('customer.errorDescription')}</p>
          <button
            onClick={loadCustomer}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!customer) {
    return <div className="p-6 text-muted-foreground">{t('customer.notFound')}</div>
  }

  return (
    <div className="p-6">
      <Link
        to="/dashboard/conversations"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} />
        {t('customer.backToConversations')}
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
                {customer.name ?? t('customer.unknownName')}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {customer.phoneNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Globe size={14} />
                  {customer.language === 'es' ? t('customer.langSpanish') : t('customer.langEnglish')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
            <div>
              <div className="text-sm text-muted-foreground">{t('customer.totalAppointments')}</div>
              <div className="text-lg font-semibold flex items-center gap-1">
                <Calendar size={16} />
                {customer.totalAppointments}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('customer.lastVisit')}</div>
              <div className="text-lg font-semibold">
                {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : t('customer.never')}
              </div>
            </div>
          </div>
        </div>

        {/* AI Memory */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Brain size={20} className="text-primary" />
            {t('customer.aiMemoryHeading')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('customer.aiMemoryDescription')}
          </p>

          {customer.memory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('customer.aiMemoryEmpty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.memory.map((mem, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-muted rounded-lg p-3">
                  <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-0.5">
                    {mem.key}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{mem.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('customer.aiMemorySource', { source: mem.source })}</p>
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
