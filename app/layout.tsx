import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SplashScreen } from '@/components/SplashScreen'
import { AnalysisChecker } from '@/components/AnalysisChecker'
import { AuthProvider } from '@/components/auth/AuthContext'
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gymsaverapp.com'),
  title: {
    default: 'GymSaver | Compare Gym Prices, Find Deals & Save Money in the UK',
    template: '%s | GymSaver'
  },
  description: 'Compare gym prices and memberships across the UK. One search to find the best gym deals, 24-hour fitness centers, and cheap gym offers near you. Stop overpaying for your gym membership with GymSaver.',
  keywords: ['gym prices', 'compare gyms', 'gym deals', 'uk gyms', 'fitness memberships', 'cheap gyms', 'gym saver', 'find a gym', 'gym locator'],
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
    description: 'Find the best gym deals and membership prices near you. Compare PureGym, The Gym Group, JD Gyms, and more in one place. Zero over-paying.',
    url: 'https://www.gymsaverapp.com',
    siteName: 'GymSaver',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'GymSaver - Compare UK Gym Prices',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GymSaver | Compare Gym Prices & Save Money',
    description: 'Find the best gym deals and membership prices near you in the UK. Stop overpaying with GymSaver.',
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
import { InAppBrowserPrompt } from '@/components/InAppBrowserPrompt'
import { headers } from 'next/headers'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let userAgent = "";
  let isSearchEngine = false;

  if (!process.env.CAPACITOR_BUILD) {
    try {
      const headersList = await headers()
      userAgent = headersList.get('user-agent') || ''
      const { isSearchEngineBot } = require('@/lib/bot-detection')
      isSearchEngine = isSearchEngineBot(userAgent)
    } catch (e) {
      console.warn("Headers not available during static build/prerender.");
    }
  }

  const content = (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <JsonLd />
      <AnalysisChecker />
      {children}
      {/* <Analytics /> */}
    </ThemeProvider>
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <SplashScreen />
          <InAppBrowserPrompt />
          {isSearchEngine ? content : (
            <BotGuard serverBotDetected={isSearchEngine}>
              {content}
            </BotGuard>
          )}
        </AuthProvider>
      </body>
    </html>
  )
}
