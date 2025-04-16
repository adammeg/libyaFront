import { getDictionary } from '@/lib/dictionaries'
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

export default async function ContactPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // Server component - loads dictionary
  const dictionary = await getDictionary(locale);
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader dictionary={dictionary} />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-4xl font-bold mb-6">
            {dictionary.contact?.title || 'Contact Us'}
          </h1>
          <p className="text-lg mb-8">
            {dictionary.contact?.description || 'Get in touch with our team. We\'re here to help.'}
          </p>
          
          {/* Contact form will go here */}
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              {/* Contact information */}
              <h2 className="text-2xl font-semibold mb-4">
                {dictionary.contact?.infoTitle || 'Contact Information'}
              </h2>
              <address className="not-italic space-y-3">
                <p>Tripoli, Libya</p>
                <p>Email: info@libyaauto.com</p>
                <p>Phone: +218 91-234-5678</p>
              </address>
            </div>
            <div>
              {/* Contact form placeholder */}
              <h2 className="text-2xl font-semibold mb-4">
                {dictionary.contact?.formTitle || 'Send us a message'}
              </h2>
              <div className="p-6 border rounded-lg">
                <p className="text-muted-foreground">
                  {dictionary.contact?.formPlaceholder || 'Contact form will be implemented here.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
} 