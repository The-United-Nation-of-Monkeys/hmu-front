import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractLog } from '@/lib/contract'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ContractLogListProps {
  logs: ContractLog[]
}

export function ContractLogList({ logs }: ContractLogListProps) {
  const { t } = useTranslation()

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('noData')}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('smartContractLogs')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 border rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">{log.event_type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(log.timestamp)}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Block:</span> {log.block_number}
                </p>
                <p>
                  <span className="font-medium">Hash:</span>{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {log.transaction_hash.slice(0, 20)}...
                  </code>
                </p>
                {Object.keys(log.data).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      View Data
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

