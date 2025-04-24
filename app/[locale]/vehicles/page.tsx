"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { VehicleCard } from "@/components/vehicle-card"
import { api } from "@/utils/api-helpers"

export default function VehiclesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const [dictionary, setDictionary] = useState<any>({});
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load dictionary
    async function loadDictionary() {
      try {
        const { getDictionary } = await import('@/lib/dictionaries');
        const dict = await getDictionary(locale);
        setDictionary(dict);
        
        if (dict.error) {
          setError("Error loading translations");
          return;
        }
      } catch (err) {
        console.error("Error loading dictionary:", err);
        setError("Error loading translations");
      }
    }
    
    // Load vehicles
    async function fetchVehicles() {
      try {
        const response = await api.get('/cars', { lang: locale });
        setVehicles(response.data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Error loading vehicles");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadDictionary();
    fetchVehicles();
  }, [locale]);

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader dictionary={dictionary} />
        <main className="flex-1">
          <div className="container py-12">
            <h1 className="text-4xl font-bold mb-6">Vehicles</h1>
            <p className="text-lg mb-8 text-red-500">
              {error}. Please try again later.
            </p>
          </div>
        </main>
        <Footer dictionary={dictionary} locale={locale} />
      </div>
    );
  }

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
} 