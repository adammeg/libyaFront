import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Calendar, User, Tag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatImagePath } from "@/utils/image-helpers"
import { Metadata } from 'next'
import axios from 'axios'
import { notFound } from 'next/navigation'
import { getDictionary } from "@/lib/dictionaries"

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string | null
  author: {
    username: string
  }
  categories: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default async function BlogPost({ params }: { params: { slug: string, locale: string } }) {
  try {
    // First get the dictionary for localization
    const dictionary = await getDictionary(params.locale);
    
    // Log the API URL for debugging
    console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL}/api/blog/post/${params.slug}`);
    
    // Try with a more reliable API path structure - test different possibilities
    let post;
    let response;
    
    try {
      // First attempt with the current path
      response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/post/${params.slug}`);
      post = response.data;
    } catch (err) {
      console.log("First API attempt failed, trying alternative endpoint");
      
      try {
        // Try an alternative path structure
        response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params.slug}`);
        post = response.data;
      } catch (err2) {
        console.log("Second API attempt failed, trying another alternative");
        
        // Try one more alternative
        response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${params.slug}`);
        post = response.data;
      }
    }
    
    console.log("Post data:", post);
    
    if (!post) {
      console.log("No post data returned from API");
      return notFound();
    }
    
    // Format date
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };
    
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader dictionary={dictionary} />
        <main className="flex-1">
          <div className="container py-12">
            <article className="max-w-4xl mx-auto">
              <Link href="/blog" className="text-muted-foreground hover:text-primary mb-4 inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all articles
              </Link>
              
              <h1 className="text-4xl font-bold mt-6 mb-4">{post.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(post.createdAt)}
                </div>
                {post.author && post.author.username && (
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    {post.author.username}
                  </div>
                )}
              </div>
              
              {post.featuredImage && (
                <div className="mb-8">
                  <img
                    src={formatImagePath(post.featuredImage)}
                    alt={post.title}
                    className="w-full h-auto max-h-[500px] object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg?height=500&width=1000&text=No+Image";
                    }}
                  />
                </div>
              )}
              
              <div 
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <Separator className="my-8" />
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {post.categories && post.categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category: string, index: number) => (
                        <Badge key={`cat-${index}`} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {post.tags && post.tags.length > 0 && (
                  <div className="sm:ml-auto">
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string, index: number) => (
                        <Badge key={`tag-${index}`} variant="outline">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>
        </main>
        <Footer locale={params.locale} dictionary={dictionary} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching blog post:", error);
    // Detailed error logging for debugging
    if (axios.isAxiosError(error)) {
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
    }
    
    // Get dictionary even in error state
    const dictionary = await getDictionary(params.locale).catch(() => ({}));
    
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader dictionary={dictionary} />
        <main className="flex-1">
          <div className="container py-12">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Failed to load article. Please check your API endpoint configuration.</p>
              <div className="text-sm text-gray-600 mb-4">
                Attempted to load from: {process.env.NEXT_PUBLIC_API_URL}/api/blog/post/{params.slug}
              </div>
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer locale={params.locale} dictionary={dictionary} />
      </div>
    );
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    // Try multiple API paths to ensure one works
    let post;
    
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/post/${params.slug}`);
      post = response.data;
    } catch (err) {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params.slug}`);
        post = response.data;
      } catch (err2) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${params.slug}`);
        post = response.data;
      }
    }
    
    if (!post) {
      return {
        title: 'Blog Post',
        description: 'Read our latest blog post',
      };
    }
    
    return {
      title: post.title,
      description: post.excerpt || post.title,
    };
  } catch (error) {
    return {
      title: 'Blog Post',
      description: 'Read our latest blog post',
    };
  }
} 