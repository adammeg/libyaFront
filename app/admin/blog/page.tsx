"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Edit, Trash2, Eye, EyeOff, Plus, Search, Calendar, User, Tag, MoreHorizontal, Filter, X } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/utils/api-helpers"
import { formatImagePath } from "@/utils/image-helpers"
import React from "react"
interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string | null
  categories: string[]
  tags: string[]
  published: boolean
  author: {
    _id: string
    username: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  pages: number
}

export default function BlogListPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [publishFilter, setPublishFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Fetch blog posts
  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true)
      let params: Record<string, string> = { page: page.toString() }
      
      // Add filters if they exist
      if (searchTerm) params.search = searchTerm
      if (publishFilter !== null) params.published = publishFilter
      if (categoryFilter) params.category = categoryFilter
      if (tagFilter) params.tag = tagFilter
      
      const response = await api.get('/blog/all', params)
      setPosts(response.data.posts)
      setPagination(response.data.pagination)
      
      // Extract unique categories and tags
      const categories = new Set<string>()
      const tags = new Set<string>()
      
      response.data.posts.forEach((post: BlogPost) => {
        post.categories.forEach(cat => categories.add(cat))
        post.tags.forEach(tag => tags.add(tag))
      })
      
      setAvailableCategories(Array.from(categories))
      setAvailableTags(Array.from(tags))
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      toast({
        title: "Error",
        description: "Failed to load blog posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Call fetchPosts whenever filters change
  useEffect(() => {
    fetchPosts(1) // Reset to page 1 when filters change
  }, [searchTerm, publishFilter, categoryFilter, tagFilter])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Change publish status
  const togglePublishStatus = async (post: BlogPost) => {
    try {
      await api.put(`/blog/${post._id}`, {
        published: (!post.published).toString()
      })
      
      // Update local state
      setPosts(posts.map(p => 
        p._id === post._id ? { ...p, published: !p.published } : p
      ))
      
      toast({
        title: "Success",
        description: `Post ${post.published ? "unpublished" : "published"} successfully.`,
      })
    } catch (error) {
      console.error("Error toggling publish status:", error)
      toast({
        title: "Error",
        description: "Failed to update publish status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete post
  const deletePost = async () => {
    if (!selectedPost) return
    
    try {
      setIsDeleting(true)
      await api.delete(`/blog/${selectedPost._id}`)
      
      // Update local state
      setPosts(posts.filter(p => p._id !== selectedPost._id))
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      })
      
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting blog post:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setSelectedPost(null)
    }
  }

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog content
          </p>
        </div>
        <Button onClick={() => router.push("/admin/blog/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setPublishFilter(null)}>
                All Posts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPublishFilter('true')}>
                Published Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPublishFilter('false')}>
                Drafts Only
              </DropdownMenuItem>
              
              {availableCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                    All Categories
                  </DropdownMenuItem>
                  {availableCategories.map(category => (
                    <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              {availableTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTagFilter(null)}>
                    All Tags
                  </DropdownMenuItem>
                  {availableTags.map(tag => (
                    <DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)}>
                      {tag}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Display active filters */}
        {(publishFilter !== null || categoryFilter || tagFilter) && (
          <div className="flex flex-wrap gap-2">
            {publishFilter !== null && (
              <Badge variant="outline" className="flex gap-1 items-center">
                {publishFilter === 'true' ? 'Published' : 'Drafts'}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-0.5" 
                  onClick={() => setPublishFilter(null)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryFilter && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Category: {categoryFilter}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-0.5" 
                  onClick={() => setCategoryFilter(null)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {tagFilter && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Tag: {tagFilter}
                <button 
                  className="ml-1 rounded-full hover:bg-muted p-0.5" 
                  onClick={() => setTagFilter(null)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No blog posts found</p>
          <Button onClick={() => router.push("/admin/blog/new")}>
            Create your first post
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post._id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {post.featuredImage && (
                  <div className="w-full md:w-1/4 h-48 md:h-auto">
                    <img
                      src={formatImagePath(post.featuredImage)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                )}
                <CardContent className={`flex-1 p-6 ${!post.featuredImage ? 'md:w-full' : 'md:w-3/4'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(post.createdAt)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="mr-1 h-4 w-4" />
                          {post.author.username}
                        </div>
                        {post.published ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/blog/edit/${post._id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublishStatus(post)}>
                          {post.published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedPost(post);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{truncateText(post.excerpt, 200)}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.categories.map((category, index) => (
                      <Badge key={`cat-${index}`} variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter(category)}>
                        {category}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, index) => (
                      <Badge key={`tag-${index}`} variant="outline" className="cursor-pointer" onClick={() => setTagFilter(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/blog/${post.slug}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/blog/edit/${post._id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post);
                        setDeleteDialogOpen(true);
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
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPosts(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === pagination.pages || 
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <Button variant="outline" size="sm" disabled>
                      ...
                    </Button>
                  )}
                  <Button
                    variant={pagination.page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => fetchPosts(page)}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPosts(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the post "{selectedPost?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deletePost}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 