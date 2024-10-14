import '@/styles/globals.css';

import { type Metadata } from 'next';
import { Nunito } from 'next/font/google';

import { TRPCReactProvider } from '@/modules/shared/infrastructure/trpc/react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import KBar from '../components/kbar';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Super Human Email',
  description: 'Super Human Email',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={nunito.className}>
        <body suppressHydrationWarning={true}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <TRPCReactProvider>
              <KBar>{children}</KBar>
            </TRPCReactProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
