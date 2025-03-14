"use client"

import React, { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, X, Image } from "lucide-react"
import axios from "axios"

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

export default function NewBrandPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null) // Store File object
  const [logoPreview, setLogoPreview] = useState<string | null>(null) // Store Base64 string for preview
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [message, setMessage] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const handleLogoUpload = useCallback((file: File) => {
    if (!file) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, or GIF).",
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
      setLogoPreview(reader.result as string)
      clearInterval(interval)
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
    reader.readAsDataURL(file)

    // Set the File object
    setLogoFile(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleLogoUpload(file)
    },
    [handleLogoUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removeLogo = useCallback(() => {
    setLogoFile(null)
    setLogoPreview(null)
    form.setValue("logo", null)
  }, [form])

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!logoFile) {
      setMessage('Please upload a logo.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    const formData = new FormData()
    formData.append('name', form.watch('name'))
    formData.append('logo', logoFile) // Append the actual File object

    try {
      const res = await axios.post('http://localhost:5000/brands/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setMessage('Brand created successfully!')
      form.reset()
      removeLogo()
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Add New Brand</h2>
        <p className="text-muted-foreground">Create a new brand that will be displayed on the website.</p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-2xl">
          <Form {...form}>
            <form onSubmit={handleSubmitForm} encType="multipart/form-data" className="space-y-8">
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Brand Logo</FormLabel>
                    <FormControl>
                      <div
                        className={`relative aspect-square overflow-hidden rounded-lg border-2 border-dashed ${
                          logoPreview ? "border-transparent" : "border-muted-foreground/25"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 z-[2] cursor-pointer opacity-0"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleLogoUpload(file)
                          }}
                          {...field}
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
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? "Adding Brand..." : "Add Brand"}
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
