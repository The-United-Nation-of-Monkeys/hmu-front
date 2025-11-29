import api from './api'
import { SpendingItem, SpendingRequest } from './grants'

export interface CreateSpendingItemRequest {
  grant_id: number
  title: string
  description: string
  amount: number
}

export interface CreateSpendingItemsRequest {
  grant_id: number
  items: Omit<CreateSpendingItemRequest, 'grant_id'>[]
}

export interface CreateSpendingRequestRequest {
  grant_id: number
  spending_item_id: number
  amount: number
}

export const spendingApi = {
  // Grantee endpoints
  // Создание одной статьи расходов
  createSpendingItem: async (data: CreateSpendingItemRequest): Promise<SpendingItem> => {
    const response = await api.post<SpendingItem>('/grantee/spending-items', data)
    return response.data
  },

  // Создание множественных статей расходов для гранта
  createSpendingItems: async (data: CreateSpendingItemsRequest): Promise<SpendingItem[]> => {
    const response = await api.post<SpendingItem[]>(
      `/grantee/grants/${data.grant_id}/spending_items`,
      { items: data.items }
    )
    return response.data
  },

  getSpendingItems: async (grantId: number): Promise<SpendingItem[]> => {
    const response = await api.get<SpendingItem[]>(`/grantee/grants/${grantId}/spending-items`)
    return response.data
  },

  createSpendingRequest: async (data: CreateSpendingRequestRequest): Promise<SpendingRequest> => {
    const response = await api.post<SpendingRequest>('/grantee/spending_requests', data)
    return response.data
  },

  getSpendingRequest: async (id: number): Promise<SpendingRequest> => {
    const response = await api.get<SpendingRequest>(`/grantee/spending_requests/${id}`)
    return response.data
  },

  getSpendingRequests: async (): Promise<SpendingRequest[]> => {
    const response = await api.get<SpendingRequest[]>('/grantee/spending_requests')
    return response.data
  },

  // University endpoints
  getUniversityRequests: async (): Promise<SpendingRequest[]> => {
    const response = await api.get<SpendingRequest[]>('/university/spending-requests')
    return response.data
  },

  getUniversityRequest: async (id: number): Promise<SpendingRequest> => {
    const response = await api.get<SpendingRequest>(`/university/spending-requests/${id}`)
    return response.data
  },

  approveTop3: async (requestIds: number[]): Promise<void> => {
    await api.post('/university/approve-top3', { request_ids: requestIds })
  },

  // Government endpoints
  getTransactions: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/government/transactions')
    return response.data
  },
}

