"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Loader2, Image } from "lucide-react"
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

// Define interfaces for our data types
interface Brand {
  _id: string
  name: string
  logo: string
  createdAt: string
  updatedAt: string
}

export default function BrandsListPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch all brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await axios.get(`${apiBaseUrl}/brands/all-brands`)
        setBrands(response.data)
        setFilteredBrands(response.data)
      } catch (error) {
        console.error("Error fetching brands:", error)
        toast({
          title: "Error",
          description: "Failed to load brands. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // Filter brands based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBrands(brands)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = brands.filter(
        brand => brand.name.toLowerCase().includes(lowercasedSearch)
      )
      setFilteredBrands(filtered)
    }
    setCurrentPage(1)
  }, [searchTerm, brands])

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBrands.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle edit brand
  const handleEditBrand = (brandId: string) => {
    router.push(`/admin/brands/edit/${brandId}`)
  }

  // Handle delete brand
  const handleDeleteBrand = async () => {
    if (!brandToDelete) return

    try {
      setIsDeleting(true)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      await axios.delete(`${apiBaseUrl}/brands/${brandToDelete._id}`)
      
      // Update the brands list
      setBrands(prevBrands => prevBrands.filter(brand => brand._id !== brandToDelete._id))
      
      toast({
        title: "Success",
        description: "Brand deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast({
        title: "Error",
        description: "Failed to delete brand. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setBrandToDelete(null)
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
        <h1 className="text-2xl font-bold">Brands Management</h1>
        <Button onClick={() => router.push("/admin/brands")}>Add New Brand</Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search brands..."
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
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No brands found. {searchTerm && "Try a different search term."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Logo</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((brand) => (
                      <tr key={brand._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {brand.logo ? (
                            <div className="relative h-12 w-12">
                              <img
                                src={brand.logo.startsWith('http') 
                                  ? brand.logo 
                                  : `http://localhost:5000/${brand.logo.replace(/^uploads\//, '')}`}
                                alt={brand.name}
                                className="h-full w-full object-contain rounded"
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
                                <Image className="h-6 w-6 text-muted-foreground" />
                              </div>
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-muted flex items-center justify-center rounded">
                              <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">{brand.name}</td>
                        <td className="py-3 px-4">{formatDate(brand.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBrand(brand._id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setBrandToDelete(brand)
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
                    {indexOfLastItem > filteredBrands.length
                      ? filteredBrands.length
                      : indexOfLastItem}{" "}
                    of {filteredBrands.length} brands
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
              Are you sure you want to delete the brand "{brandToDelete?.name}"? This action cannot be undone.
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
              onClick={handleDeleteBrand}
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