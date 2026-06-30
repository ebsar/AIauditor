import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Website Auditor',
  description: 'Analyze any website in seconds with Lighthouse, HTML checks, and AI guidance.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
