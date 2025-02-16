"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight } from "lucide-react"

export default function FlavorSelection({
  maxFlavors,
  selectedFlavors,
  onFlavorSelect,
}: {
  maxFlavors: number
  selectedFlavors: string[]
  onFlavorSelect: (flavors: string[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [sabores, setSabores] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/flavors")
      .then((res) => res.json())
      .then((data) => setSabores(data))
      .catch((err) => console.error("Error loading flavors:", err))
  }, [])

  const toggleFlavor = (flavor: string) => {
    const updatedFlavors = selectedFlavors.includes(flavor)
      ? selectedFlavors.filter((f) => f !== flavor)
      : selectedFlavors.length < maxFlavors
        ? [...selectedFlavors, flavor]
        : selectedFlavors

    onFlavorSelect(updatedFlavors)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-lg font-medium text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-50"
      >
        <span>Selecciona hasta {maxFlavors} sabores</span>
        {isOpen ? <ChevronRight className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sabores.map((sabor) => (
                <motion.div
                  key={sabor}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedFlavors.includes(sabor) ? "bg-purple-100 border-purple-500" : "bg-gray-100 border-gray-300"
                  }`}
                  onClick={() => toggleFlavor(sabor)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800">{sabor}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-6 text-center text-lg font-semibold text-gray-800">
        Sabores seleccionados: {selectedFlavors.length}/{maxFlavors}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {selectedFlavors.map((flavor) => (
          <span key={flavor} className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
            {flavor}
          </span>
        ))}
      </div>
    </div>
  )
}

