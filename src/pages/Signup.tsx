import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSignup } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Link } from 'react-router-dom'

export function Signup() {
  const { t } = useTranslation()
  const signup = useSignup()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'government' | 'university' | 'grantee'>('grantee')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signup.mutate({ email, password, full_name: fullName, role })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('signup')}</CardTitle>
          <CardDescription>
            Create a new account to access SmartGrant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={signup.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={signup.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={signup.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('role')}</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">{t('government')}</SelectItem>
                  <SelectItem value="university">{t('university')}</SelectItem>
                  <SelectItem value="grantee">{t('grantee')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={signup.isPending}>
              {signup.isPending ? t('loading') : t('signup')}
            </Button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">
                Already have an account? {t('login')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

