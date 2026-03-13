'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CatalogEntry } from '@/lib/catalog'
import DocForm from './DocForm'
import DocPreview from './DocPreview'
import ChatPanel from './ChatPanel'

type PanelTab = 'chat' | 'form'

interface Props {
  entry: CatalogEntry
}

export default function DocCreator({ entry }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [fields, setFields] = useState<string[]>([])
  const [templateContent, setTemplateContent] = useState('')
  const [tab, setTab] = useState<PanelTab>('chat')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/template/${entry.filename}`)
      .then((r) => r.json())
      .then((data) => {
        setTemplateContent(data.content)
        setFields(data.fields)
        const initial: Record<string, string> = {}
        for (const f of data.fields) initial[f] = ''
        setFormData(initial)
      })
      .catch(() => setError('Failed to load template. Please refresh.'))
      .finally(() => setLoading(false))
  }, [entry.filename])

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleChatUpdates(updates: Record<string, string>) {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#209dd7] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
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
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                {entry.name}
              </h1>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Download PDF
          </button>
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
              <ChatPanel
                docType={entry.filename}
                onUpdates={handleChatUpdates}
              />
            </div>
            <div className={`absolute inset-0 overflow-y-auto ${tab === 'form' ? '' : 'hidden'}`}>
              <DocForm fields={fields} formData={formData} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Document preview panel */}
        <div className="document-panel flex-1 overflow-y-auto bg-gray-100 px-8 py-8">
          <DocPreview
            content={templateContent}
            formData={formData}
            docName={entry.name}
          />
        </div>
      </div>
    </div>
  )
}
