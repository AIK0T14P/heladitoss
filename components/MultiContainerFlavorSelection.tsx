"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import FlavorSelection from "./FlavorSelection"

export default function MultiContainerFlavorSelection({
  maxFlavors,
  quantity,
}: {
  maxFlavors: number
  quantity: number
}) {
  const [currentContainer, setCurrentContainer] = useState(1)
  const [containerFlavors, setContainerFlavors] = useState<{ [key: number]: string[] }>({})

  // Cargar sabores guardados al iniciar
  useEffect(() => {
    const storedFlavors = localStorage.getItem("containerFlavors")
    if (storedFlavors) {
      setContainerFlavors(JSON.parse(storedFlavors))
    }
  }, [])

  // Guardar sabores cuando cambien
  useEffect(() => {
    localStorage.setItem("containerFlavors", JSON.stringify(containerFlavors))
  }, [containerFlavors])

  const handleFlavorSelection = (flavors: string[]) => {
    setContainerFlavors((prev) => ({ ...prev, [currentContainer]: flavors }))
  }

  const getContainerStatus = (containerNum: number) => {
    const flavors = containerFlavors[containerNum] || []
    return flavors.length > 0
  }

  const allContainersSelected = () => {
    return Array.from({ length: quantity }, (_, i) => i + 1).every((num) => getContainerStatus(num))
  }

  return (
    <section id="multi-container-flavors" className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {quantity >= 2 ? "Selecciona los sabores para cada pote" : "Selecciona los sabores"}
        </h2>
        
        {quantity >= 2 && (
          <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-4 max-w-4xl mx-auto mb-6">
            {Array.from({ length: quantity }, (_, i) => i + 1).map((num) => (
              <motion.button
                key={num}
                className={`flex flex-col items-center justify-center w-full md:w-32 h-32 rounded-lg ${
                  currentContainer === num
                    ? "bg-purple-500 text-white"
                    : getContainerStatus(num)
                    ? "bg-green-100 text-green-800 border-2 border-green-500"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setCurrentContainer(num)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg font-semibold mb-2">Pote {num}</span>
                {getContainerStatus(num) ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-xs text-center text-orange-600 px-1">
                      Selecciona sabores
                    </span>
                  </>
                )}
              </motion.button>
            ))}
          </div>
        )}

        <FlavorSelection
          maxFlavors={maxFlavors}
          selectedFlavors={containerFlavors[currentContainer] || []}
          onFlavorSelect={handleFlavorSelection}
        />

        {quantity >= 2 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Resumen de selección
            </h3>
            {Object.entries(containerFlavors).map(([container, flavors]) => (
              <div key={container} className="mb-4">
                <h4 className="text-xl font-semibold text-gray-800">Pote {container}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {flavors.map((flavor) => (
                    <span
                      key={flavor}
                      className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm"
                    >
                      {flavor}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {quantity >= 2 && !allContainersSelected() && (
          <div className="mt-6 text-center text-orange-600">
            <AlertCircle className="w-6 h-6 inline-block mr-2" />
            <span>Por favor selecciona sabores para todos los potes</span>
          </div>
        )}
      </div>
    </section>
  )
}
