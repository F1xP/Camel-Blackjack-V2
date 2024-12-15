import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { NextUIProvider } from '@/lib/nextui';
import { Toaster } from 'sonner';
import ThemeProvider from '../components/providers/ThemeProvider';
import { SessionProvider } from '../components/providers/SessionProvider';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { validateSessionToken } from '@/lib/auth';
import './globals.css';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Dynamic Job Finder',
  description:
    'Our web platform integrates seamlessly with Discord to connect our community, enhancing your experience as you search for and post job opportunities online.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await validateSessionToken();
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body className={`${GeistSans.className} bg-light dark:bg-dark`}>
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
                  <main className="md:px-18 flex-center min-h-[calc(100vh-6rem)] flex-col gap-2 px-4 py-10 sm:px-14 lg:px-44 xl:px-64">
                    {children}
                  </main>
                </NextUIProvider>
              </SessionProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
