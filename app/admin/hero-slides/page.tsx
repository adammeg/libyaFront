"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { formatImagePath } from "@/utils/image-helpers"
import { SiteHeader } from "@/components/site-header"

interface HeroSlide {
  _id: string
  title: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function HeroSlidesPage() {
  const router = useRouter()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [buttonText, setButtonText] = useState("Learn More")
  const [buttonLink, setButtonLink] = useState("/search")
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch hero slides
  const fetchSlides = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/hero-slides/all-slides")
      setSlides(response.data)
    } catch (error) {
      console.error("Error fetching hero slides:", error)
      toast({
        title: "Error",
        description: "Failed to load hero slides. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Reset form
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setButtonText("Learn More")
    setButtonLink("/search")
    setIsActive(true)
    setImage(null)
    setImagePreview(null)
  }

  // Set form for editing
  const prepareEditForm = (slide: HeroSlide) => {
    setSelectedSlide(slide)
    setTitle(slide.title)
    setDescription(slide.description)
    setButtonText(slide.buttonText)
    setButtonLink(slide.buttonLink)
    setIsActive(slide.isActive)
    setImage(null)
    setImagePreview(formatImagePath(slide.image))
    setIsEditDialogOpen(true)
  }

  // Create new slide
  const createSlide = async () => {
    if (!title || !description || !image) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and upload an image.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("buttonText", buttonText)
      formData.append("buttonLink", buttonLink)
      formData.append("isActive", isActive.toString())
      formData.append("order", slides.length.toString())
      if (image) formData.append("image", image)
      
      console.log("Submitting form data:", {
        title,
        description,
        buttonText,
        buttonLink,
        isActive: isActive.toString(),
        order: slides.length.toString(),
        imageFileName: image?.name
      })
      
      const response = await axios.post("http://localhost:5000/hero-slides/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      console.log("Server response:", response.data)
      
      toast({
        title: "Success",
        description: "Hero slide created successfully.",
      })
      
      resetForm()
      setIsCreateDialogOpen(false)
      fetchSlides()
    } catch (error: any) {
      console.error("Error creating hero slide:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create hero slide. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update slide
  const updateSlide = async () => {
    if (!selectedSlide || !title || !description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("buttonText", buttonText)
      formData.append("buttonLink", buttonLink)
      formData.append("isActive", isActive.toString())
      if (image) formData.append("image", image)
      
      await axios.put(`http://localhost:5000/hero-slides/${selectedSlide._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      toast({
        title: "Success",
        description: "Hero slide updated successfully.",
      })
      
      resetForm()
      setIsEditDialogOpen(false)
      fetchSlides()
    } catch (error) {
      console.error("Error updating hero slide:", error)
      toast({
        title: "Error",
        description: "Failed to update hero slide. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete slide
  const deleteSlide = async () => {
    if (!selectedSlide) return

    try {
      setIsSubmitting(true)
      
      await axios.delete(`http://localhost:5000/hero-slides/${selectedSlide._id}`)
      
      toast({
        title: "Success",
        description: "Hero slide deleted successfully.",
      })
      
      setIsDeleteDialogOpen(false)
      fetchSlides()
    } catch (error) {
      console.error("Error deleting hero slide:", error)
      toast({
        title: "Error",
        description: "Failed to delete hero slide. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle slide active status
  const toggleActive = async (slide: HeroSlide) => {
    try {
      const formData = new FormData()
      formData.append("isActive", (!slide.isActive).toString())
      
      await axios.put(`http://localhost:5000/hero-slides/${slide._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      
      toast({
        title: "Success",
        description: `Slide ${slide.isActive ? "hidden" : "shown"} successfully.`,
      })
      
      fetchSlides()
    } catch (error) {
      console.error("Error toggling slide visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update slide visibility. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Change slide order
  const changeOrder = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s._id === slide._id)
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === slides.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const targetSlide = slides[newIndex]

    try {
      // Update current slide order
      const formData1 = new FormData()
      formData1.append("order", targetSlide.order.toString())
      await axios.put(`http://localhost:5000/hero-slides/${slide._id}`, formData1, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Update target slide order
      const formData2 = new FormData()
      formData2.append("order", slide.order.toString())
      await axios.put(`http://localhost:5000/hero-slides/${targetSlide._id}`, formData2, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast({
        title: "Success",
        description: "Slide order updated successfully.",
      })
      
      fetchSlides()
    } catch (error) {
      console.error("Error changing slide order:", error)
      toast({
        title: "Error",
        description: "Failed to update slide order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const DebugInfo = ({ data }: { data: any }) => {
    const [showDebug, setShowDebug] = useState(false)
    
    if (!showDebug) {
      return (
        <div className="mt-8 text-center">
          <Button variant="outline" size="sm" onClick={() => setShowDebug(true)}>
            Show Debug Info
          </Button>
        </div>
      )
    }
    
    return (
      <div className="mt-8 p-4 border rounded-lg bg-muted/20">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Debug Information</h3>
          <Button variant="outline" size="sm" onClick={() => setShowDebug(false)}>
            Hide
          </Button>
        </div>
        <pre className="text-xs overflow-auto p-2 bg-background rounded border">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  const ImagePathTester = () => {
    const [imagePath, setImagePath] = useState("");
    const [formattedPath, setFormattedPath] = useState("");
    
    const testPath = () => {
      if (!imagePath) return;
      setFormattedPath(formatImagePath(imagePath));
    };
    
    return (
      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Image Path Tester</h3>
        <div className="flex gap-2 mb-4">
          <Input 
            value={imagePath} 
            onChange={(e) => setImagePath(e.target.value)}
            placeholder="Enter image path to test"
            className="flex-1"
          />
          <Button onClick={testPath}>Test</Button>
        </div>
        {formattedPath && (
          <div className="space-y-2">
            <p className="text-sm">Formatted path: <code className="bg-muted p-1 rounded">{formattedPath}</code></p>
            <div className="h-40 border rounded overflow-hidden">
              <img 
                src={formattedPath} 
                alt="Test image" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error(`Failed to load test image: ${formattedPath}`);
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=400&text=Image+Load+Error";
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Hero Slides</h1>
          <Button onClick={() => {
            resetForm()
            setIsCreateDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Slide
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <h2 className="text-xl font-semibold mb-2">No Hero Slides Found</h2>
            <p className="text-muted-foreground mb-6">
              Create your first hero slide to showcase on the homepage.
            </p>
            <Button onClick={() => {
              resetForm()
              setIsCreateDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Slide
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {slides.map((slide) => (
              <Card key={slide._id} className={`overflow-hidden ${!slide.isActive ? 'opacity-60' : ''}`}>
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                    <img 
                      src={formatImagePath(slide.image)} 
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=500&text=Image+Not+Found"
                      }}
                    />
                    {!slide.isActive && (
                      <div className="absolute top-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        Hidden
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{slide.title}</h2>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{slide.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="mr-4">Button: {slide.buttonText}</span>
                          <span>Link: {slide.buttonLink}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => changeOrder(slide, 'up')}
                          disabled={slides.indexOf(slide) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => changeOrder(slide, 'down')}
                          disabled={slides.indexOf(slide) === slides.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-4 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleActive(slide)}
                      >
                        {slide.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Show
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => prepareEditForm(slide)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedSlide(slide)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Slide Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Hero Slide</DialogTitle>
            <DialogDescription>
              Create a new slide for the homepage hero section.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createSlide();
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter slide title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter slide description"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Learn More"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/search"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Slide Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload an image for the hero slide (required). Recommended size: 1920x600px.
                </p>
              </div>
              {imagePreview && (
                <div className="relative mt-2 rounded-md overflow-hidden h-40">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Show on homepage</Label>
              </div>
            </div>
            <DialogFooter className="sticky bottom-0 pt-2 bg-background">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !image || !title || !description}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Slide"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Slide Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Hero Slide</DialogTitle>
            <DialogDescription>
              Update the details of this hero slide.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter slide title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter slide description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-buttonText">Button Text</Label>
                <Input
                  id="edit-buttonText"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Learn More"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-buttonLink">Button Link</Label>
                <Input
                  id="edit-buttonLink"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="/search"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Slide Image</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to keep the current image
              </p>
            </div>
            {imagePreview && (
              <div className="relative mt-2 rounded-md overflow-hidden h-40">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {image && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(selectedSlide ? formatImagePath(selectedSlide.image) : null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="edit-isActive">Show on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateSlide} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Slide"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hero slide? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteSlide} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Slide"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DebugInfo data={{ slides, loading, isSubmitting }} />
      <ImagePathTester />
    </>
  )
}