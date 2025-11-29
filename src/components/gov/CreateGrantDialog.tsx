import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { grantsApi, CreateGrantRequest } from '@/lib/grants'
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
import { Skeleton } from '@/components/ui/skeleton'

interface CreateGrantDialogProps {
  children: React.ReactNode
  onSuccess?: () => void
}

export function CreateGrantDialog({ children, onSuccess }: CreateGrantDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: universities, isLoading: universitiesLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: grantsApi.getUniversities,
    enabled: open, // Загружаем только когда диалог открыт
  })

  const [formData, setFormData] = useState<Omit<CreateGrantRequest, 'university_id'> & { university_id: number | null }>({
    title: '',
    total_amount: 0,
    university_id: null,
  })

  const mutation = useMutation({
    mutationFn: grantsApi.createGrant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grants'] })
      toast({
        title: t('success'),
        description: t('grantCreated'),
      })
      setOpen(false)
      setFormData({
        title: '',
        total_amount: 0,
        university_id: null,
      })
      onSuccess?.()
    },
    onError: () => {
      toast({
        title: t('error'),
        description: 'Failed to create grant',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.university_id) {
      toast({
        title: t('error'),
        description: 'Please select a university',
        variant: 'destructive',
      })
      return
    }
    mutation.mutate({
      ...formData,
      university_id: formData.university_id,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createGrant')}</DialogTitle>
          <DialogDescription>
            Create a new grant for distribution
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="university_id">{t('university')}</Label>
            {universitiesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : universities && universities.length > 0 ? (
              <Select
                value={formData.university_id?.toString() || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, university_id: parseInt(value) })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem
                      key={university.id}
                      value={university.id.toString()}
                    >
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                No universities available
              </div>
            )}
          </div>
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
            <Label htmlFor="total_amount">{t('totalAmount')} (RUB)</Label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_amount: parseFloat(e.target.value) || 0,
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
            <Button 
              type="submit" 
              disabled={mutation.isPending || !formData.university_id || universitiesLoading}
            >
              {mutation.isPending ? t('loading') : t('createGrant')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

