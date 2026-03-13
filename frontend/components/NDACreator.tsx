'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { NDAFormData, defaultFormData } from '@/lib/types'
import { getSession, clearSession } from '@/lib/session'
import NDAForm from './NDAForm'
import NDAPreview from './NDAPreview'
import ChatPanel from './ChatPanel'

type PanelTab = 'chat' | 'form'

const DOC_TYPE = 'Mutual-NDA-coverpage.md'
const DOC_NAME = 'Mutual NDA'

export default function NDACreator() {
  const router = useRouter()
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData)
  const [tab, setTab] = useState<PanelTab>('chat')
  const [docId, setDocId] = useState<number | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const session = getSession()  // for header display only

  // On mount: resume existing doc or create a new one
  useEffect(() => {
    const resumeId = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('docId')
      : null
    const session = getSession()

    async function init() {
      if (resumeId) {
        const res = await fetch(`/api/documents/${resumeId}`)
        if (res.ok) {
          const doc = await res.json()
          // Set formData BEFORE docId to avoid auto-save firing with stale defaults
          setFormData((prev) => ({ ...prev, ...doc.fields }))
          setDocId(Number(resumeId))
          return
        }
      }
      if (session?.userId) {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: session.userId, doc_type: DOC_TYPE, doc_name: DOC_NAME }),
        })
        if (res.ok) {
          const doc = await res.json()
          setDocId(doc.id)
        }
      }
    }

    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save with debounce — skip if no docId or form is still at defaults
  useEffect(() => {
    if (!docId || Object.values(formData).every((v) => v === '')) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields_json: JSON.stringify(formData) }),
      })
    }, 800)
  }, [formData, docId])

  function handleChange(field: keyof NDAFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleChatUpdates(updates: Record<string, string>) {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  function handleLogout() {
    clearSession()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                PreLegal
              </p>
              <h1 className="text-base font-bold leading-tight" style={{ color: '#032147' }}>
                Mutual NDA Creator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <span className="text-xs text-gray-500 hidden sm:block">
                {session.name}
              </span>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Split layout */}
      <div className="split-layout flex" style={{ height: 'calc(100vh - 57px)' }}>
        {/* Left panel */}
        <div className="form-panel no-print w-[400px] flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
          {/* Tab toggle */}
          <div className="flex border-b border-gray-200 shrink-0">
            <button
              onClick={() => setTab('chat')}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                tab === 'chat'
                  ? 'text-[#209dd7] border-b-2 border-[#209dd7]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              AI Chat
            </button>
            <button
              onClick={() => setTab('form')}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                tab === 'form'
                  ? 'text-[#209dd7] border-b-2 border-[#209dd7]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Edit Fields
            </button>
          </div>

          {/* Panel content — both mounted, visibility toggled to preserve state */}
          <div className="flex-1 overflow-hidden relative">
            <div className={`absolute inset-0 ${tab === 'chat' ? '' : 'hidden'}`}>
              <ChatPanel onUpdates={handleChatUpdates} />
            </div>
            <div className={`absolute inset-0 overflow-y-auto ${tab === 'form' ? '' : 'hidden'}`}>
              <NDAForm data={formData} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Document preview panel */}
        <div className="document-panel flex-1 overflow-y-auto bg-gray-100 px-8 py-8">
          <NDAPreview data={formData} />
        </div>
      </div>
    </div>
  )
}
