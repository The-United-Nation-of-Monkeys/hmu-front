import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authStore, UserRole } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LogOut, Menu } from 'lucide-react'
import { uiStore } from '@/stores/uiStore'

export function NavBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = authStore()
  const { toggleSidebar } = uiStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleLabel = (role: UserRole) => {
    return t(role)
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">SmartGrant</span>
        </Link>

        <div className="flex-1" />

        {user && (
          <>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user.full_name}</span>
              <span className="text-xs">({getRoleLabel(user.role)})</span>
            </div>
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}

