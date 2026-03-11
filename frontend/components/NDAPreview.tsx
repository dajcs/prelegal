'use client'

import { NDAFormData } from '@/lib/types'
import { CLAUSES, CoverpageField, getFieldValue, isCoverpageField, formatDate } from '@/lib/template'

interface Props {
  data: NDAFormData
}

function FieldValue({ field, data }: { field: CoverpageField; data: NDAFormData }) {
  const value = getFieldValue(field, data)
  if (!value) {
    return (
      <span className="inline-block min-w-[100px] border-b border-dashed border-gray-300 text-gray-400 italic text-sm px-1">
        [{field}]
      </span>
    )
  }
  return <span className="font-semibold text-gray-900">{value}</span>
}

function ClauseText({ data, field }: { data: NDAFormData; field: string }) {
  if (!isCoverpageField(field)) {
    return <span className="italic text-gray-400">[{field}]</span>
  }
  const value = getFieldValue(field, data)
  if (value) {
    return (
      <span className="font-semibold text-gray-900 underline decoration-dotted underline-offset-2">
        {value}
      </span>
    )
  }
  return <span className="italic text-gray-400">[{field}]</span>
}

export default function NDAPreview({ data }: Props) {
  return (
    <div
      id="nda-document"
      className="bg-white shadow-lg mx-auto max-w-[860px] p-16 font-serif text-[13px] text-gray-800 leading-relaxed"
    >
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-xl font-bold tracking-widest uppercase mb-1">
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="text-[11px] text-gray-400">
          Common Paper Mutual NDA — Version 1.0
        </p>
      </div>

      {/* ── Cover Page ── */}
      <section className="mb-10">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-5">
          Cover Page
        </h2>

        <p className="text-xs text-gray-500 italic mb-7 leading-relaxed">
          This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page and
          (2) the Common Paper Mutual NDA Standard Terms Version 1.0. Any modifications of the
          Standard Terms should be made on the Cover Page, which will control over conflicts with
          the Standard Terms.
        </p>

        {/* Purpose */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
            Purpose
          </div>
          <div className="text-[11px] italic text-gray-400 mb-1">
            How Confidential Information may be used
          </div>
          <div className="min-h-[1.5rem]">
            <FieldValue field="Purpose" data={data} />
          </div>
        </div>

        {/* Effective Date */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Effective Date
          </div>
          <FieldValue field="Effective Date" data={data} />
        </div>

        {/* MNDA Term */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
            MNDA Term
          </div>
          <div className="text-[11px] italic text-gray-400 mb-1">The length of this MNDA</div>
          <div className="text-sm">
            {data.mndaTermType === 'expires' ? (
              <>
                Expires{' '}
                <span className="font-semibold">
                  {data.mndaTermYears || '1'} year{parseInt(data.mndaTermYears) === 1 ? '' : 's'}
                </span>{' '}
                from Effective Date.
              </>
            ) : (
              'Continues until terminated in accordance with the terms of the MNDA.'
            )}
          </div>
        </div>

        {/* Term of Confidentiality */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
            Term of Confidentiality
          </div>
          <div className="text-[11px] italic text-gray-400 mb-1">
            How long Confidential Information is protected
          </div>
          <div className="text-sm">
            {data.confidentialityTermType === 'years' ? (
              <>
                <span className="font-semibold">
                  {data.confidentialityTermYears || '1'} year
                  {parseInt(data.confidentialityTermYears) === 1 ? '' : 's'}
                </span>{' '}
                from Effective Date, but in the case of trade secrets until Confidential Information
                is no longer considered a trade secret under applicable laws.
              </>
            ) : (
              'In perpetuity.'
            )}
          </div>
        </div>

        {/* Governing Law & Jurisdiction */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Governing Law &amp; Jurisdiction
          </div>
          <div className="text-sm mb-1">
            <span className="text-gray-500">Governing Law: </span>
            <FieldValue field="Governing Law" data={data} />
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Jurisdiction: </span>
            <FieldValue field="Jurisdiction" data={data} />
          </div>
        </div>

        {/* MNDA Modifications */}
        <div className="mb-7">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            MNDA Modifications
          </div>
          <p className="text-xs text-gray-400 italic">None.</p>
        </div>

        {/* Signature preamble */}
        <p className="text-xs text-gray-700 mb-4">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective
          Date.
        </p>

        {/* Signature table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <td className="w-1/4 border border-gray-300 p-2 bg-gray-50" />
              <td className="border border-gray-300 p-2 bg-gray-50 font-semibold text-center">
                {data.party1Company || 'Party 1'}
              </td>
              <td className="border border-gray-300 p-2 bg-gray-50 font-semibold text-center">
                {data.party2Company || 'Party 2'}
              </td>
            </tr>
          </thead>
          <tbody>
            {(
              [
                { label: 'Signature', p1: null, p2: null },
                { label: 'Print Name', p1: data.party1PrintName, p2: data.party2PrintName },
                { label: 'Title', p1: data.party1Title, p2: data.party2Title },
                { label: 'Company', p1: data.party1Company, p2: data.party2Company },
                {
                  label: 'Notice Address',
                  p1: data.party1NoticeAddress,
                  p2: data.party2NoticeAddress,
                },
                { label: 'Date', p1: formatDate(data.party1Date), p2: formatDate(data.party2Date) },
              ] as { label: string; p1: string | null; p2: string | null }[]
            ).map(({ label, p1, p2 }) => (
              <tr key={label}>
                <td className="border border-gray-300 p-2 font-semibold bg-gray-50">{label}</td>
                <td className="border border-gray-300 p-2 min-h-[2rem]">
                  {p1 === null ? (
                    <span className="text-gray-300 italic">— signature —</span>
                  ) : (
                    <span className={p1 ? 'text-gray-900' : 'text-gray-300 italic'}>
                      {p1 || '—'}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 p-2 min-h-[2rem]">
                  {p2 === null ? (
                    <span className="text-gray-300 italic">— signature —</span>
                  ) : (
                    <span className={p2 ? 'text-gray-900' : 'text-gray-300 italic'}>
                      {p2 || '—'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-[10px] text-gray-400 italic text-center mt-3">
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.
        </p>
      </section>

      {/* Divider (screen only) */}
      <div className="border-t-2 border-gray-100 my-8 print:hidden" />

      {/* ── Standard Terms ── */}
      <section className="print:break-before-page">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-5">
          Standard Terms
        </h2>
        <p className="text-[11px] text-gray-400 italic mb-6">
          Common Paper Mutual NDA Standard Terms Version 1.0
        </p>

        <div className="space-y-5">
          {CLAUSES.map((clause) => (
            <p key={clause.number} className="text-[13px] leading-relaxed text-justify">
              <span className="font-bold">
                {clause.number}. {clause.title}.
              </span>{' '}
              {clause.segments.map((seg, i) =>
                seg.type === 'text' ? (
                  <span key={i}>{seg.value}</span>
                ) : (
                  <ClauseText key={i} field={seg.value} data={data} />
                )
              )}
            </p>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 italic text-center mt-8">
          Common Paper Mutual Non-Disclosure Agreement Version 1.0 free to use under CC BY 4.0.
        </p>
      </section>
    </div>
  )
}
