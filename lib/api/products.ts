import { getPB, ensureConnection } from '@/lib/pocketbase'

export interface Product {
  id: string
  ProductName: string
  description?: string
  price: number
  url_MercadoLibre?: string
  url_img?: string
  created: string
  updated: string
}

export class ProductsAPI {
  private static collection = 'products'

  private static async ensureConnection() {
    try {
      await ensureConnection('http://127.0.0.1:8090')
    } catch (error) {
      console.error('❌ Error conectando a PocketBase:', error)
      throw new Error('No se pudo conectar a la base de datos')
    }
  }

  private static mapProduct(record: any): Product {
    return {
      id: record.id,
      ProductName: record.ProductName,
      description: record.description,
      price: record.price,
      url_MercadoLibre: record.url_MercadoLibre,
      url_img: record.url_img,
      created: record.created,
      updated: record.updated,
    }
  }

  // 🧾 Obtener todos los productos
  static async getAll(): Promise<Product[]> {
    await this.ensureConnection()
    const pb = getPB()

    try {
      const records = await pb.collection(this.collection).getFullList({
        requestKey: null, // 🚫 evita la autocancelación
      })

      return records.map((r) => this.mapProduct(r))
    } catch (error: any) {
      console.error('❌ Error cargando productos:', error)
      throw new Error(error?.message || 'No se pudieron cargar los productos')
    }
  }

  // 🔍 Obtener producto por ID
  static async getById(id: string): Promise<Product | null> {
    await this.ensureConnection()
    const pb = getPB()

    try {
      const record = await pb.collection(this.collection).getOne(id, {
        requestKey: null,
      })
      return this.mapProduct(record)
    } catch (error: any) {
      console.error('❌ Error obteniendo producto por ID:', error)
      return null
    }
  }

  // ➕ Crear un nuevo producto
  static async create(data: Omit<Product, 'id' | 'created' | 'updated'>): Promise<Product> {
    await this.ensureConnection()
    const pb = getPB()

    try {
      const created = await pb.collection(this.collection).create(data, {
        requestKey: null,
      })
      return this.mapProduct(created)
    } catch (error: any) {
      console.error('❌ Error creando producto:', error)
      throw new Error(error.data?.message || 'Error al crear producto')
    }
  }

  // ✏️ Actualizar producto existente
  static async update(id: string, data: Partial<Product>): Promise<Product | null> {
    await this.ensureConnection()
    const pb = getPB()

    try {
      const updated = await pb.collection(this.collection).update(id, data, {
        requestKey: null,
      })
      return this.mapProduct(updated)
    } catch (error: any) {
      console.error('❌ Error actualizando producto:', error)
      return null
    }
  }

  // 🗑️ Eliminar producto
  static async delete(id: string): Promise<boolean> {
    await this.ensureConnection()
    const pb = getPB()

    try {
      await pb.collection(this.collection).delete(id, { requestKey: null })
      return true
    } catch (error: any) {
      console.error('❌ Error eliminando producto:', error)
      return false
    }
  }

  // 🔎 Buscar productos por nombre o descripción
  static async search(query: string): Promise<Product[]> {
    await this.ensureConnection()
    const pb = getPB()
    const filter = `ProductName ~ "${query}" || description ~ "${query}"`

    try {
      const records = await pb.collection(this.collection).getFullList({
        filter,
        requestKey: null,
      })
      return records.map((r) => this.mapProduct(r))
    } catch (error: any) {
      console.error('❌ Error buscando productos:', error)
      return []
    }
  }
}
