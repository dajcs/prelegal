import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mutual NDA Creator — PreLegal',
  description: 'Create and download a Mutual Non-Disclosure Agreement',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
