import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { PublishPage } from './pages/PublishPage'
import { ProjectApplyPage } from './pages/ProjectApplyPage'

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
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/project/:id/apply" element={<ProjectApplyPage />} />
        <Route path="/publish" element={<PublishPage />} />
      </Routes>
    </Layout>
  )
}
