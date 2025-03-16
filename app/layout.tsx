"use client"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react'
import axios from 'axios'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Libya Auto",
  description: "Your trusted source for cars in Tunisia",
}

export function BackendTester() {
  useEffect(() => {
    const testBackend = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        console.log("Testing backend connection to:", apiBaseUrl)
        const response = await axios.get(`${apiBaseUrl}/api/test`)
        console.log("Backend test response:", response.data)
      } catch (error) {
        console.error("Backend test failed:", error)
      }
    }
    
    testBackend()
  }, [])
  
  return null
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <BackendTester />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}