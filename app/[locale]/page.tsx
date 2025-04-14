import { getDictionary } from '@/lib/dictionaries'
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import ClientHomePage from "@/components/client-home-page" 

export default async function Home({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // Server component - loads dictionary
  let dictionary;
  
  try {
    dictionary = await getDictionary(locale);
  } catch (error) {
    console.error("Failed to load dictionary:", error);
    // Return a basic page if dictionary loading fails
    return (
      <div className="flex min-h-screen flex-col">
        <div className="container py-12 text-center">
          <h1 className="text-4xl font-bold">Welcome to Libya Auto</h1>
          <p className="mt-4">We apologize, but there was an error loading the page content.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Pass dictionary data to client component */}
        <ClientHomePage 
          locale={locale} 
          dictionary={dictionary} 
        />
      </main>
      <Footer />
    </div>
  );
}