import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SplashScreen } from '@/components/SplashScreen'
import { AnalysisChecker } from '@/components/AnalysisChecker'
import { AuthProvider } from '@/components/auth/AuthContext'
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gymsaverapp.com'),
  title: {
    default: 'GymSaver | Compare Gym Prices, Find Deals & Save Money',
    template: '%s | GymSaver'
  },
  description: 'Compare gym prices across the UK. One search to find the best gym deals, membership prices, and fitness offers near you. Save money on your next gym membership with GymSaver.',
  keywords: ['gym prices', 'compare gyms', 'gym deals', 'uk gyms', 'fitness memberships', 'cheap gyms', 'gym saver'],
  authors: [{ name: 'GymSaver Team' }],
  creator: 'GymSaver',
  publisher: 'GymSaver',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'GymSaver | Compare Gym Prices & Save Money',
    description: 'Find the best gym deals and membership prices near you. One search, every price, zero over-paying.',
    url: 'https://www.gymsaverapp.com',
    siteName: 'GymSaver',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'GymSaver - Compare Gym Prices',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GymSaver | Compare Gym Prices & Save Money',
    description: 'Find the best gym deals and membership prices near you. Save money with GymSaver.',
    images: ['/opengraph-image.png'],
    creator: '@gymsaverapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import { BotGuard } from '@/components/BotGuard'
import { JsonLd } from '@/components/JsonLd'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <BotGuard>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <JsonLd />
              <SplashScreen />
              <AnalysisChecker />
              {children}
              {/* <Analytics /> */}
            </ThemeProvider>
          </BotGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
