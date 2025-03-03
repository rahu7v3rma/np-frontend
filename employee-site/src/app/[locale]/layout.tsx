import { NextUIProvider } from '@nextui-org/react';
import type { Metadata } from 'next';
import { Assistant, Public_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import { ToastContainer } from 'react-toastify';

import { I18nProviderClient } from '@/locales/client';
import { getCurrentLocale } from '@/locales/server';

import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

const assistant = Assistant({
  subsets: ['latin'],
  variable: '--font-assistant',
});
const sans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nicklas',
    description: 'Nicklas',
    // dynamically get the host from the request headers
    metadataBase: new URL(`https://${headers().get('host')}`),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = getCurrentLocale();

  return (
    <html
      lang={locale}
      dir={locale === 'he' ? 'rtl' : 'ltr'}
      className={`${assistant.variable} ${sans.variable}`}
    >
      <body
        className={`overflow-hidden	 ${locale === 'he' ? assistant.className : sans.className}`}
      >
        <I18nProviderClient locale={locale}>
          <NextUIProvider
            id="nextUIProvider"
            className="overflow-auto h-screen"
          >
            {children}
            <ToastContainer theme="dark" />
          </NextUIProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
