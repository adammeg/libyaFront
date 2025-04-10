"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import useTranslation from "next-translate/useTranslation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const router = useRouter()
  const params = useParams() as { locale: string }
  const { lang } = useTranslation()

  const handleLanguageChange = (newLang: string) => {
    // Get the current path without the locale
    const currentPath = window.location.pathname
    const pathWithoutLocale = currentPath.replace(/^\/[^\/]+/, '')
    
    // Navigate to the new locale path
    router.push(`/${newLang}${pathWithoutLocale}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {lang === "ar" ? "العربية" : "English"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={lang === "ar" ? "start" : "end"}>
        <DropdownMenuItem onClick={() => handleLanguageChange("ar")}>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}