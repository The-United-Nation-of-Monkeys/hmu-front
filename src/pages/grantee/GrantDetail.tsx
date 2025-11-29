import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { grantsApi } from '@/lib/grants'
import { spendingApi } from '@/lib/spending'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AmountBadge } from '@/components/AmountBadge'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Receipt, Upload } from 'lucide-react'
import { CreateSpendingItemDialog } from '@/components/grantee/CreateSpendingItemDialog'
import { CreateSpendingRequestDialog } from '@/components/grantee/CreateSpendingRequestDialog'
import { UploadSpendingItemReceiptDialog } from '@/components/grantee/UploadSpendingItemReceiptDialog'
import { ContractLogList } from '@/components/ContractLogList'
import { contractApi } from '@/lib/contract'

export function GranteeGrantDetail() {
  const { grantId } = useParams<{ grantId: string }>()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: grant, isLoading } = useQuery({
    queryKey: ['grant', 'grantee', grantId],
    queryFn: () => grantsApi.getGranteeGrant(Number(grantId)),
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
      render: (item: any) => (
        <div className="flex items-center gap-2">
          {item.receipt_url ? (
            <>
              <a
                href={item.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Receipt className="h-4 w-4" />
                View
              </a>
              <UploadSpendingItemReceiptDialog
                spendingItemId={item.id}
                grantId={Number(grantId)}
                currentReceiptUrl={item.receipt_url}
                onSuccess={handleRefresh}
              >
                <Button variant="ghost" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </UploadSpendingItemReceiptDialog>
            </>
          ) : (
            <UploadSpendingItemReceiptDialog
              spendingItemId={item.id}
              grantId={Number(grantId)}
              onSuccess={handleRefresh}
            >
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Receipt
              </Button>
            </UploadSpendingItemReceiptDialog>
          )}
        </div>
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['grant', 'grantee', grantId] })
  }

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (!grant) {
    return <div>Grant not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{grant.title}</h1>
        <p className="text-muted-foreground mt-2">{grant.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <AmountBadge
              amount={grant.total_amount}
              currency={grant.currency}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('spendingItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {grant.spending_items?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('spendingRequests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {grant.spending_requests?.length || 0}
            </div>
          </CardContent>
        </Card>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('spendingRequests')}</CardTitle>
              <CreateSpendingRequestDialog
                grantId={Number(grantId)}
                spendingItems={grant.spending_items || []}
                onSuccess={handleRefresh}
              >
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createSpendingRequest')}
                </Button>
              </CreateSpendingRequestDialog>
            </CardHeader>
            <CardContent>
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

