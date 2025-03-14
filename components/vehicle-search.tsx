"use client"

import { useState, useEffect } from "react"
import { Car, Truck, ShieldCheck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

// Define interfaces for our data types
interface Brand {
  _id: string
  name: string
  logo: string
}

interface CarModel {
  _id: string
  model: string
  brands: Brand[] | string[]
}

const vehicleTypes = [
  { icon: Car, label: "SEDAN", value: "SEDAN" },
  { icon: Car, label: "SUV", value: "SUV" },
  { icon: Truck, label: "PICKUP", value: "PICKUP" },
  { icon: Car, label: "BERLIN", value: "BERLIN" },
  { icon: Car, label: "COMPACT", value: "COMPACT" },
  { icon: Car, label: "COUPE", value: "COUPE" },
  { icon: Car, label: "CABRIOLET", value: "CABRIOLET" },
  { icon: Car, label: "MONOSPACE", value: "MONOSPACE" },
]

export function VehicleSearch() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<CarModel[]>([])
  const [filteredModels, setFilteredModels] = useState<CarModel[]>([])
  const [loading, setLoading] = useState(false)
  const [brandsLoading, setBrandsLoading] = useState(true)

  // Fetch all brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true)
        const response = await axios.get("http://localhost:5000/brands/all-brands")
        setBrands(response.data)
      } catch (error) {
        console.error("Error fetching brands:", error)
        toast({
          title: "Error",
          description: "Failed to load brands. Please try again.",
          variant: "destructive",
        })
      } finally {
        setBrandsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // Fetch all car models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("http://localhost:5000/cars/all-cars")
        // Extract unique models from cars
        const uniqueModels = Array.from(
          new Set(response.data.map((car: any) => car.model))
        ).map(model => {
          const car = response.data.find((c: any) => c.model === model)
          return {
            _id: car._id,
            model: String(model || `model-${car._id}`), // Ensure model is a non-empty string
            brands: car.brands
          }
        })
        
        // Filter out any models with empty strings
        const validModels = uniqueModels.filter(model => model.model.trim() !== '')
        
        setModels(validModels)
      } catch (error) {
        console.error("Error fetching models:", error)
      }
    }

    fetchModels()
  }, [])

  // Filter models when brand changes
  useEffect(() => {
    if (selectedBrand) {
      const filtered = models.filter(model => {
        // Check if any of the model's brands match the selected brand
        return model.brands.some((brand: any) => {
          const brandId = typeof brand === 'object' ? brand._id : brand
          return brandId === selectedBrand
        })
      })
      setFilteredModels(filtered)
    } else {
      setFilteredModels(models)
    }
  }, [selectedBrand, models])

  // Handle search button click
  const handleSearch = async () => {
    setLoading(true)
    
    // Build query parameters
    const params = new URLSearchParams()
    
    if (selectedType && selectedType !== "") {
      params.append('type', selectedType)
    }
    
    if (selectedBrand && selectedBrand !== "" && selectedBrand !== "all-makes") {
      params.append('brand', selectedBrand)
    }
    
    if (selectedModel && selectedModel !== "" && selectedModel !== "all-models") {
      params.append('model', selectedModel)
    }
    
    // Navigate to search results page
    try {
      await router.push(`/search?${params.toString()}`);
    } catch (error: unknown) {
      console.error("Navigation error:", error);
      toast({
        title: "Error",
        description: "Failed to navigate to search results. Please try again.",
          variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-12">
      <Card className="border-2">
        <CardContent className="p-6">
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="new" className="text-lg">
                NEW VEHICLES
              </TabsTrigger>
              <TabsTrigger value="used" className="text-lg">
                USED VEHICLES
              </TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.label}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-colors ${
                      selectedType === type.value ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <type.icon className="h-8 w-8 shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Make</label>
                  <Select
                    value={selectedBrand}
                    onValueChange={setSelectedBrand}
                    disabled={brandsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All makes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-makes">All makes</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={!filteredModels.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-models">All models</SelectItem>
                      {filteredModels.map((model) => (
                        <SelectItem key={model._id} value={model.model}>
                          {model.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="used" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vehicleTypes.map((type) => (
                  <button
                    key={type.label}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-colors ${
                      selectedType === type.value ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <type.icon className="h-8 w-8 shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Make</label>
                  <Select
                    value={selectedBrand}
                    onValueChange={setSelectedBrand}
                    disabled={brandsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All makes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-makes">All makes</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={!filteredModels.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-models">All models</SelectItem>
                      {filteredModels.map((model) => (
                        <SelectItem key={model._id} value={model.model}>
                          {model.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Certified Vehicles</span>
        </div>
        <div className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-primary" />
          <span>Wide Selection</span>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-primary" />
          <span>Delivery Available</span>
        </div>
      </div>
    </div>
  )
}

