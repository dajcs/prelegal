'use client'

import { useState } from 'react'
import { NDAFormData, defaultFormData } from '@/lib/types'
import NDAForm from './NDAForm'
import NDAPreview from './NDAPreview'

export default function NDACreator() {
  const [formData, setFormData] = useState<NDAFormData>(defaultFormData)

  function handleChange(field: keyof NDAFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              PreLegal
            </p>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Mutual NDA Creator
            </h1>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 active:bg-gray-800 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Download PDF
          </button>
        </div>
      </header>

      {/* Split layout */}
      <div className="split-layout flex" style={{ height: 'calc(100vh - 57px)' }}>
        {/* Form panel */}
        <div className="form-panel no-print w-[400px] flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <NDAForm data={formData} onChange={handleChange} />
        </div>

        {/* Document preview panel */}
        <div className="document-panel flex-1 overflow-y-auto bg-gray-100 px-8 py-8">
          <NDAPreview data={formData} />
        </div>
      </div>
    </div>
  )
}
