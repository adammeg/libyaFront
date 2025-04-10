"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: "layout-dashboard",
  },
  {
    title: "Vehicles",
    href: "/admin/cars-list",
    icon: "car",
  },
  {
    title: "Add Vehicle",
    href: "/admin/cars",
    icon: "plus-circle",
  },
  {
    title: "Brands",
    href: "/admin/brands-list",
    icon: "list",
  },
  {
    title: "Add Brands",
    href: "/admin/brands",
    icon: "plus-circle",
  },
  {
    title: "Importers",
    href: "/admin/importers-list",
    icon: "list",
  },
  {
    title: "Add Importers",
    href: "/admin/importers",
    icon: "plus-circle",
  },
  {
    title: "Hero Slides",
    href: "/admin/hero-slides",
    icon: "image",
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: "file-text",
  },
  {
    title: "New Blog Post",
    href: "/admin/blog/new",
    icon: "plus-circle",
  },
]

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/" className="flex items-center space-x-2 ml-2">
              <Icons.car className="h-6 w-6" />
              <span className="font-bold">Libya Auto Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <>
                <span className="text-sm font-medium hidden md:inline-block">
                  Welcome, {user.username}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline-block">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Mobile sidebar toggle */}
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Sidebar for mobile and desktop */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-full max-w-xs transform overflow-y-auto border-r bg-white px-4 py-4 transition duration-200 ease-in-out md:static md:translate-x-0 md:max-w-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="space-y-2 pt-14 md:pt-0">
            <ul className="space-y-2">
              {sidebarNavItems.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem 
                    item={item} 
                    onClick={() => setSidebarOpen(false)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex w-full flex-col overflow-hidden pt-6 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarNavItem({ 
  item, 
  onClick 
}: { 
  item: { href: string; title: string; icon: string };
  onClick?: () => void;
}) {
  const Icon = Icons[item.icon as keyof typeof Icons]
  return (
    <Link
      href={item.href}
      className="flex items-center space-x-3 rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100"
      onClick={onClick}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{item.title}</span>
    </Link>
  )
} 