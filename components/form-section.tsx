import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function FormSection() {
  return (
    <section className="p-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#d9d9d9] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 text-[#000000]">Iniciar Sesión</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre" className="text-[#000000]">Nombre</Label>
              <Input id="nombre" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="contraseña" className="text-[#000000]">Contraseña</Label>
              <Input id="contraseña" type="password" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="comentarios" className="text-[#000000]">Comentarios</Label>
              <Textarea id="comentarios" className="mt-1" rows={4} />
            </div>
            
            <Button className="w-full bg-[#004386] hover:bg-[#005ea6] text-white">
              Enviar
            </Button>
          </div>
        </div>
        
        <div className="bg-[#004386] text-white p-4 rounded">
          <h3 className="font-medium">Redes Sociales</h3>
        </div>
      </div>
    </section>
  )
}
