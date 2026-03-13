'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CATALOG } from '@/lib/catalog'
import { getSession, clearSession } from '@/lib/session'

interface DocRecord {
  id: number
  doc_type: string
  doc_name: string
  created_at: string
}

function routeForDoc(doc: DocRecord): string | null {
  const entry = CATALOG.find((e) => e.filename === doc.doc_type)
  if (!entry) return null
  return `${entry.route}?docId=${doc.id}`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function CatalogPage() {
  const router = useRouter()
  const session = getSession()
  const [recentDocs, setRecentDocs] = useState<DocRecord[]>([])

  useEffect(() => {
    if (!session?.userId) return
    fetch(`/api/documents?user_id=${session.userId}`)
      .then((r) => r.json())
      .then((docs) => setRecentDocs(docs.slice(0, 6)))
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    clearSession()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              PreLegal
            </p>
            <h1 className="text-xl font-bold leading-tight" style={{ color: '#032147' }}>
              Legal Document Creator
            </h1>
          </div>
          {session && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {session.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* My Documents */}
        {recentDocs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#032147' }}>
              Recent Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentDocs.filter((doc) => routeForDoc(doc) !== null).map((doc) => (
                <Link key={doc.id} href={routeForDoc(doc) as string}>
                  <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-[#209dd7] hover:shadow-sm transition-all cursor-pointer flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#75399118' }}>
                      <svg className="w-4 h-4" style={{ color: '#753991' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#032147' }}>{doc.doc_name}</p>
                      <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-300 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Document catalog */}
        <div>
          <p className="text-gray-500 text-sm mb-6">
            Select a document type to get started. Our AI assistant will guide you through filling in the details.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATALOG.map((entry) => (
              <Link key={entry.slug} href={entry.route}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#209dd7] hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#209dd718' }}>
                      <svg className="w-4 h-4 text-[#209dd7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-sm font-semibold leading-snug" style={{ color: '#032147' }}>
                      {entry.name}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">
                    {entry.description}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-medium" style={{ color: '#209dd7' }}>
                    Create document
                    <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
