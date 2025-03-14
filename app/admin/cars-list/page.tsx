"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Loader2, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatImagePath } from '@/utils/image-helpers'

// Define interfaces for our data types
interface Brand {
  _id: string
  name: string
  logo: string
}

interface Importer {
  _id: string
  name: string
  address: string
  telephone: string
  email: string
  profileImage: string | null
  brands: Brand[] | string[]
}

interface Car {
  _id: string
  brands: Brand[] | string[]
  model: string
  photos: string[]
  price: string
  description: string
  importer: Importer | string
  createdAt: string
  updatedAt: string
}

export default function CarsListPage() {
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [carToDelete, setCarToDelete] = useState<Car | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch all cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/cars/all-cars")
        setCars(response.data)
        setFilteredCars(response.data)
      } catch (error) {
        console.error("Error fetching cars:", error)
        toast({
          title: "Error",
          description: "Failed to load cars. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  // Filter cars based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCars(cars)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = cars.filter(
        car =>
          car.model.toLowerCase().includes(lowercasedSearch) ||
          (typeof car.importer === "object" && car.importer.name.toLowerCase().includes(lowercasedSearch)) ||
          car.price.includes(searchTerm) ||
          car.description.toLowerCase().includes(lowercasedSearch)
      )
      setFilteredCars(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, cars])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredCars.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle edit car
  const handleEditCar = (carId: string) => {
    router.push(`/admin/cars/edit/${carId}`)
  }

  // Handle delete car
  const handleDeleteCar = async () => {
    if (!carToDelete) return

    try {
      setIsDeleting(true)
      await axios.delete(`http://localhost:5000/cars/${carToDelete._id}`)
      
      // Update the cars list
      setCars(prevCars => prevCars.filter(car => car._id !== carToDelete._id))
      
      toast({
        title: "Success",
        description: "Car deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting car:", error)
      toast({
        title: "Error",
        description: "Failed to delete car. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCarToDelete(null)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cars Management</h1>
        <Button onClick={() => router.push("/admin/cars")}>Add New Car</Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Cars</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cars..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cars found. {searchTerm && "Try a different search term."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Image</th>
                      <th className="text-left py-3 px-4">Model</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Importer</th>
                      <th className="text-left py-3 px-4">Brands</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((car) => (
                      <tr key={car._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {car.photos && car.photos.length > 0 ? (
                            <div className="relative h-12 w-16">
                              <img
                                src={formatImagePath(car.photos[0])}
                                alt={car.model}
                                className="h-full w-full object-cover rounded"
                                onError={(e) => {
                                  // Hide the image on error
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  // Show the fallback div
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.fallback-icon');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }
                                }}
                              />
                              <div className="fallback-icon hidden absolute inset-0 bg-muted flex items-center justify-center rounded">
                                <Car className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </div>
                          ) : (
                            <div className="h-12 w-16 bg-muted flex items-center justify-center rounded">
                              <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">{car.model}</td>
                        <td className="py-3 px-4">{car.price} DT</td>
                        <td className="py-3 px-4">
                          {typeof car.importer === "object" ? car.importer.name : "Unknown"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(car.brands) &&
                              car.brands.map((brand: any, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                                >
                                  {typeof brand === "object" ? brand.name : "Unknown"}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatDate(car.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCar(car._id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setCarToDelete(car)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1}-
                    {indexOfLastItem > filteredCars.length
                      ? filteredCars.length
                      : indexOfLastItem}{" "}
                    of {filteredCars.length} cars
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <Button variant="outline" size="sm" disabled>
                              ...
                            </Button>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the car "{carToDelete?.model}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
