import AuthGuard from '@/components/AuthGuard'
import NDACreator from '@/components/NDACreator'

export default function Home() {
  return (
    <AuthGuard>
      <NDACreator />
    </AuthGuard>
  )
}
