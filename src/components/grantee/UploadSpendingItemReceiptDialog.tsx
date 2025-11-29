import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { receiptsApi } from '@/lib/receipts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/FileUpload'
import { useToast } from '@/components/ui/use-toast'
import { Upload, Receipt } from 'lucide-react'

interface UploadSpendingItemReceiptDialogProps {
  children: React.ReactNode
  spendingItemId: number
  grantId: number
  currentReceiptUrl?: string
  onSuccess?: () => void
}

export function UploadSpendingItemReceiptDialog({
  children,
  spendingItemId,
  grantId,
  currentReceiptUrl,
  onSuccess,
}: UploadSpendingItemReceiptDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (file: File) =>
      receiptsApi.uploadSpendingItemReceipt({
        spending_item_id: spendingItemId,
        file,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant', 'grantee', grantId] })
      queryClient.invalidateQueries({ queryKey: ['grants', 'grantee'] })
      toast({
        title: t('success'),
        description: t('receiptUploaded'),
      })
      setOpen(false)
      setFile(null)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.response?.data?.detail || t('fileUploadError'),
        variant: 'destructive',
      })
    },
  })

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: t('error'),
        description: 'Please select a file',
        variant: 'destructive',
      })
      return
    }
    mutation.mutate(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('uploadReceipt')}</DialogTitle>
          <DialogDescription>
            Upload a receipt for this spending item
          </DialogDescription>
        </DialogHeader>
        {currentReceiptUrl && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4" />
              <span className="text-sm font-medium">Current Receipt:</span>
            </div>
            <a
              href={currentReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View Receipt
            </a>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg'],
              'application/pdf': ['.pdf'],
            }}
            maxSize={10 * 1024 * 1024} // 10MB
          />
          {file && (
            <div className="text-sm text-muted-foreground">
              Selected: {file.name}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setFile(null)
              }}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending || !file}>
              {mutation.isPending ? (
                t('loading')
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {currentReceiptUrl ? 'Replace Receipt' : t('uploadReceipt')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

