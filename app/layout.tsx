import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import SmoothScroll from '../components/SmoothScroll'
import MagneticCursor from '../components/UI/MagneticCursor'
import Preloader from '../components/UI/Preloader'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['SOFT', 'WONK', 'opsz'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
})

export const metadata: Metadata = {
  title: 'Adam Bytniewski — Buduję rzeczy z AI',
  description:
    'Portfolio Adama Bytniewskiego — cinematic web, automatyzacje n8n, second brain, AI video, foto i muzyka. Aktualizowane na bieżąco z każdą nową realizacją.',
  authors: [{ name: 'Adam Bytniewski' }],
  metadataBase: new URL('https://redmind.pl'),
  openGraph: {
    title: 'Adam Bytniewski — Buduję rzeczy z AI',
    description:
      'Cinematic web · Automatyzacje · Second Brain · AI media.',
    type: 'website',
    locale: 'pl_PL',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pl"
      className={`${fraunces.variable} ${mono.variable} ${grotesk.variable}`}
    >
      <body className="font-mono antialiased">
        <Preloader />
        <MagneticCursor />
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
