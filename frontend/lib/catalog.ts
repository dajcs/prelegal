export interface CatalogEntry {
  name: string
  description: string
  filename: string
  slug: string
  route: string
}

const rawCatalog = [
  {
    name: 'Mutual NDA',
    description: 'A mutual non-disclosure agreement (MNDA) for two parties to share confidential information while evaluating a potential business relationship.',
    filename: 'Mutual-NDA-coverpage.md',
    slug: 'nda',
    route: '/nda',
  },
  {
    name: 'Cloud Service Agreement',
    description: 'A comprehensive SaaS subscription agreement between a cloud service provider and customer.',
    filename: 'CSA.md',
    slug: 'csa',
    route: '/doc/csa',
  },
  {
    name: 'Service Level Agreement',
    description: 'A service level agreement (SLA) addendum for cloud services defining uptime commitments and support response standards.',
    filename: 'sla.md',
    slug: 'sla',
    route: '/doc/sla',
  },
  {
    name: 'Design Partner Agreement',
    description: 'An agreement for early-stage product access and feedback collaboration between a provider and a design partner.',
    filename: 'design-partner-agreement.md',
    slug: 'design-partner',
    route: '/doc/design-partner',
  },
  {
    name: 'Professional Services Agreement',
    description: 'A professional services agreement governing engagements where a provider delivers custom work or consulting services.',
    filename: 'psa.md',
    slug: 'psa',
    route: '/doc/psa',
  },
  {
    name: 'Data Processing Agreement',
    description: 'A GDPR-compliant data processing agreement governing how a service provider processes personal data on behalf of a customer.',
    filename: 'DPA.md',
    slug: 'dpa',
    route: '/doc/dpa',
  },
  {
    name: 'Partnership Agreement',
    description: 'A framework agreement establishing the terms of a business partnership between two companies.',
    filename: 'Partnership-Agreement.md',
    slug: 'partnership',
    route: '/doc/partnership',
  },
  {
    name: 'Software License Agreement',
    description: 'A software license agreement granting a limited, non-exclusive license to use a provider\'s software.',
    filename: 'Software-License-Agreement.md',
    slug: 'software-license',
    route: '/doc/software-license',
  },
  {
    name: 'Pilot Agreement',
    description: 'A short-term pilot program agreement allowing a prospective customer to evaluate a provider\'s product.',
    filename: 'Pilot-Agreement.md',
    slug: 'pilot',
    route: '/doc/pilot',
  },
  {
    name: 'Business Associate Agreement',
    description: 'A HIPAA-compliant business associate agreement governing a provider\'s handling of protected health information.',
    filename: 'BAA.md',
    slug: 'baa',
    route: '/doc/baa',
  },
  {
    name: 'AI Addendum',
    description: 'An addendum governing the use of AI-powered services within a broader customer-provider agreement.',
    filename: 'AI-Addendum.md',
    slug: 'ai-addendum',
    route: '/doc/ai-addendum',
  },
] as const

export const CATALOG: CatalogEntry[] = rawCatalog as unknown as CatalogEntry[]

export const SLUGS = rawCatalog
  .filter((e) => e.slug !== 'nda')
  .map((e) => e.slug)

export function getEntryBySlug(slug: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.slug === slug)
}
