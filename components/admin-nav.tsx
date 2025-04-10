"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, X, Globe } from "lucide-react"
import useTranslation from "next-translate/useTranslation" 
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import setLanguage from "next-translate/setLanguage"

export function AdminNav() {
  const { logout, user } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { t, lang } = useTranslation("admin")

  const handleLogout = () => {
    logout()
  }

  const handleLanguageChange = async (newLang: string) => {
    // Change the language without changing the URL
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
    await setLanguage(newLang)
  }

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <span>{t("dashboard")}</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={lang === 'ar' ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => handleLanguageChange('ar')}>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium">
                {lang === 'ar' ? 'مرحباً، ' : 'Welcome, '}{user.username}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 