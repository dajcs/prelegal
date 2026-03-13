'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DisclaimerModal from './DisclaimerModal'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('prelegal_session')) {
      setReady(true)
    } else {
      router.replace('/login')
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#209dd7] animate-spin" />
      </div>
    )
  }

  return (
    <>
      <DisclaimerModal />
      {children}
    </>
  )
}
