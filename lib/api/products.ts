import { LocalStorage, FileStorage } from "../storage"

export interface Product {
  id: string
  name: string
  description: string
  price: string
  imageUrl?: string
  imageFileId?: string
  mercadoLibreUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export class ProductsAPI {
  private static STORAGE_KEY = "products"

  static async getAll(): Promise<Product[]> {
    const products = LocalStorage.get<Product[]>(this.STORAGE_KEY, [])
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  static async getById(id: string): Promise<Product | null> {
    const products = await this.getAll()
    return products.find((p) => p.id === id) || null
  }

  static async create(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
    imageFile?: File,
  ): Promise<Product> {
    const products = await this.getAll()

    let imageFileId: string | undefined
    let imageUrl: string | undefined

    if (imageFile) {
      imageFileId = await FileStorage.saveFile(imageFile)
      imageUrl = FileStorage.getFileUrl(imageFileId) || undefined
    } else if (productData.imageUrl) {
      imageUrl = productData.imageUrl
    }

    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      imageUrl,
      imageFileId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    products.push(newProduct)
    LocalStorage.set(this.STORAGE_KEY, products)

    return newProduct
  }

  static async update(id: string, productData: Partial<Product>, imageFile?: File): Promise<Product | null> {
    const products = await this.getAll()
    const index = products.findIndex((p) => p.id === id)

    if (index === -1) return null

    const existingProduct = products[index]

    let imageFileId = existingProduct.imageFileId
    let imageUrl = existingProduct.imageUrl

    if (imageFile) {
      // Eliminar archivo anterior si existe
      if (existingProduct.imageFileId) {
        FileStorage.deleteFile(existingProduct.imageFileId)
      }

      imageFileId = await FileStorage.saveFile(imageFile)
      imageUrl = FileStorage.getFileUrl(imageFileId) || undefined
    } else if (productData.imageUrl !== undefined) {
      imageUrl = productData.imageUrl
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...productData,
      imageUrl,
      imageFileId,
      updatedAt: new Date().toISOString(),
    }

    products[index] = updatedProduct
    LocalStorage.set(this.STORAGE_KEY, products)

    return updatedProduct
  }

  static async delete(id: string): Promise<boolean> {
    const products = await this.getAll()
    const productToDelete = products.find((p) => p.id === id)

    if (!productToDelete) return false

    // Eliminar archivo de imagen si existe
    if (productToDelete.imageFileId) {
      FileStorage.deleteFile(productToDelete.imageFileId)
    }

    const filteredProducts = products.filter((p) => p.id !== id)
    LocalStorage.set(this.STORAGE_KEY, filteredProducts)

    return true
  }

  static async search(query: string): Promise<Product[]> {
    const products = await this.getAll()
    const lowercaseQuery = query.toLowerCase()

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery),
    )
  }
}
