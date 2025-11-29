import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { grantsApi } from '@/lib/grants'
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
import { Upload } from 'lucide-react'

interface UploadSpendingItemsDialogProps {
  children: React.ReactNode
  grantId: number
  onSuccess?: () => void
}

export function UploadSpendingItemsDialog({
  children,
  grantId,
  onSuccess,
}: UploadSpendingItemsDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (file: File) => grantsApi.uploadSpendingItemsFile(grantId, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['grant', 'government', grantId] })
      toast({
        title: t('success'),
        description: `Successfully uploaded ${data.created} spending items`,
      })
      setOpen(false)
      setFile(null)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.response?.data?.detail || 'Failed to upload file',
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
          <DialogTitle>Upload Spending Items</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx, .xls) or CSV file with spending items.
            Expected format: Title, Description, Amount (columns)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            accept={{
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'application/vnd.ms-excel': ['.xls'],
              'text/csv': ['.csv'],
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
            <Button
              type="submit"
              disabled={mutation.isPending || !file}
            >
              {mutation.isPending ? (
                t('loading')
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

