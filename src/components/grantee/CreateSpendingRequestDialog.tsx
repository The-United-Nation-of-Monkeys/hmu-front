import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { spendingApi, CreateSpendingRequestRequest } from '@/lib/spending'
import { SpendingItem } from '@/lib/grants'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

interface CreateSpendingRequestDialogProps {
  children: React.ReactNode
  grantId: number
  spendingItems: SpendingItem[]
  onSuccess?: () => void
}

export function CreateSpendingRequestDialog({
  children,
  grantId,
  spendingItems,
  onSuccess,
}: CreateSpendingRequestDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<
    Omit<CreateSpendingRequestRequest, 'grant_id'>
  >({
    spending_item_id: spendingItems[0]?.id || 0,
    amount: 0,
  })

  const mutation = useMutation({
    mutationFn: (data: CreateSpendingRequestRequest) =>
      spendingApi.createSpendingRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant', 'grantee', grantId] })
      queryClient.invalidateQueries({ queryKey: ['requests', 'grantee'] })
      toast({
        title: t('success'),
        description: t('spendingRequestCreated'),
      })
      setOpen(false)
      setFormData({
        spending_item_id: spendingItems[0]?.id || 0,
        amount: 0,
      })
      onSuccess?.()
    },
    onError: () => {
      toast({
        title: t('error'),
        description: 'Failed to create spending request',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ ...formData, grant_id: grantId })
  }

  const selectedItem = spendingItems.find(
    (item) => item.id === formData.spending_item_id
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createSpendingRequest')}</DialogTitle>
          <DialogDescription>
            Create a new spending request for a spending item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spending_item_id">Spending Item</Label>
            <Select
              value={formData.spending_item_id.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  spending_item_id: parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {spendingItems.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.title} - {item.amount.toLocaleString('ru-RU')} RUB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              max={selectedItem?.amount}
            />
            {selectedItem && (
              <p className="text-xs text-muted-foreground">
                Max: {selectedItem.amount.toLocaleString('ru-RU')} RUB
              </p>
            )}
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
              {mutation.isPending ? t('loading') : t('createSpendingRequest')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

