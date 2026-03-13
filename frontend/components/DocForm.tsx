'use client'

interface Props {
  fields: string[]
  formData: Record<string, string>
  onChange: (field: string, value: string) => void
}

function humanize(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase → words
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export default function DocForm({ fields, formData, onChange }: Props) {
  if (fields.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-400">No fields found in this template.</div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {fields.map((field) => (
        <div key={field}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {humanize(field)}
          </label>
          <input
            type="text"
            value={formData[field] ?? ''}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={humanize(field)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#209dd7] focus:ring-1 focus:ring-[#209dd7]"
          />
        </div>
      ))}
    </div>
  )
}
