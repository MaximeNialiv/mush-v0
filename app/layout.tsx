import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import SupabaseProvider from '@/context/supabase-provider'
import dynamic from 'next/dynamic'
import * as Sentry from '@sentry/nextjs'

// Import Font Awesome config
import '@/utils/font-awesome'

// Import dynamique de l'ErrorBoundary pour éviter les problèmes de SSR
const ErrorBoundary = dynamic(
  () => import('@/components/error-boundary'),
  { ssr: false }
)

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          // Script pour désactiver définitivement le rechargement au refocus
          (function() {
            function preventReload(e) {
              e.stopPropagation();
              e.preventDefault();
              return false;
            }
            
            // Exécuter immédiatement au chargement
            window.addEventListener('visibilitychange', preventReload, true);
            window.addEventListener('focus', preventReload, true);
            document.addEventListener('visibilitychange', preventReload, true);
            document.addEventListener('focus', preventReload, true);
            
            // Désactiver également le comportement par défaut de Next.js
            if (window.next && window.next.router) {
              const originalOnFocus = window.next.router.onFocus;
              window.next.router.onFocus = function() {
                // Ne rien faire au focus
                return false;
              };
            }
          })();
        ` }} />
      </head>
      <body>
        <SupabaseProvider>
          <ErrorBoundary>
            {children}
            <Toaster position="bottom-right" />
          </ErrorBoundary>
        </SupabaseProvider>
      </body>
    </html>
  )
}
