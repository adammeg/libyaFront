"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { api } from "@/utils/api-helpers"
import { formatImagePath } from "@/utils/image-helpers"
import { Loader2 } from "lucide-react"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string | null
  createdAt: string
}

interface NewsHeroProps {
  locale?: string;
  dictionary?: any;
}

export function NewsHero({ locale = "en", dictionary }: NewsHeroProps) {
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedPost = async () => {
      try {
        setLoading(true)
        // Get the latest published post
        const response = await api.get('/blog/published', { limit: '1' })
        if (response.data.posts.length > 0) {
          setFeaturedPost(response.data.posts[0])
        }
      } catch (error) {
        console.error("Error fetching featured post:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPost()
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-muted">
        <div className="container flex justify-center items-center" style={{ minHeight: '400px' }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (!featuredPost) {
    return null // Don't show the section if no featured post
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <section className="py-24 bg-muted">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">{dictionary.newsHero?.title || "Latest News"}</h2>
            <h3 className="text-2xl font-semibold mb-4">{featuredPost.title}</h3>
            <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {formatDate(featuredPost.createdAt)}
            </p>
            <Button asChild>
              <Link href={`/blog/${featuredPost.slug}`}>{dictionary.newsHero?.readFullArticle || "Read Full Article"}</Link>
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={featuredPost.featuredImage ? formatImagePath(featuredPost.featuredImage) : "/placeholder.svg?height=400&width=600"}
              alt={featuredPost.title}
              className="w-full h-full object-cover"
              style={{ maxHeight: "400px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=600";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

