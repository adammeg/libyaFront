"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatImagePath } from "@/utils/image-helpers"

interface Brand {
  _id: string
  name: string
  logo: string
}

export default function NewCarsPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/brands/all-brands")
        setBrands(response.data)
      } catch (error: any) {
        console.error("Error fetching brands:", error)
        setError("Failed to load brands. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // Filter brands based on search query
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse New Car Brands</h1>
            <p className="text-muted-foreground">
              Explore vehicles from leading manufacturers available in Tunisia
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {filteredBrands.length === 0 ? (
                <div className="text-center py-20">
                  <p>No brands found matching your search.</p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredBrands.map((brand) => (
                    <Link 
                      key={brand._id} 
                      href={`/new-cars/${brand.name.toLowerCase()}`}
                    >
                      <div className="bg-white border rounded-lg p-6 h-40 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-primary">
                        <div className="h-20 w-20 flex items-center justify-center mb-4">
                          <img
                            src={formatImagePath(brand.logo)}
                            alt={`${brand.name} logo`}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg?height=60&width=60&text=Logo";
                            }}
                          />
                        </div>
                        <span className="text-center font-medium">
                          {brand.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}