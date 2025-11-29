import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { spendingApi } from '@/lib/spending'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { AmountBadge } from '@/components/AmountBadge'
import { formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export function UniRequests() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedRequests, setSelectedRequests] = useState<number[]>([])

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests', 'university'],
    queryFn: spendingApi.getUniversityRequests,
  })

  const approveMutation = useMutation({
    mutationFn: spendingApi.approveTop3,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'university'] })
      toast({
        title: t('success'),
        description: t('top3Approved'),
      })
      setSelectedRequests([])
    },
    onError: () => {
      toast({
        title: t('error'),
        description: 'Failed to approve requests',
        variant: 'destructive',
      })
    },
  })

  const handleApproveTop3 = () => {
    if (selectedRequests.length !== 3) {
      toast({
        title: t('error'),
        description: 'Please select exactly 3 requests',
        variant: 'destructive',
      })
      return
    }
    approveMutation.mutate(selectedRequests)
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
    },
    {
      key: 'amount',
      header: t('amount'),
      render: (request: any) => (
        <AmountBadge amount={request.amount} currency="USD" />
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

  const pendingRequests = requests?.filter(
    (r) => r.status === 'pending_university_approval'
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('requests')}</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve spending requests
          </p>
        </div>
        {pendingRequests.length >= 3 && (
          <Button
            onClick={handleApproveTop3}
            disabled={selectedRequests.length !== 3 || approveMutation.isPending}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {t('approveTop3')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending Approval ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pendingRequests}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(request) => navigate(`/uni/requests/${request.id}`)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests || []}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(request) => navigate(`/uni/requests/${request.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

