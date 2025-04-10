"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, X, Loader2, User } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { formatImagePath } from '@/utils/image-helpers'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

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
  name: z.string().min(2, {
    message: "Importer name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  telephone: z.string().min(8, {
    message: "Telephone must be at least 8 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  profileImage: z.any().optional(),
  brands: z.array(z.string()).min(1, {
    message: "You must select at least one brand.",
  }),
})

export default function EditImporterPage() {
  const params = useParams()
  const router = useRouter()
  const importerId = params?.id as string

  const [importer, setImporter] = useState<Importer | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [brands, setBrands] = useState<Brand[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      telephone: "",
      email: "",
      brands: [],
    },
  })

  // Fetch importer and brands data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        // Fetch importer and brands in parallel
        const [importerRes, brandsRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/importers/${importerId}`),
          axios.get(`${apiBaseUrl}/brands/all-brands`)
        ])

        const importerData = importerRes.data
        setImporter(importerData)
        setProfileImage(importerData.profileImage || null)
        setBrands(brandsRes.data)

        // Set form values
        form.setValue("name", importerData.name)
        form.setValue("address", importerData.address)
        form.setValue("telephone", importerData.telephone)
        form.setValue("email", importerData.email)

        // Set brands
        const brandIds = Array.isArray(importerData.brands)
          ? importerData.brands.map((brand: any) => typeof brand === 'object' ? brand._id : brand)
          : []
        form.setValue("brands", brandIds)

      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load importer data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [importerId, form])

  // Handle profile image upload
  const handleProfileImageUpload = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size should be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "File must be an image (JPEG, PNG, or GIF).",
        variant: "destructive",
      })
      return
    }

    setProfileImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadstart = () => {
      setIsUploading(true)
      setUploadProgress(0)
    }
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100)
      }
    }
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  // Remove profile image
  const removeProfileImage = () => {
    setProfileImageFile(null)
    setProfileImagePreview(null)
    form.setValue("profileImage", undefined)
  }

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("address", data.address)
      formData.append("telephone", data.telephone)
      formData.append("email", data.email)

      // Append each brand ID individually
      data.brands.forEach(brandId => {
        formData.append("brands", brandId)
      })

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile)
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.put(`${apiBaseUrl}/importers/${importerId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast({
        title: "Success",
        description: "Importer updated successfully!",
      })

      // Navigate back to importers list
      router.push("/admin/importers-list")
    } catch (error) {
      console.error("Error updating importer:", error)
      toast({
        title: "Error",
        description: "Failed to update importer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="space-y-6 p-2 pb-16 md:p-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Edit Importer</h2>
          <p className="text-muted-foreground">
            Update the importer's information and associated brands.
          </p>
        </div>
        <Separator className="my-6" />

        {loading ? (
          <div className="flex h-[400px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
            <div className="flex-1 lg:max-w-2xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div className="relative aspect-square h-40 overflow-hidden rounded-full border sm:h-48 md:h-56">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 z-[2] cursor-pointer opacity-0"
                              {...field}
                              value=""
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleProfileImageUpload(file)
                              }}
                            />
                            {profileImagePreview ? (
                              <div className="relative h-full">
                                <img
                                  src={profileImagePreview}
                                  alt="Profile preview"
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={removeProfileImage}
                                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : profileImage ? (
                              <div className="relative h-full">
                                <img
                                  src={profileImagePreview || (profileImage ? formatImagePath(profileImage) : '')}
                                  alt="Profile preview"
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
                                <div className="fallback-icon hidden absolute inset-0 bg-muted flex items-center justify-center rounded-full">
                                  <User className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setProfileImage(null)}
                                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center bg-secondary">
                                <User className="h-16 w-16 text-muted-foreground" />
                              </div>
                            )}
                            {isUploading && (
                              <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                                <Progress value={uploadProgress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>Upload a profile image for the importer.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Importer Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. ABC Motors" {...field} />
                          </FormControl>
                          <FormDescription>Enter the name of the importer.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telephone</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. +216 12 345 678" {...field} />
                          </FormControl>
                          <FormDescription>Enter the contact telephone number.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. contact@abcmotors.com" {...field} />
                        </FormControl>
                        <FormDescription>Enter the contact email address.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 123 Main St, Tripoli, Libya" {...field} />
                        </FormControl>
                        <FormDescription>Enter the physical address of the importer.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brands"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Brands</FormLabel>
                          <FormDescription>
                            Select the brands this importer represents.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                          {brands.map((brand) => (
                            <FormField
                              key={brand._id}
                              control={form.control}
                              name="brands"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={brand._id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(brand._id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, brand._id])
                                            : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== brand._id
                                              )
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

                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Importer...
                      </>
                    ) : (
                      "Update Importer"
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            <div className="flex flex-col space-y-4 lg:w-80">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Preview</h3>
                <p className="text-sm text-muted-foreground">This is how the importer will appear on the website.</p>
              </div>
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : profileImage ? (
                          <div className="relative h-full w-full">
                            <img
                              src={profileImagePreview || (profileImage ? formatImagePath(profileImage) : '')}
                              alt="Profile preview"
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
                            <div className="fallback-icon hidden absolute inset-0 bg-muted flex items-center justify-center rounded-full">
                              <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{form.watch("name")}</h3>
                        <p className="text-sm text-muted-foreground">{form.watch("email")}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-sm font-medium">Address:</span>
                        <span className="text-sm text-muted-foreground">{form.watch("address")}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-sm font-medium">Telephone:</span>
                        <span className="text-sm text-muted-foreground">{form.watch("telephone")}</span>
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-sm font-medium">Brands:</span>
                        <div className="flex flex-wrap gap-1">
                          {form.watch("brands")?.map((brandId) => {
                            const brand = brands.find((b) => b._id === brandId)
                            return brand ? (
                              <span key={brand._id} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {brand.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 