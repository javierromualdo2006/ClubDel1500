"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { Footer } from "./footer"
import { useAuth } from "@/contexts/auth-context"
import { ProductsAPI, type Product } from "@/lib/api/products"

export function ProductsPage() {
  const { isAdmin, currentUser } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    ProductName: "",
    description: "",
    price: "",
    url_img: "",
    url_MercadoLibre: "",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const allProducts = await ProductsAPI.getAll()
      setProducts(allProducts)
      console.log("Productos cargados:", allProducts.length)
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.ProductName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddDialog = () => {
    setEditingProduct(null)
    setFormData({
      ProductName: "",
      description: "",
      price: "",
      url_img: "",
      url_MercadoLibre: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      ProductName: product.ProductName,
      description: product.description || "",
      price: product.price.toString(),
      url_img: product.url_img || "",
      url_MercadoLibre: product.url_MercadoLibre || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (formData.ProductName && formData.description && formData.price && currentUser) {
      try {
        if (editingProduct) {
          const updatedProduct = await ProductsAPI.update(editingProduct.id, {
            ProductName: formData.ProductName,
            description: formData.description,
            price: parseFloat(formData.price),
            url_img: formData.url_img || undefined,
            url_MercadoLibre: formData.url_MercadoLibre || undefined,
          })
          if (updatedProduct) await loadProducts()
        } else {
          await ProductsAPI.create({
            ProductName: formData.ProductName,
            description: formData.description,
            price: parseFloat(formData.price),
            url_img: formData.url_img || undefined,
            url_MercadoLibre: formData.url_MercadoLibre || undefined,
          })
          await loadProducts()
        }

        setIsDialogOpen(false)
        setFormData({
          ProductName: "",
          description: "",
          price: "",
          url_img: "",
          url_MercadoLibre: "",
        })
      } catch (error) {
        console.error("Error guardando producto:", error)
        alert("Error guardando producto")
      }
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      const success = await ProductsAPI.delete(productId)
      if (success) {
        await loadProducts()
        const notification = document.createElement("div")
        notification.textContent = "Producto eliminado correctamente"
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc2626;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 1000;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      }
    } catch (error) {
      console.error("Error eliminando producto:", error)
      alert("Error eliminando producto")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004386] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#000000]">Productos</h1>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {isAdmin() && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={openAddDialog}
                      className="bg-[#004386] hover:bg-[#005ea6] text-white w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProduct
                          ? "Modifica la información del producto seleccionado."
                          : "Completa los datos para agregar un nuevo producto al catálogo."}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="ProductName" className="text-sm">Nombre del producto</Label>
                        <Input
                          id="ProductName"
                          value={formData.ProductName}
                          onChange={(e) => setFormData({ ...formData, ProductName: e.target.value })}
                          placeholder="Ej: Laptop Gaming"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Descripción</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Ej: Laptop para gaming de alta gama"
                        />
                      </div>

                      <div>
                        <Label htmlFor="price" className="text-sm">Precio</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="Ej: 1299"
                        />
                      </div>

                      <div>
                        <Label htmlFor="url_MercadoLibre" className="text-sm">Link de MercadoLibre</Label>
                        <Input
                          id="url_MercadoLibre"
                          value={formData.url_MercadoLibre}
                          onChange={(e) => setFormData({ ...formData, url_MercadoLibre: e.target.value })}
                          placeholder="https://articulo.mercadolibre.com.ar/..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="url_img" className="text-sm">URL de la imagen del producto</Label>
                        <Input
                          id="url_img"
                          value={formData.url_img}
                          onChange={(e) => setFormData({ ...formData, url_img: e.target.value })}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {formData.url_img && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                            <img
                              src={formData.url_img || "/placeholder.svg"}
                              alt="Vista previa del producto"
                              className="w-24 h-24 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=120&width=120&text=Error"
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSubmit} className="bg-[#004386] hover:bg-[#005ea6] flex-1 text-sm">
                          {editingProduct ? "Actualizar" : "Agregar"} Producto
                        </Button>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-sm">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pb-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-[#d9d9d9] hover:shadow-lg transition-all duration-200">
                <CardContent className="p-3">
                  <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                    {product.url_img ? (
                      <img
                        src={product.url_img}
                        alt={product.ProductName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=150&width=150&text=Producto"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-[#000000] mb-1 line-clamp-2 leading-tight">
                    {product.ProductName}
                  </h3>
                  <p className="text-xs text-[#000000] mb-2 line-clamp-2 leading-relaxed opacity-80">
                    {product.description}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-[#004386] mb-2">${product.price}</p>

                  {product.url_MercadoLibre && (
                    <div className="mb-2">
                      <Button
                        size="sm"
                        className="w-full bg-[#fff159] hover:bg-[#e6d950] text-black font-medium text-xs py-1.5 h-7"
                        onClick={() => window.open(product.url_MercadoLibre, "_blank")}
                      >
                        Ver en ML
                      </Button>
                    </div>
                  )}

                  {isAdmin() && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs px-2 py-1 h-6 bg-transparent"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-6 bg-transparent"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
