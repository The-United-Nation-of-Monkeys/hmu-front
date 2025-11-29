import api from './api'

export interface ContractLog {
  id: number
  transaction_hash: string
  event_type: string
  block_number: number
  timestamp: string
  data: Record<string, any>
}

export const contractApi = {
  getLogs: async (): Promise<ContractLog[]> => {
    const response = await api.get<ContractLog[]>('/contract/logs')
    return response.data
  },

  getLogsByGrant: async (grantId: number): Promise<ContractLog[]> => {
    const response = await api.get<ContractLog[]>(`/contract/logs/grant/${grantId}`)
    return response.data
  },
}

