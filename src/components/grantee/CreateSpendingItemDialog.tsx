import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { spendingApi, CreateSpendingItemRequest } from '@/lib/spending'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface CreateSpendingItemDialogProps {
  children: React.ReactNode
  grantId: number
  onSuccess?: () => void
}

export function CreateSpendingItemDialog({
  children,
  grantId,
  onSuccess,
}: CreateSpendingItemDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<Omit<CreateSpendingItemRequest, 'grant_id'>>({
    title: '',
    description: '',
    amount: 0,
  })

  const mutation = useMutation({
    mutationFn: (data: CreateSpendingItemRequest) =>
      spendingApi.createSpendingItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant', 'grantee', grantId] })
      toast({
        title: t('success'),
        description: t('spendingItemCreated'),
      })
      setOpen(false)
      setFormData({
        title: '',
        description: '',
        amount: 0,
      })
      onSuccess?.()
    },
    onError: () => {
      toast({
        title: t('error'),
        description: 'Failed to create spending item',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ ...formData, grant_id: grantId })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createSpendingItem')}</DialogTitle>
          <DialogDescription>
            Create a new spending item for this grant
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('title')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('loading') : t('createSpendingItem')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

