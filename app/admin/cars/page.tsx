"use client"

import React, { useState, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, X, Loader2, Car, Plus } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { SiteHeader } from "@/components/site-header"
import { FileUploader } from "@/components/file-uploader"

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

const formSchema = z.object({
  model: z.string().min(2, {
    message: "Model name must be at least 2 characters.",
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
  photos: z.any().optional(),
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

export default function NewCarPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
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
      brands: "",
    },
  })

  // Fetch brands and importers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [brandsRes, importersRes] = await Promise.all([
          axios.get("http://localhost:5000/brands/all-brands"),
          axios.get("http://localhost:5000/importers/all-importers")
        ])
        
        setBrands(brandsRes.data)
        setImporters(importersRes.data)
      } catch (err) {
        console.error("Error fetching data:", err)
        toast({
          title: "Error",
          description: "Failed to load brands and importers data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

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

    // Create a base64 string for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotosPreviews(prev => [...prev, reader.result as string])
      clearInterval(interval)
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
    reader.readAsDataURL(file)

    // Add to photos array
    setPhotos(prev => [...prev, file])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handlePhotoUpload(file)
    },
    [handlePhotoUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotosPreviews(prev => prev.filter((_, i) => i !== index))
  }, [])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Create FormData object to send files
      const formData = new FormData()
      
      // Append text fields
      formData.append('model', data.model)
      formData.append('type', data.type)
      formData.append('price', data.price)
      formData.append('description', data.description)
      formData.append('importer', data.importer)
      formData.append('brands', data.brands)
      
      // Append photos
      photos.forEach(photo => {
        formData.append('photos', photo)
      })
      
      // Check if at least one photo is uploaded
      if (photos.length === 0) {
        toast({
          title: "Error",
          description: "Please upload at least one photo of the vehicle.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
      
      // Send the request with progress tracking
      const response = await axios.post(
        'http://localhost:5000/cars/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress(percentCompleted)
            }
          },
        }
      )
      
      toast({
        title: "Success",
        description: "Vehicle added successfully!",
      })
      
      // Reset form and state
      form.reset()
      setPhotos([])
      setPhotosPreviews([])
      setUploadProgress(0)
      
      // Redirect to the car list or the new car's detail page
      router.push('/admin/cars-list')
    } catch (error: any) {
      console.error('Error creating car:', error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add vehicle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Add New Car</h1>
          <Button onClick={() => router.push("/admin/cars-list")}>
            Back to List
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-8">
            {message && <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>{message}</p>}
            
            {/* Car Photos */}
            <FormItem className="col-span-full">
              <FormLabel>Vehicle Photos</FormLabel>
              <FormControl>
                <FileUploader
                  value={photos}
                  onChange={setPhotos}
                  maxFiles={10}
                  maxSize={5 * 1024 * 1024} // 5MB
                  accept={{
                    'image/jpeg': [],
                    'image/png': [],
                    'image/webp': [],
                    'image/gif': []
                  }}
                  previews={photosPreviews}
                  setPreviews={setPhotosPreviews}
                />
              </FormControl>
              <FormDescription>
                Upload up to 10 photos of the vehicle. Each photo should be less than 5MB.
                The first photo will be used as the main image in search results.
              </FormDescription>
              <FormMessage />
            </FormItem>
            
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
                                  checked={field.value === brand._id}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange(brand._id)
                                      : field.onChange("")
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
            
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Car...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Car
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  )
}
