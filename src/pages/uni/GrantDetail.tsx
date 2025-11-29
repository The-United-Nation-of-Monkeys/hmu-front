import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { grantsApi } from '@/lib/grants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AmountBadge } from '@/components/AmountBadge'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContractLogList } from '@/components/ContractLogList'
import { contractApi } from '@/lib/contract'
import { AmlFlagList } from '@/components/AmlFlagList'
import { AssignGranteeDialog } from '@/components/uni/AssignGranteeDialog'
import { UserPlus, Receipt } from 'lucide-react'

export function UniGrantDetail() {
  const { grantId } = useParams<{ grantId: string }>()
  const { t } = useTranslation()

  const { data: grant, isLoading } = useQuery({
    queryKey: ['grant', 'university', grantId],
    queryFn: () => grantsApi.getUniversityGrant(Number(grantId)),
    enabled: !!grantId,
  })

  const { data: logs } = useQuery({
    queryKey: ['contract-logs', 'grant', grantId],
    queryFn: () => contractApi.getLogsByGrant(Number(grantId)),
    enabled: !!grantId,
  })

  const spendingItemsColumns = [
    {
      key: 'id',
      header: 'ID',
      render: (item: any) => (
        <span className="font-mono text-sm">#{item.id}</span>
      ),
    },
    {
      key: 'title',
      header: t('title'),
      render: (item: any) => (
        <div>
          <div className="font-medium">{item.title}</div>
          {item.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: t('amount'),
      render: (item: any) => (
        <AmountBadge amount={item.amount} currency={grant?.currency} />
      ),
    },
    {
      key: 'receipt',
      header: 'Receipt',
      render: (item: any) =>
        item.receipt_url ? (
          <a
            href={item.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            <Receipt className="h-4 w-4" />
            View Receipt
          </a>
        ) : (
          <span className="text-muted-foreground text-sm">No receipt</span>
        ),
    },
    {
      key: 'created_at',
      header: t('createdAt'),
      render: (item: any) => (
        <div className="text-sm">
          <div>{formatDate(item.created_at)}</div>
          <div className="text-muted-foreground text-xs">
            {new Date(item.created_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ]

  const requestsColumns = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'amount',
      header: t('amount'),
      render: (request: any) => (
        <AmountBadge amount={request.amount} currency={grant?.currency} />
      ),
    },
    {
      key: 'status',
      header: t('status'),
      render: (request: any) => <StatusBadge status={request.status} />,
    },
    {
      key: 'created_at',
      header: t('createdAt'),
      render: (request: any) => formatDate(request.created_at),
    },
  ]

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (!grant) {
    return <div>Grant not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{grant.title}</h1>
          <p className="text-muted-foreground mt-2">{grant.description}</p>
        </div>
        <AssignGranteeDialog
          grantId={Number(grantId)}
          currentGranteeId={grant.grantee_id}
          onSuccess={() => {
            // Refetch will happen automatically
          }}
        >
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            {grant.grantee_id ? 'Change Grantee' : 'Assign Grantee'}
          </Button>
        </AssignGranteeDialog>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">{t('spendingItems')}</TabsTrigger>
          <TabsTrigger value="requests">{t('spendingRequests')}</TabsTrigger>
          <TabsTrigger value="logs">{t('smartContractLogs')}</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t('spendingItems')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total: {grant.spending_items?.length || 0} items •{' '}
                  Total Amount:{' '}
                  {grant.spending_items
                    ?.reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString('ru-RU') || 0}{' '}
                  {grant.currency}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={grant.spending_items || []}
                columns={spendingItemsColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardContent className="pt-6">
              <DataTable
                data={grant.spending_requests || []}
                columns={requestsColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <ContractLogList logs={logs || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

