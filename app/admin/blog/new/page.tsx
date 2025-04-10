"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Image as ImageIcon, Loader2, X, Upload, Check, FileText, Eye, Save } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/utils/api-helpers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { Badge } from "@/components/ui/badge"

// Blog post form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  categories: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().default(false),
  featuredImage: z.any().optional(),
})

export default function CreateBlogPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categoryInput, setCategoryInput] = useState("")
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [tagsList, setTagsList] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      categories: "",
      tags: "",
      published: false,
    },
  })

  // Function to handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Create image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove selected image
  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle adding a category
  const addCategory = () => {
    if (categoryInput.trim() && !categoriesList.includes(categoryInput.trim())) {
      setCategoriesList([...categoriesList, categoryInput.trim()])
      setCategoryInput("")
    }
  }

  // Handle removing a category
  const removeCategory = (category: string) => {
    setCategoriesList(categoriesList.filter(c => c !== category))
  }

  // Handle adding a tag
  const addTag = () => {
    if (tagInput.trim() && !tagsList.includes(tagInput.trim())) {
      setTagsList([...tagsList, tagInput.trim()])
      setTagInput("")
    }
  }

  // Handle removing a tag
  const removeTag = (tag: string) => {
    setTagsList(tagsList.filter(t => t !== tag))
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a blog post",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("excerpt", values.excerpt)
      formData.append("content", values.content)
      formData.append("categories", JSON.stringify(categoriesList))
      formData.append("tags", JSON.stringify(tagsList))
      formData.append("published", values.published.toString())
      
      if (imageFile) {
        formData.append("featuredImage", imageFile)
      }
      
      // Send the request to create a new blog post
      const response = await api.postForm("/blog/create", formData)
      
      toast({
        title: "Blog post created",
        description: "Your blog post has been successfully created",
      })
      
      // Redirect to the blog list page
      router.push("/admin/blog")
    } catch (error: any) {
      console.error("Error creating blog post:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create blog post",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create New Blog Post</h1>
        <Button variant="outline" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
      </div>
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter post title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief summary of your post" 
                            className="resize-none" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A short summary that appears on blog listing pages
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <FormLabel>Categories</FormLabel>
                      <div className="flex mt-1 mb-2">
                        <Input
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value)}
                          placeholder="Add category"
                          className="rounded-r-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCategory()
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={addCategory}
                          className="rounded-l-none"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {categoriesList.map((category, index) => (
                          <Badge key={index} variant="secondary" className="flex gap-1 items-center">
                            {category}
                            <button 
                              type="button"
                              onClick={() => removeCategory(category)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel>Tags</FormLabel>
                      <div className="flex mt-1 mb-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add tag"
                          className="rounded-r-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag()
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={addTag}
                          className="rounded-l-none"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tagsList.map((tag, index) => (
                          <Badge key={index} variant="outline" className="flex gap-1 items-center">
                            {tag}
                            <button 
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Published
                          </FormLabel>
                          <FormDescription>
                            Toggle to publish this post immediately
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormLabel>Featured Image</FormLabel>
                  <div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      ref={fileInputRef}
                      accept="image/*"
                    />
                    
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-[300px] mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="py-12 flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, WEBP up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your blog post content here..."
                            className="min-h-[300px] font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          You can use HTML for formatting. Basic Markdown is also supported.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/blog")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-h-[400px] object-cover rounded-lg mb-6"
                  />
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {categoriesList.map((category, index) => (
                    <Badge key={`prev-cat-${index}`} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl font-bold mb-4">
                  {form.watch("title") || "Untitled Post"}
                </h1>
                
                <div className="text-muted-foreground mb-6">
                  <p>{form.watch("excerpt") || "No excerpt provided"}</p>
                </div>
                
                <div 
                  className="mt-6" 
                  dangerouslySetInnerHTML={{ __html: form.watch("content") || "No content yet" }}
                />
                
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
                    {tagsList.map((tag, index) => (
                      <Badge key={`prev-tag-${index}`} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 