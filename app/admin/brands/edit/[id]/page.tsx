"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, X, Loader2, Image } from "lucide-react"
import axios from "axios"
import { formatImagePath } from '@/utils/image-helpers'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"]

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Brand name must be at least 2 characters.",
  }),
  logo: z.any().optional(),
})

export default function EditBrandPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = params.id as string
  
  const [brand, setBrand] = useState<any>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })
  
  // Fetch brand data
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/brands/${brandId}`)
        const brandData = response.data
        
        setBrand(brandData)
        setLogo(brandData.logo || null)
        
        // Set form values
        form.setValue("name", brandData.name)
      } catch (error) {
        console.error("Error fetching brand:", error)
        toast({
          title: "Error",
          description: "Failed to load brand data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchBrand()
  }, [brandId, form])
  
  // Handle logo upload
  const handleLogoUpload = (file: File) => {
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
    
    setLogoFile(file)
    
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
      setLogoPreview(e.target?.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }
  
  // Remove logo
  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    form.setValue("logo", undefined)
  }
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append("name", data.name)
      
      if (logoFile) {
        formData.append("logo", logoFile)
      }
      
      const response = await axios.put(`http://localhost:5000/brands/${brandId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      toast({
        title: "Success",
        description: "Brand updated successfully!",
      })
      
      // Navigate back to brands list
      router.push("/admin/brands-list")
    } catch (error) {
      console.error("Error updating brand:", error)
      toast({
        title: "Error",
        description: "Failed to update brand. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Brand</h1>
        <Button variant="outline" onClick={() => router.push("/admin/brands-list")}>
          Back to Brands
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Logo</FormLabel>
                    <FormControl>
                      <div className="relative aspect-square overflow-hidden rounded-lg border">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 z-[2] cursor-pointer opacity-0"
                          {...field}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleLogoUpload(file)
                          }}
                          value=""
                        />
                        {logoPreview ? (
                          <div className="relative h-full">
                            <img
                              src={logoPreview}
                              alt="Brand logo preview"
                              className="h-full w-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : logo ? (
                          <div className="relative h-full">
                            <img
                              src={logoPreview || (logo ? formatImagePath(logo) : '')}
                              alt="Brand logo preview"
                              className="h-full w-full object-contain"
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
                            <div className="fallback-icon hidden absolute inset-0 bg-muted flex items-center justify-center rounded">
                              <Image className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setLogo(null)}
                              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary">
                            <Image className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                            <Progress value={uploadProgress} className="h-1" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>Upload a high-quality logo for the brand.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Toyota" {...field} />
                    </FormControl>
                    <FormDescription>Enter the name of the brand.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Brand...
                  </>
                ) : (
                  "Update Brand"
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview</h3>
            <p className="text-sm text-muted-foreground">This is how the brand will appear on the website.</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Brand logo preview" className="h-full w-full object-contain" />
                  ) : logo ? (
                    <div className="relative h-full w-full">
                      <img
                        src={logoPreview || (logo ? formatImagePath(logo) : '')}
                        alt="Brand logo preview"
                        className="h-full w-full object-contain"
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
                      <div className="fallback-icon hidden absolute inset-0 bg-muted flex items-center justify-center rounded">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-secondary">
                      <Image className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{form.watch("name")}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 