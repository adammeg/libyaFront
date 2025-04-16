"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save, ChevronLeft, Eye } from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { api } from "@/utils/api-helpers"
import { FileUploader } from "@/components/file-uploader"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

// Define form schema with multilingual fields
const formSchema = z.object({
  title_en: z.string().min(1, "English title is required"),
  title_ar: z.string().min(1, "Arabic title is required"),
  excerpt_en: z.string().min(1, "English excerpt is required").max(200, "Excerpt should be less than 200 characters"),
  excerpt_ar: z.string().min(1, "Arabic excerpt is required").max(200, "Excerpt should be less than 200 characters"),
  content_en: z.string().min(1, "English content is required"),
  content_ar: z.string().min(1, "Arabic content is required"),
  categories: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().default(false)
})

type FormValues = z.infer<typeof formSchema>

export default function NewBlogPost() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<File[]>([])
  const [preview, setPreview] = useState<string[]>([])
  const [categoryInput, setCategoryInput] = useState("")
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [tagsList, setTagsList] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("en")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: "",
      title_ar: "",
      excerpt_en: "",
      excerpt_ar: "",
      content_en: "",
      content_ar: "",
      categories: "",
      tags: "",
      published: false
    }
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      
      // Create FormData for file upload
      const formData = new FormData()
      
      // Add all multilingual fields
      formData.append("title_en", data.title_en)
      formData.append("title_ar", data.title_ar)
      formData.append("excerpt_en", data.excerpt_en)
      formData.append("excerpt_ar", data.excerpt_ar)
      formData.append("content_en", data.content_en)
      formData.append("content_ar", data.content_ar)
      
      // Add categories and tags as JSON strings
      formData.append("categories", JSON.stringify(categoriesList))
      formData.append("tags", JSON.stringify(tagsList))
      
      formData.append("published", data.published.toString())
      
      // Add featured image if exists
      if (featuredImage.length > 0) {
        formData.append("featuredImage", featuredImage[0])
      }
      
      // Send request to API
      const response = await api.postForm("/blog/create", formData)
      
      toast({
        title: "Blog post created",
        description: "Your post has been created successfully",
      })
      
      // Redirect to blog list
      router.push("/admin/blog")
      router.refresh()
    } catch (error) {
      console.error("Error creating blog post:", error)
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addCategory = () => {
    if (categoryInput && !categoriesList.includes(categoryInput)) {
      setCategoriesList([...categoriesList, categoryInput])
      setCategoryInput("")
    }
  }

  const removeCategory = (category: string) => {
    setCategoriesList(categoriesList.filter((c) => c !== category))
  }

  const addTag = () => {
    if (tagInput && !tagsList.includes(tagInput)) {
      setTagsList([...tagsList, tagInput])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTagsList(tagsList.filter((t) => t !== tag))
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        </div>
        <Button
          onClick={() => setActiveTab(activeTab === "en" ? "ar" : "en")}
          variant="outline"
          size="sm"
        >
          Switch to {activeTab === "en" ? "العربية" : "English"}
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="en" className="space-y-6 pt-4">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="title_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter post title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt (English)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter a short excerpt for your blog post" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief summary of the post (maximum 200 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content (English)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your blog post content here..." 
                            {...field} 
                            rows={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ar" dir="rtl" className="space-y-6 pt-4">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="title_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان (العربية)</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل عنوان المنشور" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملخص (العربية)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="أدخل ملخصًا قصيرًا لمنشور المدونة" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          ملخص موجز للمنشور (بحد أقصى 200 حرف)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المحتوى (العربية)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="اكتب محتوى منشور المدونة هنا..." 
                            {...field} 
                            rows={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Common fields for both languages */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Featured Image</h3>
                <FileUploader
                  value={featuredImage}
                  onChange={setFeaturedImage}
                  maxFiles={1}
                  previews={preview}
                  setPreviews={setPreview}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Categories</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a category"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                    />
                    <Button type="button" onClick={addCategory}>Add</Button>
                  </div>
                  
                  {categoriesList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categoriesList.map((category, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {category}
                          <button
                            type="button"
                            onClick={() => removeCategory(category)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag}>Add</Button>
                  </div>
                  
                  {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tagsList.map((tag, index) => (
                        <Badge key={index} variant="outline" className="px-2 py-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Publish immediately</FormLabel>
                      <FormDescription>
                        If unchecked, the post will be saved as a draft
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Post
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
} 