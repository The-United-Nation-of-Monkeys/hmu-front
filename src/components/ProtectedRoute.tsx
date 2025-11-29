import { Navigate } from 'react-router-dom'
import { authStore, UserRole } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = authStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleDashboards: Record<UserRole, string> = {
      government: '/gov/dashboard',
      university: '/uni/dashboard',
      grantee: '/grantee/dashboard',
    }
    return <Navigate to={roleDashboards[user.role]} replace />
  }

  return <>{children}</>
}

