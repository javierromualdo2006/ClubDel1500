import { Footer } from "./footer"

export function ReportsPage() {
  const headers = ["Nombre", "Fecha", "Estado", "Acciones"]
  const rows = Array.from({ length: 6 }, (_, i) => [
    `Item ${i + 1}`,
    "2024-01-15",
    "Activo",
    "Ver"
  ])

  return (
    <main className="p-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[#000000]">Reportes</h1>
        
        <div className="bg-[#d9d9d9] rounded-lg p-6 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#000000]">
                  {headers.map((header, index) => (
                    <th key={index} className="text-left p-3 text-[#000000] font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-300">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-3 text-[#000000] text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-[#004386] text-white p-4 rounded">
          <h3 className="font-medium">Redes Sociales</h3>
        </div>
      </div>
      <Footer />
    </main>
  )
}
