"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const { logout, user } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    // No need to redirect, the protected route component will handle it
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
            <span>Admin Dashboard</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium">Welcome, {user.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 