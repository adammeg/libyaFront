import Link from "next/link"
import { Search, Globe, Menu } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-20 items-center">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LIBYA
              <span className="text-secondary"> AUTO</span>
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 items-center justify-between space-x-6">
          <div className="flex items-center space-x-6">
            <Link href="/new-cars" className="text-sm font-medium transition-colors hover:text-primary">
              NEW CARS
            </Link>
            <Link href="/used-cars" className="text-sm font-medium transition-colors hover:text-primary">
              USED CARS
            </Link>
            <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
              NEWS
            </Link>
            <Link href="/dealers" className="text-sm font-medium transition-colors hover:text-primary">
              DEALERS
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 w-[200px]" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem className="arabic">العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button>Log In</Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

