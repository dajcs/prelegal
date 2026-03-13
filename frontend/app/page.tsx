import AuthGuard from '@/components/AuthGuard'
import CatalogPage from '@/components/CatalogPage'

export default function Home() {
  return (
    <AuthGuard>
      <CatalogPage />
    </AuthGuard>
  )
}
