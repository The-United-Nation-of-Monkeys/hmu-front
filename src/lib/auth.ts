import api from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  full_name: string
  role: 'government' | 'university' | 'grantee'
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    email: string
    full_name: string
    role: 'government' | 'university' | 'grantee'
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data)
    return response.data
  },

  getMe: async (): Promise<AuthResponse['user']> => {
    const response = await api.get<AuthResponse['user']>('/auth/me')
    return response.data
  },
}

