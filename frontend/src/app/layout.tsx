import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ET Story Arc Tracker',
  description: 'Explore any business story through Economic Times journalism',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
