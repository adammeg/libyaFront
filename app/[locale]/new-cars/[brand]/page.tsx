"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Loader2, ArrowLeft, Filter, ChevronDown } from "lucide-react"
import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatImagePath } from "@/utils/image-helpers"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useTranslation from "next-translate/useTranslation"

interface Brand {
  _id: string
  name: string
  logo: string
}

interface Car {
  _id: string
  model: string
  type: string
  price: string
  description: string
  photos: string[]
  brands: Brand[] | string[]
  importer: any
}

export default function BrandDetailPage() {
  const { t } = useTranslation("cars")
  const params = useParams()
  const router = useRouter()
  const brandName = params?.brand as string
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string>("newest")

  useEffect(() => {
    const fetchBrandAndCars = async () => {
      try {
        setLoading(true)
        
        console.log("Fetching brand data for:", brandName)
        
        // First, find the brand by name
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const brandsResponse = await axios.get(`${apiBaseUrl}/brands/all-brands`)
        console.log("All brands response:", brandsResponse.data)
        
        const foundBrand = brandsResponse.data.find(
          (b: Brand) => b.name.toLowerCase() === brandName.toLowerCase()
        )
        
        console.log("Found brand:", foundBrand)
        
        if (!foundBrand) {
          setError(`Brand "${brandName}" not found`)
          setLoading(false)
          return
        }
        
        setBrand(foundBrand)
        
        // Then, fetch cars for this brand
        // We need to fetch from the cars endpoint with a brand filter
        const carsResponse = await axios.get(`${apiBaseUrl}/cars`, {
          params: { brand: foundBrand._id }
        })
        console.log("Cars for brand:", carsResponse.data)
        setCars(carsResponse.data)
      } catch (error: any) {
        console.error("Error fetching brand data:", error)
        setError(error.response?.data?.message || "Failed to load brand data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (brandName) {
      fetchBrandAndCars()
    }
  }, [brandName])

  // Sort cars based on selected option
  const sortedCars = [...cars].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price)
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price)
      case "name-asc":
        return a.model.localeCompare(b.model)
      case "name-desc":
        return b.model.localeCompare(a.model)
      case "newest":
      default:
        return 0 // Assuming the API already returns newest first
    }
  })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-10">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => router.push("/new-cars")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("brand.back")}
          </Button>

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
                onClick={() => router.push("/new-cars")}
              >
                Return to Brands
              </Button>
            </div>
          ) : brand ? (
            <>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
                <div className="w-32 h-32 flex items-center justify-center bg-white rounded-lg border p-4">
                  <img
                    src={formatImagePath(brand.logo)}
                    alt={`${brand.name} logo`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?height=100&width=100&text=Logo";
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{brand.name}</h1>
                  <p className="text-muted-foreground mt-2">
                    {t("brand.browse").replace("{brand}", brand.name)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  {cars.length} {cars.length === 1 ? t("brand.model") : t("brand.models")}
                </p>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {t("brand.sort")}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortOption("newest")}>
                      {t("brand.sort.newest")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("price-low")}>
                      {t("brand.sort.priceLow")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("price-high")}>
                      {t("brand.sort.priceHigh")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-asc")}>
                      {t("brand.sort.nameAsc")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-desc")}>
                      {t("brand.sort.nameDesc")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {sortedCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCars.map((car) => (
                    <Link key={car._id} href={`/vehicles/${car._id}`}>
                      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={formatImagePath(car.photos[0])}
                            alt={car.model}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=300&text=No+Image";
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-lg font-semibold">{car.model}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{car.type}</p>
                          <p className="font-bold text-primary">{car.price} TND</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-lg">
                  <p>{t("brand.noCars")}</p>
                  <p className="text-muted-foreground mt-2">{t("brand.checkBack")}</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
      <Footer locale={params?.locale as string} />
    </div>
  )
}