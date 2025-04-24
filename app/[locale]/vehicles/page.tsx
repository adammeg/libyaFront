"use client"

import { getDictionary, Dictionary } from '@/lib/dictionaries'
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { VehicleCard } from "@/components/vehicle-card"
import { api } from "@/utils/api-helpers"
import { useState, useEffect } from "react"

export default async function VehiclesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  try {
    // Server component - loads dictionary
    const dictionary = await getDictionary(locale);
    
    // Check if we got an error response
    if (dictionary.error) {
      console.error("Dictionary error:", dictionary.error);
      // Provide a minimal page with error
      return (
        <div className="flex min-h-screen flex-col">
          <SiteHeader dictionary={{}} />
          <main className="flex-1">
            <div className="container py-12">
              <h1 className="text-4xl font-bold mb-6">Vehicles</h1>
              <p className="text-lg mb-8 text-red-500">
                Error loading translations. Please try again later.
              </p>
            </div>
          </main>
          <Footer dictionary={{}} locale={locale} />
        </div>
      );
    }
    
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
      async function fetchVehicles() {
        try {
          const response = await api.get('/cars', { lang: locale });
          setVehicles(response.data);
        } catch (error) {
          console.error("Error fetching vehicles:", error);
        }
      }
      
      fetchVehicles();
    }, [locale]);

    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader dictionary={dictionary} />
        <main className="flex-1">
          <div className="container py-12">
            <h1 className="text-4xl font-bold mb-6">
              {dictionary.vehicles?.title || 'Vehicles'}
            </h1>
            <p className="text-lg mb-8">
              {dictionary.vehicles?.description || 'Browse our wide selection of vehicles from top brands.'}
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle: any) => (
                <VehicleCard 
                  key={vehicle._id} 
                  vehicle={vehicle} 
                  locale={locale} 
                />
              ))}
            </div>
          </div>
        </main>
        <Footer dictionary={dictionary} locale={locale} />
      </div>
    );
  } catch (error) {
    console.error("Error in vehicles page:", error);
    return <div>Error loading page. Please try again later.</div>;
  }
} 