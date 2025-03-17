"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import { Loader2, Car } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatImagePath } from "@/utils/image-helpers"

// Define interfaces for our data types
interface Brand {
  _id: string
  name: string
  logo: string
}

interface Importer {
  _id: string
  name: string
}

interface CarData {
  _id: string
  brands: Brand[] | string[]
  model: string
  photos: string[]
  price: string
  description: string
  importer: Importer | string
  createdAt: string
  updatedAt: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [cars, setCars] = useState<CarData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Get search parameters
  const type = searchParams?.get("type") || null
  const brand = searchParams?.get("brand") || null
  const model = searchParams?.get("model") || null

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        // Check if we have any search parameters
        const hasSearchParams = type || brand || model

        if (!hasSearchParams) {
          // If no search parameters, fetch all cars
          console.log("No search parameters provided, fetching all cars")
          const response = await axios.get(`${apiBaseUrl}/cars/all-cars`)
          setCars(response.data)
          return
        }

        // Build query parameters for the API request
        const params: Record<string, string> = {}
        if (type && type !== "all-types") params.type = type
        if (brand && brand !== "all-makes") params.brand = brand
        if (model && model !== "all-models") params.model = model

        console.log("Fetching search results with params:", params)

        const response = await axios.get(`${apiBaseUrl}/cars/search`, { params })
        console.log("Search response:", response.data)
        setCars(response.data)
      } catch (error: any) {
        console.error("Error fetching search results:", error)
        setError(error.response?.data?.message || "Failed to load search results. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [type, brand, model])

  // Format price
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DL",
      minimumFractionDigits: 0,
    }).format(Number(price))
  }

  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center p-8 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No vehicles found</h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria to find more results.
            </p>
            <Button onClick={() => window.history.back()}>
              Back to Search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Link href={`/vehicles/${car._id}`} key={car._id}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="relative aspect-video">
                    {car.photos && car.photos.length > 0 ? (
                      <div className="relative h-full w-full">
                        <img
                          src={formatImagePath(car.photos[0])}
                          alt={car.model}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Hide the image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                            // Show the fallback div
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.fallback-icon');
                              if (fallback) fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        <div className="fallback-icon hidden absolute inset-0 bg-muted flex items-center justify-center">
                          <Car className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Car className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{car.model}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">
                        {Array.isArray(car.brands) &&
                          car.brands.map((brand: any, index: number) => (
                            <span key={index}>
                              {typeof brand === "object" ? brand.name : "Unknown"}
                              {index < car.brands.length - 1 ? ", " : ""}
                            </span>
                          ))}
                      </div>
                      <div className="text-primary font-semibold">
                        {formatPrice(car.price)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {car.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
} 