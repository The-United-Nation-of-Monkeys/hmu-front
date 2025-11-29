import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { spendingApi } from '@/lib/spending'
import { receiptsApi } from '@/lib/receipts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AmountBadge } from '@/components/AmountBadge'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { AmlFlagList } from '@/components/AmlFlagList'
import { FileUpload } from '@/components/FileUpload'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'

export function GranteeRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', 'grantee', id],
    queryFn: () => spendingApi.getSpendingRequest(Number(id)),
    enabled: !!id,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      receiptsApi.uploadReceipt({
        spending_request_id: Number(id!),
        file,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', 'grantee', id] })
      toast({
        title: t('success'),
        description: t('receiptUploaded'),
      })
      setFile(null)
    },
    onError: () => {
      toast({
        title: t('error'),
        description: t('fileUploadError'),
        variant: 'destructive',
      })
    },
  })

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
  }

  const handleUpload = () => {
    if (!file) return
    uploadMutation.mutate(file)
  }

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  if (!request) {
    return <div>Request not found</div>
  }

  const canUploadReceipt =
    request.status === 'pending_receipt' && !request.receipt_url

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Request #{request.id}</h1>
        <p className="text-muted-foreground mt-2">Spending request details</p>
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

      {canUploadReceipt && (
        <Card>
          <CardHeader>
            <CardTitle>{t('uploadReceipt')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload onFileSelect={handleFileSelect} />
            {file && (
              <div className="flex items-center justify-between">
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? t('loading') : t('uploadReceipt')}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
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

      {request.aml_flags && request.aml_flags.length > 0 && (
        <AmlFlagList flags={request.aml_flags} />
      )}
    </div>
  )
}

