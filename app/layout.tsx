import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import SupabaseProvider from '@/context/supabase-provider'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body>
        <SupabaseProvider>
          {children}
          <Toaster position="bottom-right" />
        </SupabaseProvider>
      </body>
    </html>
  )
}
