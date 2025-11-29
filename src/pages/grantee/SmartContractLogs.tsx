import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { contractApi } from '@/lib/contract'
import { ContractLogList } from '@/components/ContractLogList'

export function GranteeSmartContractLogs() {
  const { t } = useTranslation()

  const { data: logs, isLoading } = useQuery({
    queryKey: ['contract-logs', 'grantee'],
    queryFn: contractApi.getLogs,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('smartContractLogs')}</h1>
        <p className="text-muted-foreground mt-2">
          View all smart contract events and logs
        </p>
      </div>

      {isLoading ? (
        <div>{t('loading')}</div>
      ) : (
        <ContractLogList logs={logs || []} />
      )}
    </div>
  )
}

