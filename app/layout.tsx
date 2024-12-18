import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { NextUIProvider } from '@/lib/nextui';
import { Toaster } from 'sonner';
import ThemeProvider from '../components/providers/ThemeProvider';
import { SessionProvider } from '../components/providers/SessionProvider';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { validateSessionToken } from '@/lib/auth';
import Navbar from '@/components/navbar';
import './globals.css';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Camel Blackjack',
  description: 'Camel Blackjack built with NextJS',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await validateSessionToken();
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body className={`${GeistSans.className} bg-background dark:bg-dark_background`}>
        <NuqsAdapter>
          <ThemeProvider>
            <ReactQueryProvider>
              <SessionProvider initialValue={user}>
                <NextUIProvider>
                  <Navbar />
                  <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                  />
                  <main className="md:px-18 flex-center min-h-[calc(100vh-4rem)] flex-col gap-2 px-4 py-16 sm:px-14 lg:px-44 xl:px-64">
                    {children}
                  </main>
                  <Footer />
                </NextUIProvider>
              </SessionProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
