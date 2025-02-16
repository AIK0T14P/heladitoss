"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, Phone, Truck } from "lucide-react"
import { motion } from "framer-motion"
import { OrderTracker } from "./OrderTracker"

export default function Sections() {
  const [activeSection, setActiveSection] = useState("pedido")
  const [isOpen, setIsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkOpenStatus = () => {
      const argentinaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }))
      const hours = argentinaTime.getHours()

      setIsOpen(hours >= 11 && hours < 22)

      const millisecondsUntilNextMinute = (60 - argentinaTime.getSeconds()) * 1000 - argentinaTime.getMilliseconds()

      timeoutId = setTimeout(() => {
        setCurrentTime(new Date())
      }, millisecondsUntilNextMinute)
    }

    checkOpenStatus()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeSection === "pedido" ? "bg-purple-100 text-purple-700" : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveSection("pedido")}
        >
          Realizar Pedido
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeSection === "estado" ? "bg-purple-100 text-purple-700" : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveSection("estado")}
        >
          Estado del Pedido
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeSection === "info" ? "bg-purple-100 text-purple-700" : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveSection("info")}
        >
          Información del Local
        </button>
      </div>
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-4"
      >
        {activeSection === "pedido" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Realiza tu Pedido</h3>
            <p>Selecciona tus sabores favoritos y tamaño para comenzar tu pedido.</p>
          </div>
        )}
        {activeSection === "estado" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Estado de tu Pedido</h3>
            <OrderTracker />
          </div>
        )}
        {activeSection === "info" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Información de la Heladería</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <MapPin className="mr-2" /> Av. Siempre Viva 742, Springfield
              </p>
              <p className="flex items-center">
                <Clock className="mr-2" /> Lunes a Domingo: 11:00 - 22:00
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {isOpen ? "Abierto" : "Cerrado"}
                </span>
              </p>
              <p className="flex items-center">
                <Phone className="mr-2" /> +54 9 113017-1218
              </p>
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168878893506!2d-58.38375908477038!3d-34.60373888045943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4aa9f0a6da5edb%3A0x11bead4e234e558b!2sObelisco!5e0!3m2!1sen!2sar!4v1637268053631!5m2!1sen!2sar`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

