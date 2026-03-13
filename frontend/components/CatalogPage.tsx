'use client'

import Link from 'next/link'
import { CATALOG } from '@/lib/catalog'

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              PreLegal
            </p>
            <h1 className="text-xl font-bold text-[#032147] leading-tight">
              Legal Document Creator
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-gray-500 text-sm mb-8">
          Select a document type to get started. Our AI assistant will guide you through filling in the details.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATALOG.map((entry) => (
            <Link key={entry.slug} href={entry.route}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#209dd7] hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#209dd7]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#209dd7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-[#032147] leading-snug">
                    {entry.name}
                  </h2>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">
                  {entry.description}
                </p>
                <div className="mt-4 flex items-center text-[#209dd7] text-xs font-medium">
                  Create document
                  <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
