import Link from "next/link"
import { Car, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6" />
              <span className="font-bold">AutoMobile TN</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted source for quality vehicles in Tunisia. Find the perfect car for your needs.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Search Vehicles
                </Link>
              </li>
              <li>
                <Link href="/dealers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dealers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Vehicle Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search?type=SEDAN" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sedans
                </Link>
              </li>
              <li>
                <Link href="/search?type=SUV" className="text-muted-foreground hover:text-foreground transition-colors">
                  SUVs
                </Link>
              </li>
              <li>
                <Link href="/search?type=PICKUP" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pickup Trucks
                </Link>
              </li>
              <li>
                <Link href="/search?type=COMPACT" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compact Cars
                </Link>
              </li>
              <li>
                <Link href="/search?type=COUPE" className="text-muted-foreground hover:text-foreground transition-colors">
                  Coupes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <address className="not-italic text-sm text-muted-foreground space-y-2">
              <p>123 Auto Street</p>
              <p>Tunis, Tunisia</p>
              <p>Email: info@automobiletn.com</p>
              <p>Phone: +216 71 123 456</p>
            </address>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AutoMobile TN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 