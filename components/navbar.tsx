"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import useTranslation from "next-translate/useTranslation"
import { Menu, X, Search, User, Car, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, lang } = useTranslation("common")

  const routes = [
    {
      href: "/",
      label: t("navbar.home"),
      active: pathname === "/",
    },
    {
      href: "/vehicles",
      label: t("navbar.vehicles"),
      active: pathname === "/vehicles" || pathname?.startsWith("/vehicles"),
    },
    {
      href: "/blog",
      label: t("navbar.blog"),
      active: pathname?.startsWith("/blog"),
    },
    {
      href: "/contact",
      label: t("navbar.contact"),
      active: pathname === "/contact",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span className="font-bold">{lang === "ar" ? "ليبيا أوتو" : "Libya Auto"}</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  route.active ? "text-foreground" : "text-foreground/60"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden md:flex items-center">
            <LanguageSwitcher />
          </div>
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">{t("buttons.search")}</span>
          </Button>
          <Button className="hidden md:flex">
            <ShoppingBag className="mr-2 h-5 w-5" />
            {t("buttons.testDrive")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
          <div className="container py-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
            <nav className="flex flex-col space-y-6 text-lg font-medium">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    route.active ? "text-foreground" : "text-foreground/60"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
} 