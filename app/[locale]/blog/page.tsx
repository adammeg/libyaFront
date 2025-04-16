import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { getDictionary } from '@/lib/dictionaries'
import BlogContent from "@/components/blog-content"

export default async function BlogPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // Server component - loads dictionary
  const dictionary = await getDictionary(locale);
  
  // Log for debugging
  console.log("BlogPage server render, locale:", locale);
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader dictionary={dictionary} />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-6">
            {dictionary.blog?.title || 'Blog'}
          </h1>
          <p className="text-lg mb-8">
            {dictionary.blog?.description || 'Latest news and updates from Libya Auto.'}
          </p>
          
          {/* Wrap the client component with Suspense */}
          <Suspense fallback={<div className="text-center py-12">Loading blog posts...</div>}>
            <BlogContent locale={locale} dictionary={dictionary} />
          </Suspense>
        </div>
      </main>
      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
} 