import Link from "next/link"
import { UserNav } from "@/components/user-nav"

export function MainNav() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Libya Auto
          </span>
        </Link>
        <nav className="mx-6 flex items-center space-x-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link 
            href="/new-cars" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            New Cars
          </Link>
          <Link 
            href="/used-cars" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Used Cars
          </Link>
          <Link 
            href="/importers" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Importers
          </Link>
          <Link 
            href="/contact" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  )
}