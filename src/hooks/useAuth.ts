import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/auth'
import { authStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from 'react-i18next'

export function useLogin() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.getState().login(data.access_token, data.user)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      
      // Redirect based on role
      const roleDashboards: Record<string, string> = {
        government: '/gov/dashboard',
        university: '/uni/dashboard',
        grantee: '/grantee/dashboard',
      }
      navigate(roleDashboards[data.user.role] || '/')
      
      toast({
        title: t('success'),
        description: t('welcome'),
      })
    },
    onError: () => {
      toast({
        title: t('error'),
        description: 'Login failed',
        variant: 'destructive',
      })
    },
  })
}

export function useSignup() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      authStore.getState().login(data.access_token, data.user)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      
      const roleDashboards: Record<string, string> = {
        government: '/gov/dashboard',
        university: '/uni/dashboard',
        grantee: '/grantee/dashboard',
      }
      navigate(roleDashboards[data.user.role] || '/')
      
      toast({
        title: t('success'),
        description: t('welcome'),
      })
    },
    onError: () => {
      toast({
        title: t('error'),
        description: 'Signup failed',
        variant: 'destructive',
      })
    },
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: authStore.getState().isAuthenticated,
    retry: false,
  })
}

