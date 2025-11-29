import { Badge } from '@/components/ui/badge'
import { SpendingRequest } from '@/lib/grants'
import { useTranslation } from 'react-i18next'

interface StatusBadgeProps {
  status: SpendingRequest['status']
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()

  const statusConfig = {
    paid: { variant: 'success' as const, label: t('paid') },
    pending_university_approval: {
      variant: 'warning' as const,
      label: t('pendingUniversityApproval'),
    },
    pending_receipt: {
      variant: 'warning' as const,
      label: t('pendingReceipt'),
    },
    rejected: { variant: 'destructive' as const, label: t('rejected') },
    blocked: { variant: 'destructive' as const, label: t('blocked') },
  }

  const config = statusConfig[status] || statusConfig.pending_university_approval

  return <Badge variant={config.variant}>{config.label}</Badge>
}

