"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Search, Loader2, Tag, X } from "lucide-react"
import Link from "next/link"
import { formatImagePath } from "@/utils/image-helpers"
import { api } from "@/utils/api-helpers"
import React from "react"
import { Dictionary } from '@/lib/dictionaries'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string | null
  categories: string[]
  tags: string[]
  author: {
    username: string
  }
  createdAt: string
}

interface PaginationData {
  total: number
  page: number
  pages: number
}

interface BlogContentProps {
  locale: string;
  dictionary: Dictionary;
}

export default function BlogContent({ locale, dictionary }: BlogContentProps) {
  // Add client-side debug log
  useEffect(() => {
    console.log("BlogContent client hydration, locale:", locale);
  }, [locale]);

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, pages: 1 })
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  const fetchPosts = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      let params: Record<string, string> = { 
        page: pageNum.toString(),
        lang: locale // Add locale parameter
      }
      
      if (searchTerm) params.search = searchTerm
      if (categoryFilter) params.category = categoryFilter
      if (tagFilter) params.tag = tagFilter
      
      const response = await api.get('/blog/published', params)
      
      setPosts(response.data.posts)
      setPagination(response.data.pagination)
      
      // Extract unique categories and tags for filters
      const cats = new Set<string>()
      const tags = new Set<string>()
      
      response.data.posts.forEach((post: BlogPost) => {
        post.categories.forEach(cat => cats.add(cat))
        post.tags.forEach(tag => tags.add(tag))
      })
      
      setAvailableCategories(Array.from(cats))
      setAvailableTags(Array.from(tags))
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      setError("Failed to load articles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1) // Reset to page 1 when filters change
  }, [searchTerm, categoryFilter, tagFilter, locale])

  // Format date - use a stable date formatter to avoid hydration mismatches
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Use more stable date formatting (without times) to avoid hydration mismatches
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString; // Fallback to original string
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Active filters display */}
        {(categoryFilter || tagFilter) && (
          <div className="flex flex-wrap gap-2">
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
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-0">
                <div className="aspect-video relative">
                  <img
                    src={post.featuredImage ? formatImagePath(post.featuredImage) : "/placeholder.svg?height=200&width=400"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=400";
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-2">
                  {post.categories.slice(0, 2).map((category, index) => (
                    <Badge 
                      key={`cat-${index}`} 
                      variant="secondary"
                      className="mr-2 cursor-pointer"
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                
                <CardTitle className="mb-3 line-clamp-2">
                  <Link 
                    href={`/${locale}/blog/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(post.createdAt)}
                  <span className="mx-2">•</span>
                  <User className="mr-1 h-4 w-4" />
                  {post.author.username}
                </div>
              </CardContent>
              <CardFooter className="pt-0 px-6 pb-6">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${locale}/blog/${post.slug}`}>Read More</Link>
                </Button>
              </CardFooter>
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
              onClick={() => {
                setPage(page - 1);
                fetchPosts(page - 1);
              }}
              disabled={page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(p => 
                p === 1 || 
                p === pagination.pages || 
                (p >= page - 1 && p <= page + 1)
              )
              .map((p, index, array) => (
                <React.Fragment key={p}>
                  {index > 0 && array[index - 1] !== p - 1 && (
                    <Button variant="outline" size="sm" disabled>
                      ...
                    </Button>
                  )}
                  <Button
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setPage(p);
                      fetchPosts(p);
                    }}
                  >
                    {p}
                  </Button>
                </React.Fragment>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPage(page + 1);
                fetchPosts(page + 1);
              }}
              disabled={page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Categories and Tags */}
      {(availableCategories.length > 0 || availableTags.length > 0) && (
        <div className="grid md:grid-cols-2 gap-8 mt-12 pt-8 border-t">
          {availableCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category, index) => (
                  <Badge 
                    key={`cat-list-${index}`} 
                    variant="secondary"
                    className="cursor-pointer p-2"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {availableTags.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag, index) => (
                  <Badge 
                    key={`tag-list-${index}`} 
                    variant="outline"
                    className="cursor-pointer p-2"
                    onClick={() => setTagFilter(tag)}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
} 