"use client"

import React, { useState, useCallback, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, X, Loader2 } from "lucide-react"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

// Define the interface for brand data from your API
interface Brand {
  _id: string
  name: string
  // Add other fields that your API returns
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Importer name must be at least 2 characters.",
  }),
  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  telephone: z.string().min(2, {
    message: "Telephone must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  profileImage: z.any().optional(),
  brands: z.array(z.string()).min(1, {
    message: "You must select at least one brand.",
  }),
})

export default function NewImporterPage() {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string>("")

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

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await axios.get(`${apiBaseUrl}/brands/all-brands`)
        setBrands(response.data)
      } catch (error) {
        console.error("Error fetching brands:", error)
        toast({
          title: "Error",
          description: "There was a problem fetching brands. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  const handleProfileImageUpload = useCallback((file: File) => {
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: `File size is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
        variant: "destructive",
      })
      return
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "Invalid file type. Only JPEG, JPG, PNG and GIF are allowed.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadstart = () => {
      setIsUploading(true)
      setUploadProgress(0)
    }
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100
        setUploadProgress(percent)
      }
    }
    reader.onload = (event) => {
      setProfileImage(event.target?.result as string)
      setIsUploading(false)
      form.setValue("profileImage", file)
    }
    reader.readAsDataURL(file)
  }, [form])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (!e.dataTransfer?.files?.[0]) return
      handleProfileImageUpload(e.dataTransfer.files[0])
    },
    [handleProfileImageUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removeProfileImage = useCallback(() => {
    setProfileImage(null)
    form.setValue("profileImage", null)
  }, [form])

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setMessage('')

    const formData = new FormData()
    formData.append('name', form.watch('name'))
    formData.append('address', form.watch('address'))
    formData.append('telephone', form.watch('telephone'))
    formData.append('email', form.watch('email'))

    if (form.watch('profileImage')) {
      formData.append('profileImage', form.watch('profileImage'))
    }

    // Append each brand ID individually
    form.watch("brands").forEach((brandId: string) => {
      formData.append('brands', brandId)
    })

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.post(`${apiBaseUrl}/importers/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setMessage('Importer created successfully!')
      form.reset()
      setProfileImage(null)
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Add New Importer</h2>
        <p className="text-muted-foreground">Create a new importer that will be displayed on the website.</p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-2xl">
          <Form {...form}>
            <form onSubmit={handleSubmitForm} encType="multipart/form-data" className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormDescription>Enter the name of the importer.</FormDescription>
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
                      <Input placeholder="e.g. 123 Main St, City, Country" {...field} />
                    </FormControl>
                    <FormDescription>Enter the address of the importer.</FormDescription>
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
                      <Input placeholder="e.g. +1 123 456 7890" {...field} />
                    </FormControl>
                    <FormDescription>Enter the telephone number of the importer.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. john@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Enter the email address of the importer.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brands"
                render={() => (
                  <FormItem>
                    <FormLabel>Brands</FormLabel>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    ) : brands.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No brands found.</p>
                    ) : (
                      <>
                        <div className="mb-4">
                          <FormDescription>Select the brands associated with the importer.</FormDescription>
                        </div>
                        {brands.map((brand) => (
                          <FormField
                            key={brand._id}
                            control={form.control}
                            name="brands"
                            render={({ field }) => {
                              return (
                                <FormItem key={brand._id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(brand._id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, brand._id])
                                          : field.onChange(field.value?.filter((value) => value !== brand._id))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{brand.name}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <div
                        className={`relative aspect-square overflow-hidden rounded-lg border-2 border-dashed ${profileImage ? "border-transparent" : "border-muted-foreground/25"
                          }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 z-[2] cursor-pointer opacity-0"
                          {...field}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleProfileImageUpload(file)
                              field.onChange(file)
                            }
                          }}
                        />
                        {profileImage ? (
                          <div className="relative h-full">
                            <img src={profileImage} alt="Importer profile image preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={removeProfileImage}
                              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary">
                            <Upload className="h-16 w-16 text-muted-foreground" />
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
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Importer"
                )}
              </Button>
              {message && <p className="text-sm text-red-500">{message}</p>}
            </form>
          </Form>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview</h3>
            <p className="text-sm text-muted-foreground">This is how the importer will appear on the website.</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  {profileImage ? (
                    <img src={profileImage} alt="Importer profile image preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-secondary">
                      <Upload className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{form.watch("name")}</h3>
                  <p className="text-sm text-muted-foreground">{form.watch("address")}</p>
                  <p className="text-sm text-muted-foreground">{form.watch("telephone")}</p>
                  <p className="text-sm text-muted-foreground">{form.watch("email")}</p>
                  <p className="text-sm text-muted-foreground">
                    Brands: {form.watch("brands")?.map((id) => brands.find((brand) => brand._id === id)?.name).join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 