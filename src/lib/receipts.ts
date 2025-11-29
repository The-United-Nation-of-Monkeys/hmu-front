import api from './api'

export interface UploadReceiptRequest {
  spending_request_id: number
  file: File
}

export interface UploadSpendingItemReceiptRequest {
  spending_item_id: number
  file: File
}

export interface ReceiptResponse {
  id: number
  spending_request_id?: number
  spending_item_id?: number
  file_url: string
  uploaded_at: string
}

export const receiptsApi = {
  // Загрузка чека для spending request
  uploadReceipt: async (data: UploadReceiptRequest): Promise<ReceiptResponse> => {
    const formData = new FormData()
    formData.append('file', data.file)

    // Пробуем оба варианта эндпоинта (с дефисом и с подчеркиванием)
    const response = await api.post<ReceiptResponse>(
      `/grantee/spending_requests/${data.spending_request_id}/upload_receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  // Загрузка чека для spending item
  uploadSpendingItemReceipt: async (
    data: UploadSpendingItemReceiptRequest
  ): Promise<ReceiptResponse> => {
    const formData = new FormData()
    formData.append('file', data.file)

    const response = await api.post<ReceiptResponse>(
      `/grantee/spending-items/${data.spending_item_id}/receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}

