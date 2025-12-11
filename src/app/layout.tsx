import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc-provider';
import { LanguageProvider } from '@/lib/language-provider';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QMS - 家庭被子管理系统',
  description: '家庭被子库存和使用追踪系统',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        <ErrorBoundary>
          <LanguageProvider>
            <TRPCProvider>
              <GlobalErrorHandler />
              <ConditionalLayout>{children}</ConditionalLayout>
              <Toaster />
              <SonnerToaster position="top-right" richColors closeButton />
            </TRPCProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
