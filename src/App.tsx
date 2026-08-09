/**
 * Root component — FASE 2.
 * Assembles providers, the router, guards and the app shell.
 */

import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { CoupleProvider, useCouple } from '@/contexts/CoupleContext'
import { BalanceProvider } from '@/contexts/BalanceContext'
import { LoadingScreen } from '@/components/ui/loading'
import {
  RequireAuth,
  RequireCouple,
  RequireGuest,
  RequireNoCouple,
} from '@/components/layout/guards'
import { AppLayout } from '@/layouts/AppLayout'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { CreateCouplePage } from '@/pages/onboarding/CreateCouplePage'
import { InvitePartnerPage } from '@/pages/onboarding/InvitePartnerPage'
import { AcceptInvitePage } from '@/pages/onboarding/AcceptInvitePage'
import { DashboardPage } from '@/pages/app/DashboardPage'
import { TransactionsPage } from '@/pages/app/TransactionsPage'
import { TransactionDetailPage } from '@/pages/app/TransactionDetailPage'
import { AddTransactionPage } from '@/pages/app/AddTransactionPage'
import { GoalsPage } from '@/pages/app/GoalsPage'
import { CreateGoalPage } from '@/pages/app/CreateGoalPage'
import { EditGoalPage } from '@/pages/app/EditGoalPage'
import { GoalDetailPage } from '@/pages/app/GoalDetailPage'
import { BudgetsPage } from '@/pages/app/BudgetsPage'
import { StatsPage } from '@/pages/app/StatsPage'
import { CalendarPage } from '@/pages/app/CalendarPage'
import { NotificationsPage } from '@/pages/app/NotificationsPage'
import { ProfilePage } from '@/pages/app/ProfilePage'
import { SettingsPage } from '@/pages/app/SettingsPage'
import { ExportPage } from '@/pages/app/ExportPage'

function RootRedirect() {
  const { user, loading } = useAuth()
  const { couple, loading: coupleLoading } = useCouple()
  if (loading || coupleLoading) return <LoadingScreen label="Cargando…" />
  return <Navigate to={user ? (couple ? '/dashboard' : '/create-couple') : '/login'} replace />
}

function App() {
  useEffect(() => {
    if (import.meta.env.PROD) {
      registerSW({ immediate: true })
    }
  }, [])

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CoupleProvider>
            <BalanceProvider>
              <HashRouter>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<RootRedirect />} />
                  <Route
                    path="/login"
                    element={
                      <RequireGuest>
                        <LoginPage />
                      </RequireGuest>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <RequireGuest>
                        <RegisterPage />
                      </RequireGuest>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <RequireGuest>
                        <ForgotPasswordPage />
                      </RequireGuest>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <RequireGuest>
                        <ResetPasswordPage />
                      </RequireGuest>
                    }
                  />
                  <Route path="/invite/:token" element={<AcceptInvitePage />} />

                  {/* Onboarding (logged in, no couple yet) */}
                  <Route
                    path="/create-couple"
                    element={
                      <RequireNoCouple>
                        <CreateCouplePage />
                      </RequireNoCouple>
                    }
                  />
                  <Route
                    path="/invite-partner"
                    element={
                      <RequireNoCouple>
                        <InvitePartnerPage />
                      </RequireNoCouple>
                    }
                  />

                  {/* App shell */}
                  <Route
                    element={
                      <RequireAuth>
                        <RequireCouple>
                          <AppLayout />
                        </RequireCouple>
                      </RequireAuth>
                    }
                  >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/transactions/:id" element={<TransactionDetailPage />} />
                    <Route path="/add/:type" element={<AddTransactionPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/goals/new" element={<CreateGoalPage />} />
                    <Route path="/goals/:goalId" element={<GoalDetailPage />} />
                    <Route path="/goals/:goalId/edit" element={<EditGoalPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/export" element={<ExportPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </HashRouter>
            </BalanceProvider>
          </CoupleProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
