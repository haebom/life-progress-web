import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { metadata as siteMetadata } from './metadata';

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" className={`${inter.variable} ${inter.className}`}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
