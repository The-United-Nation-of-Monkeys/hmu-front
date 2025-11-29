import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { grantsApi } from '@/lib/grants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/DataTable'
import { AmountBadge } from '@/components/AmountBadge'
import { formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { CreateGrantDialog } from '@/components/gov/CreateGrantDialog'

export function GovGrants() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: grants, isLoading, refetch } = useQuery({
    queryKey: ['grants', 'government'],
    queryFn: grantsApi.getGrants,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('grants')}</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all grants
          </p>
        </div>
        <CreateGrantDialog onSuccess={() => refetch()}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('createGrant')}
          </Button>
        </CreateGrantDialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={grants || []}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(grant) => navigate(`/gov/grants/${grant.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

