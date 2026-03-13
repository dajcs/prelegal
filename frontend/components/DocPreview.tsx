'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  formData: Record<string, string>
  docName: string
}

function processTemplate(content: string, formData: Record<string, string>): string {
  return content
    // Convert header_2 spans to ## headers
    .replace(/<span class="header_2"[^>]*>([^<]+)<\/span>/g, '## $1')
    // Convert header_3 spans to bold
    .replace(/<span class="header_3"[^>]*>([^<]+)<\/span>/g, '**$1**')
    // Replace field spans with values or styled placeholder markers
    // Handles possessives: "Customer's" → look up "Customer", render as "Acme's"
    .replace(/<span class="[a-z_]+_link"[^>]*>([^<]+)<\/span>/g, (_match, fieldName) => {
      const possessive = fieldName.match(/^(.+?)[\u2019']s$/)
      if (possessive) {
        const base = possessive[1]
        const value = formData[base]
        return value ? `**${value}'s**` : `[${base}'s]`
      }
      const value = formData[fieldName]
      return value ? `**${value}**` : `[${fieldName}]`
    })
    // Remove any remaining span tags
    .replace(/<span[^>]*>([^<]*)<\/span>/g, '$1')
}

export default function DocPreview({ content, formData, docName }: Props) {
  const processed = processTemplate(content, formData)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 print:shadow-none print:border-none print:p-0">
        <h1 className="text-2xl font-bold text-[#032147] mb-6 print:text-3xl">{docName}</h1>
        <div className="prose prose-sm max-w-none text-gray-800
          prose-headings:text-[#032147]
          prose-h2:text-base prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-2
          prose-p:leading-relaxed prose-p:my-2
          prose-li:my-0.5
          prose-strong:text-[#032147]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{processed}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
