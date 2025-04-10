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
import { useAuth } from "@/context/auth-context"
import { Car, Tag, Users, ShoppingBag, BarChart3 } from "lucide-react"

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
  const { user } = useAuth()
  const [importers, setImporters] = useState<Importer[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [stats, setStats] = useState({
    cars: 0,
    brands: 0,
    importers: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [importerSearch, setImporterSearch] = useState<string>("")
  const [brandSearch, setBrandSearch] = useState<string>("")
  const [carSearch, setCarSearch] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const [importersRes, brandsRes, carsRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/importers/all-importers`),
          axios.get(`${apiBaseUrl}/brands/all-brands`),
          axios.get(`${apiBaseUrl}/cars/all-cars`)
        ])

        setImporters(importersRes.data)
        setBrands(brandsRes.data)
        setCars(carsRes.data)
        setError(null)

        // Get counts of various entities
        const [carsResCount, brandsResCount, importersResCount] = await Promise.all([
          axios.get(`${apiBaseUrl}/cars/all-cars`),
          axios.get(`${apiBaseUrl}/brands/all-brands`),
          axios.get(`${apiBaseUrl}/importers/all-importers`),
        ])
        
        setStats({
          cars: carsResCount.data.length,
          brands: brandsResCount.data.length,
          importers: importersResCount.data.length,
        })
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}! Here's an overview of your site.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vehicles
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : stats.cars}
            </div>
            <p className="text-xs text-muted-foreground">
              Listed on your website
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Brands
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : stats.brands}
            </div>
            <p className="text-xs text-muted-foreground">
              Available on the platform
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Importers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : stats.importers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered on the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              System is running normally
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="/admin/cars"
                className="flex flex-col items-center justify-center rounded-lg border border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Car className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">Add Vehicle</span>
              </a>
              <a 
                href="/admin/brands"
                className="flex flex-col items-center justify-center rounded-lg border border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Tag className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">Add Brand</span>
              </a>
              <a 
                href="/admin/importers"
                className="flex flex-col items-center justify-center rounded-lg border border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground"
              >
                <Users className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">Add Importer</span>
              </a>
              <a 
                href="/admin/hero-slides"
                className="flex flex-col items-center justify-center rounded-lg border border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground"
              >
                <ShoppingBag className="mb-2 h-6 w-6" />
                <span className="text-sm font-medium">Hero Slides</span>
              </a>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current status of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-sm font-medium">Backend API</p>
                <p className="text-xs text-muted-foreground">
                  Online and running normally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-sm font-medium">Frontend</p>
                <p className="text-xs text-muted-foreground">
                  Online and running normally
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">
                  Connected and healthy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
