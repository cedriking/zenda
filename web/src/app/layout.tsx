import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zenda — AI Receptionist for Your Business',
  description: 'Multilingual AI receptionist that handles appointments, reminders, and customer conversations via WhatsApp. Built for businesses in Latin America.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
