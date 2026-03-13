import AuthGuard from '@/components/AuthGuard'
import NDACreator from '@/components/NDACreator'

export default function NDAPage() {
  return (
    <AuthGuard>
      <NDACreator />
    </AuthGuard>
  )
}
