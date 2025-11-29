import api from './api'
import { AmlFlag } from './grants'

export const amlApi = {
  getFlags: async (spendingRequestId: number): Promise<AmlFlag[]> => {
    const response = await api.get<AmlFlag[]>(`/aml/flags/${spendingRequestId}`)
    return response.data
  },

  getFlagsByGrant: async (grantId: number): Promise<AmlFlag[]> => {
    const response = await api.get<AmlFlag[]>(`/aml/flags/grant/${grantId}`)
    return response.data
  },
}

