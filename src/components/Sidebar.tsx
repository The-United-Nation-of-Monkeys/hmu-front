import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { authStore, UserRole } from '@/stores/authStore'
import { uiStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  FileCheck,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const getNavItems = (role: UserRole, t: (key: string) => string): NavItem[] => {
  switch (role) {
    case 'government':
      return [
        { title: t('dashboard'), href: '/gov/dashboard', icon: LayoutDashboard },
        { title: t('grants'), href: '/gov/grants', icon: FileText },
        { title: t('transactions'), href: '/gov/transactions', icon: Receipt },
        {
          title: t('smartContractLogs'),
          href: '/gov/smart-contract-logs',
          icon: FileCheck,
        },
      ]
    case 'university':
      return [
        { title: t('dashboard'), href: '/uni/dashboard', icon: LayoutDashboard },
        { title: t('grants'), href: '/uni/grants', icon: FileText },
        { title: t('requests'), href: '/uni/requests', icon: FileCheck },
        {
          title: t('smartContractLogs'),
          href: '/uni/smart-contract-logs',
          icon: FileCheck,
        },
      ]
    case 'grantee':
      return [
        { title: t('dashboard'), href: '/grantee/dashboard', icon: LayoutDashboard },
        { title: t('grants'), href: '/grantee/grants', icon: FileText },
        {
          title: t('smartContractLogs'),
          href: '/grantee/smart-contract-logs',
          icon: FileCheck,
        },
      ]
    default:
      return []
  }
}

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { user } = authStore()
  const { sidebarOpen, setSidebarOpen } = uiStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Закрываем Sheet на десктопе при монтировании
    if (window.innerWidth >= 1024) {
      setSidebarOpen(false)
    }
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [setSidebarOpen])

  if (!user) return null

  const navItems = getNavItems(user.role, t)

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => {
                if (isMobile) {
                  setSidebarOpen(false)
                }
              }}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-muted/40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - только на экранах меньше lg */}
      <div className="lg:hidden">
        <Sheet 
          open={isMobile && sidebarOpen} 
          onOpenChange={(open) => {
            // Открываем только на мобильных
            if (isMobile) {
              setSidebarOpen(open)
            } else {
              setSidebarOpen(false)
            }
          }}
        >
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

