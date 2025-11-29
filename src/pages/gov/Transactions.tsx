import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { spendingApi } from '@/lib/spending'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { formatDate } from '@/lib/utils'

export function GovTransactions() {
  const { t } = useTranslation()

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', 'government'],
    queryFn: spendingApi.getTransactions,
  })

  const columns = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'amount',
      header: t('amount'),
      render: (tx: any) => (
        <span className="font-mono">{tx.amount} {tx.currency || 'USD'}</span>
      ),
    },
    {
      key: 'status',
      header: t('status'),
      render: (tx: any) => <span>{tx.status}</span>,
    },
    {
      key: 'created_at',
      header: t('createdAt'),
      render: (tx: any) => formatDate(tx.created_at || tx.timestamp),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('transactions')}</h1>
        <p className="text-muted-foreground mt-2">
          View all transaction history
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={transactions || []}
            columns={columns}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

