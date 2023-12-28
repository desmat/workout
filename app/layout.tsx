import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import Alert from '@/app/_components/Alert';
import Auth from '@/app/_components/Auth'
import Nav from '@/app/_components/Nav'
import User from '@/app/_components/User'
import Prefetch from './_components/Prefetch';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Workout',
  description: 'AI-powered workout app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col lg:flex-row">
          <Nav />
          <div className="_bg-blue-500 ml-0 mt-10 lg:ml-32 lg:mt-0 w-screen min-h-[calc(100dvh-2.5rem)] lg:min-h-screen">
            {children}
          </div>
        </div>
      </body>
      <Auth />
      <User />
      <Analytics />
      <Alert />
      <Prefetch />
    </html>
  )
}
