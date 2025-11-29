import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { spendingApi } from '@/lib/spending'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AmountBadge } from '@/components/AmountBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { AmlFlagList } from '@/components/AmlFlagList'
import { Skeleton } from '@/components/ui/skeleton'

export function UniRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', 'university', id],
    queryFn: () => spendingApi.getUniversityRequest(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!request) {
    return <div>Request not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Request #{request.id}</h1>
        <p className="text-muted-foreground mt-2">
          Spending request details
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('amount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <AmountBadge amount={request.amount} currency="USD" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={request.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('createdAt')}</CardTitle>
          </CardHeader>
          <CardContent>
            <span>{formatDate(request.created_at)}</span>
          </CardContent>
        </Card>
      </div>

      {request.aml_flags && request.aml_flags.length > 0 && (
        <AmlFlagList flags={request.aml_flags} />
      )}

      {request.receipt_url && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={request.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Receipt
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

