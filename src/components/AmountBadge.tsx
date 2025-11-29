import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface AmountBadgeProps {
  amount: number
  currency?: string
}

export function AmountBadge({ amount, currency = 'USD' }: AmountBadgeProps) {
  return (
    <Badge variant="outline" className="font-mono">
      {formatCurrency(amount, currency)}
    </Badge>
  )
}

