import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Public pages
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'

// Government pages
import { GovDashboard } from '@/pages/gov/Dashboard'
import { GovGrants } from '@/pages/gov/Grants'
import { GovGrantDetail } from '@/pages/gov/GrantDetail'
import { GovTransactions } from '@/pages/gov/Transactions'
import { GovSmartContractLogs } from '@/pages/gov/SmartContractLogs'

// University pages
import { UniDashboard } from '@/pages/uni/Dashboard'
import { UniGrants } from '@/pages/uni/Grants'
import { UniGrantDetail } from '@/pages/uni/GrantDetail'
import { UniRequests } from '@/pages/uni/Requests'
import { UniRequestDetail } from '@/pages/uni/RequestDetail'
import { UniSmartContractLogs } from '@/pages/uni/SmartContractLogs'

// Grantee pages
import { GranteeDashboard } from '@/pages/grantee/Dashboard'
import { GranteeGrants } from '@/pages/grantee/Grants'
import { GranteeGrantDetail } from '@/pages/grantee/GrantDetail'
import { GranteeRequestDetail } from '@/pages/grantee/RequestDetail'
import { GranteeSmartContractLogs } from '@/pages/grantee/SmartContractLogs'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Government routes */}
        <Route
          path="/gov/*"
          element={
            <ProtectedRoute allowedRoles={['government']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<GovDashboard />} />
          <Route path="grants" element={<GovGrants />} />
          <Route path="grants/:grantId" element={<GovGrantDetail />} />
          <Route path="transactions" element={<GovTransactions />} />
          <Route
            path="smart-contract-logs"
            element={<GovSmartContractLogs />}
          />
        </Route>

        {/* University routes */}
        <Route
          path="/uni/*"
          element={
            <ProtectedRoute allowedRoles={['university']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UniDashboard />} />
          <Route path="grants" element={<UniGrants />} />
          <Route path="grants/:grantId" element={<UniGrantDetail />} />
          <Route path="requests" element={<UniRequests />} />
          <Route path="requests/:id" element={<UniRequestDetail />} />
          <Route
            path="smart-contract-logs"
            element={<UniSmartContractLogs />}
          />
        </Route>

        {/* Grantee routes */}
        <Route
          path="/grantee/*"
          element={
            <ProtectedRoute allowedRoles={['grantee']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<GranteeDashboard />} />
          <Route path="grants" element={<GranteeGrants />} />
          <Route path="grants/:grantId" element={<GranteeGrantDetail />} />
          <Route path="requests/:id" element={<GranteeRequestDetail />} />
          <Route
            path="smart-contract-logs"
            element={<GranteeSmartContractLogs />}
          />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App

