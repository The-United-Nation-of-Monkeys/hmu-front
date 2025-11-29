import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus } from 'lucide-react'

interface AssignGranteeDialogProps {
  children: React.ReactNode
  grantId: number
  currentGranteeId?: number
  onSuccess?: () => void
}

export function AssignGranteeDialog({
  children,
  grantId,
  currentGranteeId,
  onSuccess,
}: AssignGranteeDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: grantees, isLoading: granteesLoading } = useQuery({
    queryKey: ['grantees'],
    queryFn: grantsApi.getGrantees,
    enabled: open,
  })

  const [selectedGranteeId, setSelectedGranteeId] = useState<number | null>(
    currentGranteeId || null
  )

  const mutation = useMutation({
    mutationFn: (granteeId: number) =>
      grantsApi.assignGrantee(grantId, granteeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grant', 'university', grantId] })
      queryClient.invalidateQueries({ queryKey: ['grants', 'university'] })
      toast({
        title: t('success'),
        description: 'Grantee assigned successfully',
      })
      setOpen(false)
      onSuccess?.()
    },
    onError: () => {
      toast({
        title: t('error'),
        description: 'Failed to assign grantee',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGranteeId) {
      toast({
        title: t('error'),
        description: 'Please select a grantee',
        variant: 'destructive',
      })
      return
    }
    mutation.mutate(selectedGranteeId)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Grantee</DialogTitle>
          <DialogDescription>
            Select a grantee to assign to this grant
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grantee_id">Grantee</Label>
            {granteesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : grantees && grantees.length > 0 ? (
              <Select
                value={selectedGranteeId?.toString() || ''}
                onValueChange={(value) =>
                  setSelectedGranteeId(parseInt(value))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grantee" />
                </SelectTrigger>
                <SelectContent>
                  {grantees.map((grantee) => (
                    <SelectItem
                      key={grantee.id}
                      value={grantee.id.toString()}
                    >
                      {grantee.name} ({grantee.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                No grantees available
              </div>
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
            <Button
              type="submit"
              disabled={mutation.isPending || !selectedGranteeId || granteesLoading}
            >
              {mutation.isPending ? (
                t('loading')
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

