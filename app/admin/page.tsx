"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Settings } from "lucide-react"

// Define interfaces for our data types     
interface Importer {
  _id: string
  name: string
  address: string
  telephone: string
  email: string
  profileImage: string | null
  brands: Brand[] | string[]
}

interface Brand {
  _id: string
  name: string
  logo: string
}

interface Car {
  _id: string
  brands: Brand[] | string[]
  model: string
  photos: string[]
  price: string
  description: string
  importer: Importer | string
  logo: string | null
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#FF69B4']

export default function AdminDashboard() {
  // State for data
  const [importers, setImporters] = useState<Importer[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [cars, setCars] = useState<Car[]>([])

  // State for loading and errors
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State for search/filter
  const [importerSearch, setImporterSearch] = useState<string>("")
  const [brandSearch, setBrandSearch] = useState<string>("")
  const [carSearch, setCarSearch] = useState<string>("")

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [importersRes, brandsRes, carsRes] = await Promise.all([
          axios.get("http://localhost:5000/importers/all-importers"),
          axios.get("http://localhost:5000/brands/all-brands"),
          axios.get("http://localhost:5000/cars/all-cars")
        ])

        setImporters(importersRes.data)
        setBrands(brandsRes.data)
        setCars(carsRes.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare data for charts
  const importerBrandCounts = importers.map(importer => ({
    name: importer.name,
    count: Array.isArray(importer.brands) ? importer.brands.length : 0
  }))

  // Count cars by importer
  const carsByImporter = cars.reduce((acc: Record<string, number>, car) => {
    const importerName = typeof car.importer === 'object' ? car.importer.name : 'Unknown'
    acc[importerName] = (acc[importerName] || 0) + 1
    return acc
  }, {})

  const carsByImporterData = Object.entries(carsByImporter).map(([name, value]) => ({ name, value }))

  // Filter functions
  const filteredImporters = importers.filter(importer =>
    importer.name.toLowerCase().includes(importerSearch.toLowerCase()) ||
    importer.email.toLowerCase().includes(importerSearch.toLowerCase())
  )

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  )

  const filteredCars = cars.filter(car =>
    car.model.toLowerCase().includes(carSearch.toLowerCase()) ||
    (typeof car.importer === 'object' && car.importer.name.toLowerCase().includes(carSearch.toLowerCase()))
  )

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of all data in the system</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Importers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cars.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Brands per Importer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={importerBrandCounts}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cars by Importer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carsByImporterData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {carsByImporterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="importers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="importers">Importers</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="cars">Cars</TabsTrigger>
        </TabsList>

        {/* Importers Tab */}
        <TabsContent value="importers">
          <Card>
            <CardHeader>
              <CardTitle>Importers</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search importers..."
                  value={importerSearch}
                  onChange={(e) => setImporterSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-left">Address</th>
                      <th className="py-3 px-4 text-left">Telephone</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Brands</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImporters.length > 0 ? (
                      filteredImporters.map((importer) => (
                        <tr key={importer._id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{importer.name}</td>
                          <td className="py-3 px-4">{importer.address}</td>
                          <td className="py-3 px-4">{importer.telephone}</td>
                          <td className="py-3 px-4">{importer.email}</td>
                          <td className="py-3 px-4">
                            {Array.isArray(importer.brands) && importer.brands.length > 0
                              ? importer.brands.map((brand: any) =>
                                typeof brand === 'object' ? brand.name : brand
                              ).join(', ')
                              : 'No brands'
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground">
                          No importers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brands Tab */}
        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>Brands</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Logo</th>
                      <th className="py-3 px-4 text-left">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((brand) => (
                        <tr key={brand._id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {brand.logo && (
                              <img
                                src={`http://localhost:5000/${brand.logo}`}
                                alt={brand.name}
                                className="h-10 w-10 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                                }}
                              />
                            )}
                          </td>
                          <td className="py-3 px-4">{brand.name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-muted-foreground">
                          No brands found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cars Tab */}
        <TabsContent value="cars">
          <Card>
            <CardHeader>
              <CardTitle>Cars</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search cars..."
                  value={carSearch}
                  onChange={(e) => setCarSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Model</th>
                      <th className="py-3 px-4 text-left">Price</th>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-left">Importer</th>
                      <th className="py-3 px-4 text-left">Brands</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.length > 0 ? (
                      filteredCars.map((car) => (
                        <tr key={car._id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{car.model}</td>
                          <td className="py-3 px-4">{car.price}</td>
                          <td className="py-3 px-4">
                            {car.description ? car.description.substring(0, 50) + '...' : 'No description'}
                          </td>
                          <td className="py-3 px-4">
                            {typeof car.importer === 'object' ? car.importer.name : car.importer}
                          </td>
                          <td className="py-3 px-4">
                            {Array.isArray(car.brands) && car.brands.length > 0
                              ? car.brands.map((brand: any) =>
                                typeof brand === 'object' ? brand.name : brand
                              ).join(', ')
                              : 'No brands'
                            }
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground">
                          No cars found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
