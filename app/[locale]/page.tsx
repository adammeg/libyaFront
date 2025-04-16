import { getDictionary, Dictionary } from '@/lib/dictionaries'
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import ClientHomePage from "@/components/client-home-page"

export default async function Home({
  params: { locale }
}: {
  params: { locale: string }
}) {
  console.log("Loading page for locale:", locale);
  
  // Server component - loads dictionary
  let dictionary: Dictionary;
  
  try {
    dictionary = await getDictionary(locale);
    console.log("Dictionary loaded:", Object.keys(dictionary));
    
    // Check if it's an error response
    if (dictionary.error) {
      console.error("Dictionary error:", dictionary.error);
      // Return a basic page if dictionary loading fails
      return (
        <div className="flex min-h-screen flex-col">
          <div className="container py-12 text-center">
            <h1 className="text-4xl font-bold">Welcome to Libya Auto</h1>
            <p className="mt-4 text-red-500">Error loading translations. Please try again later.</p>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("Failed to load dictionary:", error);
    // Return a basic page if dictionary loading fails
    return (
      <div className="flex min-h-screen flex-col">
        <div className="container py-12 text-center">
          <h1 className="text-4xl font-bold">Welcome to Libya Auto</h1>
          <p className="mt-4">Error loading translations</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader dictionary={dictionary} />
      <main className="flex-1">
        <ClientHomePage 
          locale={locale} 
          dictionary={dictionary} 
        />
      </main>
      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
}