"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { locales } from "@/middleware" // Import from middleware

export function LanguageSwitcher() {
  const router = useRouter()
  
  // Get current locale from URL
  const [currentLocale, setCurrentLocale] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.split('/')
      const localeInPath = path[1]
      return locales.includes(localeInPath) ? localeInPath : 'ar'
    }
    return 'ar'
  })

  const switchLanguage = (newLocale: string) => {
    // Only proceed if it's a different locale
    if (newLocale === currentLocale) return
    
    // 1. Set cookie for middleware to detect on next request
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000` // 1 year
    
    // 2. Get current path and replace locale segment
    const path = window.location.pathname
    const newPath = path.replace(/^\/[^\/]+/, `/${newLocale}`) || `/${newLocale}`
    
    // 3. Update state
    setCurrentLocale(newLocale)
    
    // 4. Navigate
    window.location.href = newPath
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLocale === "ar" ? "العربية" : "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={currentLocale === "ar" ? "start" : "end"}>
        <DropdownMenuItem onClick={() => switchLanguage("ar")}>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLanguage("en")}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}