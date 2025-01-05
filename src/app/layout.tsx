import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { metadata as siteMetadata } from './metadata';

export const metadata: Metadata = siteMetadata;

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.className}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
