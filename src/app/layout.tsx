import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { metadata as siteMetadata } from './metadata';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description,
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
