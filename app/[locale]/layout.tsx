import { Metadata } from "next"
import { Inter } from "next/font/google"
import { IBM_Plex_Sans_Arabic } from "next/font/google"
import "../globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
})

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
})

export const metadata: Metadata = {
  title: "Libya Auto",
  description: "Your trusted source for vehicles in Libya",
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Add error catching
  try {
    const isRtl = params.locale === "ar"
    
    return (
      <html 
        lang={params.locale} 
        dir={isRtl ? "rtl" : "ltr"}
        className={`${inter.variable} ${ibmPlexSansArabic.variable}`}
      >
        <body className={isRtl ? "font-arabic" : "font-sans"}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </body>
      </html>
    )
  } catch (error) {
    console.error("Layout error:", error)
    // Return a simple fallback layout
    return (
      <html>
        <body>
          <h1>An error occurred in the layout</h1>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </body>
      </html>
    )
  }
} 