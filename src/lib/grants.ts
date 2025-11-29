import api from './api'

export interface Grant {
  id: number
  title: string
  description: string
  total_amount: number
  currency: string
  government_id: number
  university_id?: number
  grantee_id?: number
  created_at: string
  updated_at: string
}

export interface CreateGrantRequest {
  title: string
  total_amount: number
  university_id: number
}

export interface University {
  id: number
  email: string
  name: string
  role: 'university'
}

export interface Grantee {
  id: number
  email: string
  name: string
  role: 'grantee'
}

export interface GrantDetail extends Grant {
  spending_items: SpendingItem[]
  spending_requests: SpendingRequest[]
}

export interface SpendingItem {
  id: number
  grant_id: number
  title: string
  description: string
  amount: number
  receipt_url?: string
  created_at: string
}

export interface SpendingRequest {
  id: number
  grant_id: number
  spending_item_id: number
  amount: number
  status: 'pending_university_approval' | 'pending_receipt' | 'paid' | 'rejected' | 'blocked'
  created_at: string
  updated_at: string
  receipt_url?: string
  aml_flags?: AmlFlag[]
}

export interface AmlFlag {
  id: number
  spending_request_id: number
  flag_type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  created_at: string
}

export interface BulkSpendingItemsResponse {
  created: number
  items: SpendingItem[]
}

export const grantsApi = {
  // Government endpoints
  getUniversities: async (): Promise<University[]> => {
    const response = await api.get<University[]>('/government/universities')
    return response.data
  },

  createGrant: async (data: CreateGrantRequest): Promise<Grant> => {
    const response = await api.post<Grant>('/government/grants', data)
    return response.data
  },

  getGrants: async (): Promise<Grant[]> => {
    const response = await api.get<Grant[]>('/government/grants')
    return response.data
  },

  getGrant: async (id: number): Promise<GrantDetail> => {
    const response = await api.get<GrantDetail>(`/government/grants/${id}`)
    return response.data
  },

  // Загрузка Excel файла со статьями расходов
  uploadSpendingItemsFile: async (
    grantId: number,
    file: File
  ): Promise<BulkSpendingItemsResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<BulkSpendingItemsResponse>(
      `/government/grants/${grantId}/spending-items/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  // University endpoints
  getUniversityGrants: async (): Promise<Grant[]> => {
    const response = await api.get<Grant[]>('/university/grants')
    return response.data
  },

  getUniversityGrant: async (id: number): Promise<GrantDetail> => {
    const response = await api.get<GrantDetail>(`/university/grants/${id}`)
    return response.data
  },

  // Получить список грантополучателей
  getGrantees: async (): Promise<Grantee[]> => {
    const response = await api.get<Grantee[]>('/university/grantees')
    return response.data
  },

  // Назначить грантополучателя на грант
  assignGrantee: async (
    grantId: number,
    granteeId: number
  ): Promise<Grant> => {
    const response = await api.put<Grant>(
      `/university/grants/${grantId}/assign`,
      { grantee_id: granteeId }
    )
    return response.data
  },

  // Grantee endpoints
  getGranteeGrants: async (): Promise<Grant[]> => {
    const response = await api.get<Grant[]>('/grantee/grants')
    return response.data
  },

  getGranteeGrant: async (id: number): Promise<GrantDetail> => {
    const response = await api.get<GrantDetail>(`/grantee/grants/${id}`)
    return response.data
  },
}
