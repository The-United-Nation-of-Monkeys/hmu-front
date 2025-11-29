import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AmlFlag } from '@/lib/grants'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'

interface AmlFlagListProps {
  flags: AmlFlag[]
}

export function AmlFlagList({ flags }: AmlFlagListProps) {
  const { t } = useTranslation()

  if (flags.length === 0) {
    return null
  }

  const getSeverityVariant = (severity: AmlFlag['severity']) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t('amlFlags')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-start justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getSeverityVariant(flag.severity)}>
                    {flag.severity.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{flag.flag_type}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {flag.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(flag.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

