import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { AuthProvider } from './context/AuthContext'
import { AccountPage } from './pages/AccountPage'
import { HomePage } from './pages/HomePage'
import { MySubmissionsPage } from './pages/MySubmissionsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectApplyPage } from './pages/ProjectApplyPage'
import { PublishPage } from './pages/PublishPage'
import { SignUpPage } from './pages/SignUpPage'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { ProjectEditPage } from './pages/ProjectEditPage'
import { SubmissionDetailPage } from './pages/SubmissionDetailPage'

function useDocumentLang() {
  const { i18n } = useTranslation()
  useEffect(() => {
    document.documentElement.lang = i18n.language
    const handler = () => {
      document.documentElement.lang = i18n.language
    }
    i18n.on('languageChanged', handler)
    return () => i18n.off('languageChanged', handler)
  }, [i18n])
}

export default function App() {
  useDocumentLang()

  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path="/my-submissions" element={<RequireAuth><MySubmissionsPage /></RequireAuth>} />
          <Route path="/submission/:id" element={<RequireAuth><SubmissionDetailPage /></RequireAuth>} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/project/:id/edit" element={<RequireAuth><ProjectEditPage /></RequireAuth>} />
          <Route
            path="/project/:id/apply"
            element={
              <RequireAuth>
                <ProjectApplyPage />
              </RequireAuth>
            }
          />
          <Route
            path="/publish"
            element={
              <RequireAuth>
                <PublishPage />
              </RequireAuth>
            }
          />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}
