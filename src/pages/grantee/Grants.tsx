import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { grantsApi } from '@/lib/grants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { AmountBadge } from '@/components/AmountBadge'
import { formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export function GranteeGrants() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: grants, isLoading } = useQuery({
    queryKey: ['grants', 'grantee'],
    queryFn: grantsApi.getGranteeGrants,
  })

  const columns = [
    {
      key: 'title',
      header: t('title'),
    },
    {
      key: 'description',
      header: t('description'),
      render: (grant: any) => (
        <span className="max-w-md truncate">{grant.description}</span>
      ),
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
        <h1 className="text-3xl font-bold">{t('grants')}</h1>
        <p className="text-muted-foreground mt-2">View your grants</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={grants || []}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(grant) => navigate(`/grantee/grants/${grant.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

