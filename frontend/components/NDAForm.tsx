'use client'

import { NDAFormData } from '@/lib/types'

interface Props {
  data: NDAFormData
  onChange: (field: keyof NDAFormData, value: string) => void
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-gray-200 pb-2 mb-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</h3>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 italic mb-1">{hint}</p>}
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'

const numInputCls =
  'w-14 rounded border border-gray-200 px-2 py-1 text-sm text-center shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400'

export default function NDAForm({ data, onChange }: Props) {
  return (
    <div className="space-y-8 p-6 pb-12">
      {/* Agreement Terms */}
      <section>
        <SectionHeader title="Agreement Terms" />
        <div className="space-y-4">
          <Field label="Purpose" hint="How Confidential Information may be used">
            <textarea
              className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              rows={3}
              placeholder="e.g. Evaluating whether to enter into a business relationship with the other party."
              value={data.purpose}
              onChange={(e) => onChange('purpose', e.target.value)}
            />
          </Field>
          <Field label="Effective Date">
            <input
              type="date"
              className={inputCls}
              value={data.effectiveDate}
              onChange={(e) => onChange('effectiveDate', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* MNDA Term */}
      <section>
        <SectionHeader title="MNDA Term" />
        <p className="text-[11px] text-gray-400 italic mb-3">The length of this MNDA</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="mndaTermType"
              value="expires"
              checked={data.mndaTermType === 'expires'}
              onChange={() => onChange('mndaTermType', 'expires')}
              className="accent-blue-500"
            />
            Expires in
            <input
              type="number"
              min="1"
              max="99"
              className={numInputCls}
              value={data.mndaTermYears}
              onChange={(e) => onChange('mndaTermYears', e.target.value)}
              disabled={data.mndaTermType !== 'expires'}
            />
            year(s) from Effective Date
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="mndaTermType"
              value="continues"
              checked={data.mndaTermType === 'continues'}
              onChange={() => onChange('mndaTermType', 'continues')}
              className="accent-blue-500"
            />
            Continues until terminated
          </label>
        </div>
      </section>

      {/* Confidentiality Term */}
      <section>
        <SectionHeader title="Term of Confidentiality" />
        <p className="text-[11px] text-gray-400 italic mb-3">How long Confidential Information is protected</p>
        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="confidentialityTermType"
              value="years"
              checked={data.confidentialityTermType === 'years'}
              onChange={() => onChange('confidentialityTermType', 'years')}
              className="accent-blue-500 mt-0.5"
            />
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <input
                type="number"
                min="1"
                max="99"
                className={numInputCls}
                value={data.confidentialityTermYears}
                onChange={(e) => onChange('confidentialityTermYears', e.target.value)}
                disabled={data.confidentialityTermType !== 'years'}
              />
              year(s) from Effective Date
              <span className="text-[11px] text-gray-400">(trade secrets protected until no longer a trade secret)</span>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="confidentialityTermType"
              value="perpetuity"
              checked={data.confidentialityTermType === 'perpetuity'}
              onChange={() => onChange('confidentialityTermType', 'perpetuity')}
              className="accent-blue-500"
            />
            In perpetuity
          </label>
        </div>
      </section>

      {/* Governing Law */}
      <section>
        <SectionHeader title="Governing Law & Jurisdiction" />
        <div className="space-y-4">
          <Field label="Governing Law">
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. Delaware"
              value={data.governingLaw}
              onChange={(e) => onChange('governingLaw', e.target.value)}
            />
          </Field>
          <Field label="Jurisdiction" hint='City/county and state, e.g. "New Castle, Delaware"'>
            <input
              type="text"
              className={inputCls}
              placeholder="e.g. New Castle, Delaware"
              value={data.jurisdiction}
              onChange={(e) => onChange('jurisdiction', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Party 1 */}
      <section>
        <SectionHeader title="Party 1" />
        <div className="space-y-4">
          {(
            [
              { key: 'party1PrintName', label: 'Print Name' },
              { key: 'party1Title', label: 'Title' },
              { key: 'party1Company', label: 'Company' },
              { key: 'party1NoticeAddress', label: 'Notice Address', hint: 'Email or postal address' },
            ] as { key: keyof NDAFormData; label: string; hint?: string }[]
          ).map(({ key, label, hint }) => (
            <Field key={key} label={label} hint={hint}>
              <input
                type="text"
                className={inputCls}
                value={data[key] as string}
                onChange={(e) => onChange(key, e.target.value)}
              />
            </Field>
          ))}
          <Field label="Date">
            <input
              type="date"
              className={inputCls}
              value={data.party1Date}
              onChange={(e) => onChange('party1Date', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Party 2 */}
      <section>
        <SectionHeader title="Party 2" />
        <div className="space-y-4">
          {(
            [
              { key: 'party2PrintName', label: 'Print Name' },
              { key: 'party2Title', label: 'Title' },
              { key: 'party2Company', label: 'Company' },
              { key: 'party2NoticeAddress', label: 'Notice Address', hint: 'Email or postal address' },
            ] as { key: keyof NDAFormData; label: string; hint?: string }[]
          ).map(({ key, label, hint }) => (
            <Field key={key} label={label} hint={hint}>
              <input
                type="text"
                className={inputCls}
                value={data[key] as string}
                onChange={(e) => onChange(key, e.target.value)}
              />
            </Field>
          ))}
          <Field label="Date">
            <input
              type="date"
              className={inputCls}
              value={data.party2Date}
              onChange={(e) => onChange('party2Date', e.target.value)}
            />
          </Field>
        </div>
      </section>
    </div>
  )
}
