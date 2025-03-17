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
    console.log("Search params:", { type, brand, model });
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        setCars([]); // Clear existing cars to prevent render errors
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Check if we have any search parameters
        const hasSearchParams = type || brand || model;

        let response;
        
        if (!hasSearchParams) {
          // If no search parameters, fetch all cars
          console.log("No search parameters provided, fetching all cars");
          response = await axios.get(`${apiBaseUrl}/cars/all-cars`);
        } else {
          // Build query parameters for the API request
          const params: Record<string, string> = {};
          if (type && type !== "all-types") params.type = type;
          if (brand && brand !== "all-makes") params.brand = brand;
          if (model && model !== "all-models") params.model = model;

          console.log("Fetching search results with params:", params);
          response = await axios.get(`${apiBaseUrl}/cars/search`, { params });
        }
        
        console.log("Search response:", response.data);
        
        // Validate the response data
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format: expected an array");
        }
        
        setCars(response.data);
      } catch (error: any) {
        console.error("Error fetching search results:", error);
        setError(error.response?.data?.message || "Failed to load search results. Please try again.");
        setCars([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [type, brand, model]);

  // Format price with error handling
  const formatPrice = (price: string | number | undefined) => {
    if (!price) return "Price on Request";
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) return "Price on Request";
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DL",
      minimumFractionDigits: 0,
    }).format(numericPrice);
  }

  console.log("Rendering with cars:", cars);

  return (
    <>
      <SiteHeader />
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <div className="flex flex-wrap gap-2">
            {type && (
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                Type: {type}
              </div>
            )}
            {brand && (
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                Brand: {brand}
              </div>
            )}
            {model && (
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                Model: {model}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p>Loading vehicles...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-500">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p>No vehicles found matching your criteria.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/search">Clear Filters</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Link key={car._id} href={`/vehicles/${car._id}`} className="block">
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      <img
                        src={car.photos && car.photos.length > 0 
                          ? formatImagePath(car.photos[0]) 
                          : "/placeholder.svg?height=320&width=480&text=No+Image"}
                        alt={car.model || "Car"}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg?height=320&width=480&text=Error+Loading+Image";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold truncate">{car.model || "Unknown Model"}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span className="line-clamp-1">
                          {car.brands && car.brands.length > 0 && typeof car.brands[0] === 'object' 
                            ? car.brands[0].name 
                            : "Unknown Brand"}
                        </span>
                      </div>
                      <div className="mt-2 font-semibold text-lg">
                        {car.price ? formatPrice(car.price) : "Price on Request"}
                      </div>
                    </div>
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