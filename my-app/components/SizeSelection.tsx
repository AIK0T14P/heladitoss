"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function SizeSelection({
  onSizeSelect,
}: {
  onSizeSelect: (maxSabores: number, quantity: number) => void
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [tamanos, setTamanos] = useState([
    { nombre: "Promo 2kg", precio: 5000, maxSabores: 8 },
    { nombre: "Pote de 1kg", precio: 3000, maxSabores: 4 },
    { nombre: "Pote de 1/2kg", precio: 2000, maxSabores: 4 },
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const res = await fetch("/api/sizes", { 
          cache: 'force-cache',
          next: { revalidate: 3600 }
        })
        const data = await res.json()
        if (data.some((item: any) => item.precio > 0)) {
          setTamanos(data)
        }
      } catch (err) {
        console.error("Error loading sizes:", err)
      } finally {
        setIsLoading(false)
      }

      const storedSize = localStorage.getItem("selectedSize")
      const storedQuantity = localStorage.getItem("selectedQuantity")
      if (storedSize) {
        setSelectedSize(storedSize)
        const selectedTamano = tamanos.find((t) => t.nombre === storedSize)
        if (selectedTamano) {
          onSizeSelect(selectedTamano.maxSabores, Number.parseInt(storedQuantity || "1"))
        }
      }
      if (storedQuantity) {
        setQuantity(Number.parseInt(storedQuantity))
      }
    }

    fetchSizes()
  }, [])

  const handleSizeSelect = (nombre: string, maxSabores: number) => {
    setSelectedSize(nombre)
    onSizeSelect(maxSabores, quantity)
    localStorage.setItem("selectedSize", nombre)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    localStorage.setItem("selectedQuantity", newQuantity.toString())
    if (selectedSize) {
      const selectedTamano = tamanos.find((t) => t.nombre === selectedSize)
      if (selectedTamano) {
        onSizeSelect(selectedTamano.maxSabores, newQuantity)
      }
    }
  }

  return (
    <section id="tamanos" className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Elige el tamaño de tu helado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {isLoading ? (
            <>
              {[1,2,3].map((_, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg bg-gray-200 animate-pulse"
                >
                  <div className="h-6 bg-gray-300 mb-2"></div>
                  <div className="h-8 bg-gray-300"></div>
                </div>
              ))}
            </>
          ) : (
            tamanos.map((tamano) => (
              <motion.div
                key={tamano.nombre}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedSize === tamano.nombre ? "bg-purple-100 border-purple-500" : "bg-white border-gray-300"
                }`}
                onClick={() => handleSizeSelect(tamano.nombre, tamano.maxSabores)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{tamano.nombre}</h3>
                <p className="text-2xl font-bold text-purple-600">ARS ${tamano.precio.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">Hasta {tamano.maxSabores} sabores por unidad</p>
              </motion.div>
            ))
          )}
        </div>
        {selectedSize && (
          <div className="mt-8 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-4">Tamaño seleccionado: {selectedSize}</p>
            <div className="inline-block bg-purple-100 p-4 rounded-lg border-2 border-purple-500">
              <label htmlFor="quantity" className="block text-lg font-medium text-gray-700 mb-2">
                Cantidad de unidades:
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value))}
                className="border-2 border-purple-500 rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} unidad{num > 1 ? "es" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}