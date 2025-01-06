import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { metadata as siteMetadata } from './metadata'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: siteMetadata.title,
  description: siteMetadata.description
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.className}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
