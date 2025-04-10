"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, X, Loader2, Car, ArrowLeft, Save } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SiteHeader } from "@/components/site-header"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

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
  brands: Brand[] | string[]
}

interface Car {
  _id: string
  brands: Brand[] | string[]
  model: string
  type: string
  photos: string[]
  price: string
  description: string
  importer: Importer | string
}

// Define the form schema
const formSchema = z.object({
  model: z.string().min(2, {
    message: "Model must be at least 2 characters.",
  }),
  type: z.string({
    required_error: "Please select a vehicle type.",
  }),
  price: z.string().min(1, {
    message: "Price is required.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  importer: z.string({
    required_error: "Please select an importer.",
  }),
  brands: z.string({
    required_error: "Please select a brand.",
  }),
})

// Define the vehicle types
const vehicleTypes = [
  { label: "Sedan", value: "SEDAN" },
  { label: "SUV", value: "SUV" },
  { label: "Pickup", value: "PICKUP" },
  { label: "Berlin", value: "BERLIN" },
  { label: "Compact", value: "COMPACT" },
  { label: "Coupe", value: "COUPE" },
  { label: "Cabriolet", value: "CABRIOLET" },
  { label: "Monospace", value: "MONOSPACE" },
]

export default function EditCarPage() {
  const params = useParams()
  const router = useRouter()
  const carId = params?.id as string

  const [car, setCar] = useState<Car | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")

  // State for brands and importers data
  const [brands, setBrands] = useState<Brand[]>([])
  const [importers, setImporters] = useState<Importer[]>([])
  const [selectedImporterBrands, setSelectedImporterBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "",
      type: "SEDAN",
      price: "",
      description: "",
      importer: "",
      brands: "",
    },
  })

  // Fetch car, brands and importers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const [carRes, brandsRes, importersRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/cars/${carId}`),
          axios.get(`${apiBaseUrl}/brands/all-brands`),
          axios.get(`${apiBaseUrl}/importers/all-importers`)
        ])

        const carData = carRes.data
        setCar(carData)
        setBrands(brandsRes.data)
        setImporters(importersRes.data)

        // Set existing photos
        if (carData.photos && Array.isArray(carData.photos)) {
          setExistingPhotos(carData.photos)
        }

        // Set form values
        form.setValue("model", carData.model)
        form.setValue("type", carData.type || "SEDAN")
        form.setValue("price", carData.price)
        form.setValue("description", carData.description)

        // Set importer
        const importerId = typeof carData.importer === 'object' ? carData.importer._id : carData.importer
        form.setValue("importer", importerId)

        // Handle importer change to set available brands
        handleImporterChange(importerId)

        // Set brands
        const brandIds = Array.isArray(carData.brands)
          ? carData.brands.map((brand: any) => typeof brand === 'object' ? brand._id : brand)
          : []
        form.setValue("brands", brandIds.join(","))

      } catch (err) {
        console.error("Error fetching data:", err)
        toast({
          title: "Error",
          description: "Failed to load car data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [carId, form])

  // Update available brands when importer changes
  const handleImporterChange = (importerId: string) => {
    const selectedImporter = importers.find(imp => imp._id === importerId)
    if (selectedImporter) {
      // Reset selected brands when importer changes
      form.setValue("brands", "")

      // Filter brands based on the selected importer
      if (Array.isArray(selectedImporter.brands)) {
        const importerBrands = selectedImporter.brands.map(brand =>
          typeof brand === 'object' ? brand : brands.find(b => b._id === brand)
        ).filter(Boolean) as Brand[]

        setSelectedImporterBrands(importerBrands)
      }
    }
  }

  // Handle photo upload
  const handlePhotoUpload = useCallback((file: File) => {
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, WebP, or GIF).",
        variant: "destructive",
      })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    // Create a preview
    const reader = new FileReader()
    reader.onload = () => {
      setPhotosPreviews((prev) => [...prev, reader.result as string])
      setPhotos((prev) => [...prev, file])
      setIsUploading(false)
      setUploadProgress(100)

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    }
    reader.readAsDataURL(file)

    // Clear the input value to allow uploading the same file again
    const input = document.getElementById("photo-upload") as HTMLInputElement
    if (input) input.value = ""
  }, [])

  // Remove a photo from the preview
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Remove an existing photo
  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      setMessage("")

      // Create FormData object
      const formData = new FormData()

      // Append text fields
      formData.append("model", data.model)
      formData.append("type", data.type)
      formData.append("price", data.price)
      formData.append("description", data.description)
      formData.append("importer", data.importer)

      // Append brands as separate fields with the same name
      data.brands.split(",").forEach(brandId => {
        formData.append("brands", brandId)
      })

      // Append existing photos
      existingPhotos.forEach(photo => {
        formData.append("existingPhotos", photo)
      })

      // Append new photos
      photos.forEach(photo => {
        formData.append("photos", photo)
      })

      console.log("Form data being sent:", {
        model: data.model,
        type: data.type,
        price: data.price,
        description: data.description,
        importer: data.importer,
        brands: data.brands,
        existingPhotoCount: existingPhotos.length,
        newPhotoCount: photos.length
      })

      // Send the request
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.put(`${apiBaseUrl}/cars/${carId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Handle success
      toast({
        title: "Success",
        description: "Car updated successfully!",
      })

      // Navigate back to cars list
      router.push("/admin/cars-list")

    } catch (error) {
      console.error("Error submitting form:", error)
      setMessage("Failed to update car. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update car. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="container py-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Car</h1>
          <Button onClick={() => router.push("/admin/cars-list")}>
            Back to List
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-8">
            {message && <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

            {/* Photos Upload */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car Photos</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {/* Existing Photos */}
                      {existingPhotos.map((photo, index) => (
                        <div key={`existing-${index}`} className="relative aspect-[3/2] overflow-hidden rounded-lg border">
                          <img
                            src={photo.startsWith('http')
                              ? photo
                              : `http://localhost:5000/${photo.replace(/^uploads\//, '')}`}
                            alt={`Car photo ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Use an inline SVG as fallback
                              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='1' y='3' width='15' height='13' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='4.5' cy='11.5' r='1.5'%3E%3C/circle%3E%3Ccircle cx='11.5' cy='11.5' r='1.5'%3E%3C/circle%3E%3Cpath d='M7 5l4 0'%3E%3C/path%3E%3C/svg%3E"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(index)}
                            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* New Photos */}
                      {photosPreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative aspect-[3/2] overflow-hidden rounded-lg border">
                          <img
                            src={preview}
                            alt={`Car photo ${existingPhotos.length + index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Upload Button */}
                      <div className="relative aspect-[3/2] overflow-hidden rounded-lg border">
                        <input
                          type="file"
                          id="photo-upload"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          accept=".jpg,.jpeg,.png,.gif,.webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handlePhotoUpload(file)
                          }}
                        />
                        <div className="flex h-full items-center justify-center bg-secondary">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        {isUploading && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                            <Progress value={uploadProgress} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>Upload photos of the car. You can upload multiple photos.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Importer Selection */}
            <FormField
              control={form.control}
              name="importer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importer</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleImporterChange(value)
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an importer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {importers.map((importer) => (
                        <SelectItem key={importer._id} value={importer._id}>
                          {importer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the importer for this car.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brands Selection */}
            <FormField
              control={form.control}
              name="brands"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Brands</FormLabel>
                    <FormDescription>
                      Select the brands associated with this car.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {selectedImporterBrands.map((brand) => (
                      <FormField
                        key={brand._id}
                        control={form.control}
                        name="brands"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={brand._id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(brand._id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value || [], brand._id])
                                      : field.onChange(
                                        Array.isArray(field.value)
                                          ? field.value.filter(
                                            (value: string) => value !== brand._id
                                          )
                                          : []
                                      )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {brand.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Camry" {...field} />
                  </FormControl>
                  <FormDescription>Enter the model name of the car.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (DT)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 125000" {...field} />
                  </FormControl>
                  <FormDescription>Enter the price in Tunisian Dinars.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter car description..." className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Add details about the car.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vehicle Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the type of vehicle.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Car...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Car
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  )
} 