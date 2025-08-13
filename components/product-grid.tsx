export function ProductGrid() {
  const products = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Producto ${i + 1}`,
    description: "Descripción del producto",
    price: "$99"
  }))

  return (
    <section className="p-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {products.map((product) => (
            <div key={product.id} className="bg-[#d9d9d9] rounded-lg p-4">
              <div className="aspect-square bg-white rounded mb-3"></div>
              <h3 className="font-medium text-sm text-[#000000]">{product.name}</h3>
              <p className="text-xs text-[#000000] mb-2">{product.description}</p>
              <p className="text-sm font-semibold text-[#000000]">{product.price}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-[#004386] text-white p-4 rounded">
          <h3 className="font-medium">Redes Sociales</h3>
        </div>
      </div>
    </section>
  )
}
