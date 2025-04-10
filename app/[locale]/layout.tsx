import { Metadata } from "next"
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google"
import "../globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
})

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
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
  const isRtl = params.locale === "ar"
  
  return (
    <html lang={params.locale} dir={isRtl ? "rtl" : "ltr"}>
      <body className={`${inter.variable} ${arabic.variable} ${isRtl ? "font-arabic" : "font-sans"}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
} 