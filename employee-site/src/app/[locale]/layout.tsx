import { NextUIProvider } from '@nextui-org/react';
import type { Metadata } from 'next';
import { Assistant, Public_Sans } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Nicklas',
  description: 'Nicklas',
};

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
      <body className={locale === 'he' ? assistant.className : sans.className}>
        <I18nProviderClient locale={locale}>
          <NextUIProvider>
            {children}
            <ToastContainer theme="dark" />
          </NextUIProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
