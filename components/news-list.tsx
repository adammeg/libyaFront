"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import useTranslation from "next-translate/useTranslation"
import { formatImagePath } from "@/utils/image-helpers"
import { api } from "@/utils/api-helpers"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string | null
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

interface NewsListProps {
  title: string
  viewAllLabel: string
}

export function NewsList({ title, viewAllLabel }: NewsListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, pages: 1 })
  const { lang } = useTranslation()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await api.get('/blog/published', { limit: '3' })
        setPosts(response.data.posts)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
        setError("Failed to load latest articles")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Format date based on locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-LY' : 'en-US', {
      year: "numeric", 
      month: "long", 
      day: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h2 className="text-3xl font-bold mb-8">{title}</h2>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post._id}>
              <CardHeader>
                <img
                  src={post.featuredImage ? formatImagePath(post.featuredImage) : "/placeholder.svg?height=200&width=400"}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=400";
                  }}
                />
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{post.title}</CardTitle>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(post.createdAt)} • {lang === 'ar' ? 'بواسطة' : 'By'} {post.author.username}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/blog/${post.slug}`}>
                    {lang === 'ar' ? 'قراءة المزيد' : 'Read More'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-muted-foreground">
              {lang === 'ar' ? 'لم يتم العثور على مقالات' : 'No articles found'}
            </p>
          </div>
        )}
      </div>
      
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="w-full max-w-xs" asChild>
            <Link href="/blog">{viewAllLabel}</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

