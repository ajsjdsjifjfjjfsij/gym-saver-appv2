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
  title: 'GymSaver - Find & Save Gyms Near You',
  description: 'gymsaver one search, every price, zero over paying',
  generator: 'v0.app',
  openGraph: {
    title: 'GymSaver - Compare Gym Prices & Save Money',
    description: 'gymsaver one search, every price, zero over paying',
    url: 'https://www.gymsaverapp.com',
    siteName: 'GymSaver',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'GymSaver App Preview',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GymSaver - Compare Gym Prices & Save Money',
    description: 'gymsaver one search, every price, zero over paying',
    images: ['/opengraph-image.png'],
  },
}

import { BotGuard } from '@/components/BotGuard'

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
