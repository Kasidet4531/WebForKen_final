import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { TopNavigation } from "@/components/top-navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WebSocket Controller",
  description: "Mobile-first WebSocket control interface",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LayoutWrapper>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <TopNavigation />
              <main className="pt-16 pb-20">{children}</main>
              <BottomNavigation />
              <Toaster position="top-center" />
            </div>
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
