"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { formatImagePath } from "@/utils/image-helpers"

// Define the slide interface to match your backend schema
interface HeroSlide {
  _id: string
  title: string
  description: string
  image: string
  order?: number
  isActive?: boolean
  buttonText?: string
  buttonLink?: string
}

export function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({})

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true)
        let response;
        try {
          // Try primary API endpoint
          response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/hero-slides/active-slides" || "http://localhost:5000/hero-slides/active-slides")
          console.log("API Response:", response.data)
        } catch (error) {
          // Fallback to alternative endpoint
          response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/hero-slides/all-slides" || "http://localhost:5000/hero-slides/all-slides")
          console.log("Fallback API Response:", response.data)
        }
        
        if (response.data && response.data.length > 0) {
          console.log("Setting slides with data:", response.data)
          
          // Debug logging for image paths
          response.data.forEach((slide: HeroSlide, index: number) => {
            console.log(`Slide ${index} image path:`, slide.image)
            if (slide.image) {
              console.log(`Slide ${index} transformed path:`, formatImagePath(slide.image))
            } else {
              console.warn(`Slide ${index} has no image path`)
            }
          })
          
          setSlides(response.data)
        } else {
          // If empty response, use default slide
          throw new Error("No slides returned from API")
        }
        
        setError(null)
      } catch (err) {
        console.error("Error fetching hero slides:", err)
        setError("Failed to load hero content")
        
        // Use default slides if API fails
        setSlides([
          {
            _id: "default-1",
            title: "Find Your Perfect Car",
            description: "Explore our extensive inventory of quality vehicles",
            image: "/placeholder-hero.jpg",
            buttonText: "Browse Cars",
            buttonLink: "/search"
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // Auto-slide functionality with pause on hover or focus
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 7000) // Change slide every 7 seconds

    return () => clearInterval(interval)
  }, [slides.length])

  // Navigation functions
  const goToNextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Get active slide or default
  const activeSlide = slides[currentSlide] || {
    title: "Find Your Perfect Car",
    description: "Explore our extensive inventory of quality vehicles",
    image: "/placeholder-hero.jpg",
    buttonText: "Browse Cars",
    buttonLink: "/search"
  }

  // Handle image errors
  const handleImageError = (slideId: string) => {
    console.error("Failed to load image for slide:", slideId)
    setImageLoadErrors(prev => ({ ...prev, [slideId]: true }))
  }

  return (
    <div className="relative min-h-[500px] lg:min-h-[600px] bg-background overflow-hidden">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 bg-gray-200 rounded w-3/4 max-w-md mb-6"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2 max-w-sm mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-2/5 max-w-sm mb-8"></div>
            <div className="h-10 bg-gray-200 rounded-full w-40"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Slide background */}
          <div className="absolute inset-0 bg-black z-0">
            {!imageLoadErrors[activeSlide._id] ? (
              <img
                src={formatImagePath(activeSlide.image)}
                alt={activeSlide.title || "Hero image"}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                onError={() => handleImageError(activeSlide._id)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30"></div>
          </div>
          
          {/* Content container */}
          <div className="container relative z-10 flex flex-col items-center justify-center h-full py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white transition-all duration-500 animate-fadeIn">
                {activeSlide.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto transition-all duration-500 animate-fadeIn delay-200">
                {activeSlide.description}
              </p>
              <Link href={activeSlide.buttonLink || "/search"}>
                <Button size="lg" className="gap-2 text-lg py-6 px-8 animate-fadeIn delay-300">
                  <Search className="h-5 w-5" />
                  {activeSlide.buttonText || "Search Vehicles"}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Navigation arrows - only show if more than one slide */}
          {slides.length > 1 && (
            <>
              <button 
                onClick={goToPrevSlide}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-background/50 hover:bg-background p-2 rounded-full shadow-md transition-all hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button 
                onClick={goToNextSlide}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-background/50 hover:bg-background p-2 rounded-full shadow-md transition-all hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}
          
          {/* Slide indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    currentSlide === index 
                      ? "w-10 h-2 bg-white" 
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}