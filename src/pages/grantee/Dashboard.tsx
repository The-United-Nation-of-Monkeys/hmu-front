import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { grantsApi } from '@/lib/grants'
import { spendingApi } from '@/lib/spending'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { AmountBadge } from '@/components/AmountBadge'
import { formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export function GranteeDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: grants, isLoading: grantsLoading } = useQuery({
    queryKey: ['grants', 'grantee'],
    queryFn: grantsApi.getGranteeGrants,
  })

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['requests', 'grantee'],
    queryFn: spendingApi.getSpendingRequests,
  })

  const grantsColumns = [
    {
      key: 'title',
      header: t('title'),
    },
    {
      key: 'total_amount',
      header: t('totalAmount'),
      render: (grant: any) => (
        <AmountBadge amount={grant.total_amount} currency={grant.currency} />
      ),
    },
    {
      key: 'created_at',
      header: t('createdAt'),
      render: (grant: any) => formatDate(grant.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('welcome')} - {t('grantee')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('grants')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{grants?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('spendingRequests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('grants')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={grants || []}
            columns={grantsColumns}
            isLoading={grantsLoading}
            onRowClick={(grant) => navigate(`/grantee/grants/${grant.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

