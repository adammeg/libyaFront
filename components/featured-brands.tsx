"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { formatImagePath } from "@/utils/image-helpers"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface Brand {
  _id: string
  name: string
  logo: string
}

// Define props interface for FeaturedBrands
interface FeaturedBrandsProps {
  title: string;
  viewAllLabel: string;
}

export function FeaturedBrands({ title, viewAllLabel }: FeaturedBrandsProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await axios.get(`${apiBaseUrl}/brands/all-brands`)
        console.log("Brands data:", response.data)
        const activeBrands = response.data.filter((brand: { isActive?: boolean }) => brand.isActive !== false)
        setBrands(activeBrands.slice(0, 5))
        setError(null)
      } catch (error: any) {
        console.error("Error fetching brands:", error)
        setError(error.message || "Failed to load brands" as any)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <Button variant="ghost" asChild>
            <Link href="/new-cars" className="flex items-center">
              {viewAllLabel}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <Link 
              key={brand._id} 
              href={`/new-cars/${brand.name.toUpperCase()}`}
              className="group"
            >
              <div className="bg-white border rounded-lg p-4 h-32 flex flex-col items-center justify-center transition-all hover:shadow-md hover:border-primary">
                <div className="h-16 w-16 flex items-center justify-center mb-2">
                  <img
                    src={formatImagePath(brand.logo)}
                    alt={`${brand.name} logo`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?height=60&width=60&text=Logo";
                    }}
                  />
                </div>
                <span className="text-center text-sm font-medium group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}