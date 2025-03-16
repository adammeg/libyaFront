"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { ChevronLeft, ChevronRight, Car, Loader2, MapPin, Phone, Mail, Calendar, Tag, Info, DollarSign, X, Maximize2 } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatImagePath } from "@/utils/image-helpers"
import { toast } from "@/components/ui/use-toast"

// Define interfaces for our data types
interface Brand {
  _id: string
  name: string
  logo: string
}

interface Importer {
  _id: string
  name: string
  address: string
  telephone: string
  email: string
  profileImage: string | null
}

interface Car {
  _id: string
  brands: Brand[]
  model: string
  type: string
  photos: string[]
  price: string
  description: string
  importer: Importer
  createdAt: string
  updatedAt: string
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [similarCars, setSimilarCars] = useState<Car[]>([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await axios.get(`http://localhost:5000/cars/${params?.id}`)
        setCar(response.data)
      } catch (error: any) {
        console.error("Error fetching car details:", error)
        setError(error.response?.data?.message || "Failed to load vehicle details. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load vehicle details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      fetchCarDetails()
    }
  }, [params?.id])

  useEffect(() => {
    const fetchSimilarCars = async () => {
      if (!car) return;
      
      try {
        setLoadingSimilar(true);
        const response = await axios.get(`http://localhost:5000/cars/${params?.id}/similar`);
        setSimilarCars(response.data);
      } catch (error) {
        console.error("Error fetching similar cars:", error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    if (car) {
      fetchSimilarCars();
    }
  }, [car, params?.id]);

  // Format price
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 0,
    }).format(Number(price))
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.clientWidth
      sliderRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      })
    }
  }

  const nextSlide = () => {
    if (!car) return
    const newIndex = currentSlide === car.photos.length - 1 ? 0 : currentSlide + 1
    goToSlide(newIndex)
  }

  const prevSlide = () => {
    if (!car) return
    const newIndex = currentSlide === 0 ? car.photos.length - 1 : currentSlide - 1
    goToSlide(newIndex)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSlide, car])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold">Loading vehicle details...</h2>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="container py-12">
        <div className="text-center p-8 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Vehicle not found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The vehicle you're looking for could not be found."}
          </p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
    <SiteHeader />
    <div className="container py-12">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to results
        </Button>
        <h1 className="text-3xl font-bold">{car.model}</h1>
        <div className="flex items-center mt-2 text-muted-foreground">
          {car.brands.map((brand, index) => (
            <span key={brand._id}>
              {brand.name}
              {index < car.brands.length - 1 ? ", " : ""}
            </span>
          ))}
          <span className="mx-2">•</span>
          <span>{car.type || "Sedan"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <div 
                  ref={sliderRef}
                  className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {car.photos && car.photos.length > 0 ? (
                    car.photos.map((photo, index) => (
                      <div 
                        key={index} 
                        className="min-w-full h-[400px] md:h-[500px] relative snap-center"
                      >
                        <img
                          src={formatImagePath(photo)}
                          alt={`${car.model} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.classList.add('bg-muted', 'flex', 'items-center', 'justify-center');
                              const icon = document.createElement('div');
                              icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
                              parent.appendChild(icon);
                            }
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="min-w-full h-[400px] md:h-[500px] bg-muted flex items-center justify-center">
                      <Car className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {car.photos && car.photos.length > 1 && (
                  <>
                    <button 
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                
                {car.photos && car.photos.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {currentSlide + 1} / {car.photos.length}
                  </div>
                )}

                <button 
                  onClick={toggleFullscreen}
                  className="absolute top-4 right-4 bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur-sm"
                  aria-label="View fullscreen gallery"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
              
              {car.photos && car.photos.length > 1 && (
                <div className="flex overflow-x-auto gap-2 p-4 bg-muted/20">
                  {car.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        currentSlide === index ? 'border-primary' : 'border-transparent'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <img
                        src={formatImagePath(photo)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.classList.add('bg-muted', 'flex', 'items-center', 'justify-center');
                            const icon = document.createElement('div');
                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
                            parent.appendChild(icon);
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Details */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{car.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Tag className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Price</h4>
                        <p className="text-muted-foreground">{formatPrice(car.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Listed On</h4>
                        <p className="text-muted-foreground">{formatDate(car.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="specifications" className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Type</h4>
                        <p className="text-muted-foreground">{car.type || "Sedan"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Tag className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Brand</h4>
                        <p className="text-muted-foreground">
                          {car.brands.map(brand => brand.name).join(", ")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Price</h4>
                        <p className="text-muted-foreground">{formatPrice(car.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Last Updated</h4>
                        <p className="text-muted-foreground">{formatDate(car.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-primary">{formatPrice(car.price)}</h3>
              <p className="text-sm text-muted-foreground mt-1">Price includes taxes & fees</p>
              
              <div className="mt-6 space-y-4">
                <Button className="w-full">Contact Dealer</Button>
                <Button variant="outline" className="w-full">Schedule Test Drive</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Dealer Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Dealer Information</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                {car.importer.profileImage ? (
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <img
                      src={formatImagePath(car.importer.profileImage)}
                      alt={car.importer.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.classList.add('bg-muted', 'flex', 'items-center', 'justify-center');
                          const icon = document.createElement('div');
                          icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                          parent.appendChild(icon);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-8 w-8 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold">{car.importer.name}</h4>
                  <p className="text-sm text-muted-foreground">Official Dealer</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-sm text-muted-foreground">{car.importer.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-sm text-muted-foreground">{car.importer.telephone}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">{car.importer.email}</p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Link href={`/dealers/${car.importer._id}`} className="text-primary text-sm font-medium hover:underline">
                View all vehicles from this dealer
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Similar Vehicles</h2>
        
        {loadingSimilar ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : similarCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarCars.map((similarCar) => (
              <Link href={`/vehicles/${similarCar._id}`} key={similarCar._id}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="relative aspect-video">
                    {similarCar.photos && similarCar.photos.length > 0 ? (
                      <div className="relative h-full w-full">
                        <img
                          src={formatImagePath(similarCar.photos[0])}
                          alt={similarCar.model}
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
                    <h3 className="text-lg font-semibold mb-1">{similarCar.model}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">
                        {Array.isArray(similarCar.brands) &&
                          similarCar.brands.map((brand: any, index: number) => (
                            <span key={index}>
                              {typeof brand === "object" ? brand.name : "Unknown"}
                              {index < similarCar.brands.length - 1 ? ", " : ""}
                            </span>
                          ))}
                      </div>
                      <div className="text-primary font-semibold">
                        {formatPrice(similarCar.price)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No similar vehicles found.</p>
        )}
      </div>
    </div>

    {isFullscreen && (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">{car.model} - Gallery</h3>
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-muted rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 relative">
          <div 
            className="flex h-full overflow-x-hidden snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {car.photos.map((photo, index) => (
              <div 
                key={index} 
                className="min-w-full h-full relative snap-center flex items-center justify-center"
              >
                <img
                  src={formatImagePath(photo)}
                  alt={`${car.model} - Image ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Slide Counter */}
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
            {currentSlide + 1} / {car.photos.length}
          </div>
        </div>
        <div className="p-4 border-t overflow-x-auto">
          <div className="flex gap-2">
            {car.photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border-2 ${
                  currentSlide === index ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img
                  src={formatImagePath(photo)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  )
} 