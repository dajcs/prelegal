import AuthGuard from '@/components/AuthGuard'
import DocCreator from '@/components/DocCreator'
import { SLUGS, getEntryBySlug } from '@/lib/catalog'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }))
}

export default function DocPage({ params }: Props) {
  const entry = getEntryBySlug(params.slug)
  if (!entry) return <div className="p-8 text-gray-500">Document not found.</div>

  return (
    <AuthGuard>
      <DocCreator entry={entry} />
    </AuthGuard>
  )
}
