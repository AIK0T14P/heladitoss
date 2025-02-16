"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, CookingPot, Package, Truck, CheckCircle } from "lucide-react"
import React from "react"

interface Order {
  id: string
  createdAt: string
  status: "pending" | "preparing" | "ready" | "on-the-way" | "delivered"
  customerName: string
  size: string
  flavors: { [key: number]: string[] }
  quantity: number
  price: number
  paymentMethod: string
}

export function OrderTracker() {
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedOrderId = localStorage.getItem("lastOrderId")
    if (savedOrderId) {
      fetchOrder(savedOrderId)
    }
  }, [])

  const fetchOrder = async (orderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error("Order not found")
      }
      const data = await response.json()
      setOrder(data)
      setError("")
      setLoading(false)
    } catch (err) {
      setOrder(null)
      setError("No se pudo encontrar el pedido. Por favor, intenta más tarde.")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (order) {
      const eventSource = new EventSource(`/api/orders/${order.id}?stream=true`)
      eventSource.onmessage = (event) => {
        const updatedOrder = JSON.parse(event.data)
        setOrder(updatedOrder)
      }
      eventSource.onerror = () => {
        eventSource.close()
        setError("Error en la conexión. Actualizaciones en tiempo real no disponibles.")
      }
      return () => eventSource.close()
    }
  }, [order])

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { color: "bg-yellow-100 border-yellow-500 text-yellow-700", icon: Clock, text: "Pendiente" }
      case "preparing":
        return { color: "bg-blue-100 border-blue-500 text-blue-700", icon: CookingPot, text: "Preparando" }
      case "ready":
        return { color: "bg-green-100 border-green-500 text-green-700", icon: Package, text: "Listo para entregar" }
      case "on-the-way":
        return { color: "bg-purple-100 border-purple-500 text-purple-700", icon: Truck, text: "En camino" }
      case "delivered":
        return { color: "bg-gray-100 border-gray-500 text-gray-700", icon: CheckCircle, text: "Entregado" }
      default:
        return { color: "bg-gray-100 border-gray-300 text-gray-700", icon: Clock, text: "Desconocido" }
    }
  }

  const clearOrder = () => {
    localStorage.removeItem("lastOrderId")
    setOrder(null)
  }

  const steps = [
    { status: "pending", label: "Pendiente" },
    { status: "preparing", label: "Preparando" },
    { status: "ready", label: "Listo" },
    { status: "on-the-way", label: "En camino" },
    { status: "delivered", label: "Entregado" },
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Estado de tu Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : order ? (
          <div className="space-y-6">
            <div className={`p-4 rounded-md border ${getStatusInfo(order.status).color}`}>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                {getStatusInfo(order.status).icon &&
                  React.createElement(getStatusInfo(order.status).icon, { className: "mr-2 h-5 w-5" })}
                Estado: {getStatusInfo(order.status).text}
              </h3>
              <p>Pedido #{order.id}</p>
              <p>Cliente: {order.customerName}</p>
              <p>Creado el: {new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between w-full">
              {steps.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      steps.findIndex((s) => s.status === order.status) >= index
                        ? getStatusInfo(step.status as Order["status"]).color
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {getStatusInfo(step.status as Order["status"]).icon &&
                      React.createElement(getStatusInfo(step.status as Order["status"]).icon, { className: "w-4 h-4" })}
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-600">{step.label}</p>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-full mt-2 ${
                        steps.findIndex((s) => s.status === order.status) > index ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Detalles del pedido:</h4>
              <p>Tamaño: {order.size}</p>
              <p>Cantidad: {order.quantity}</p>
              <div>
                <p className="font-medium">Sabores:</p>
                {Object.entries(order.flavors).map(([container, flavors]) => (
                  <p key={container} className="ml-4">
                    Pote {container}: {flavors.join(", ")}
                  </p>
                ))}
              </div>
              <p>Método de pago: {order.paymentMethod}</p>
              <p>Precio: ARS ${order.price.toLocaleString()}</p>
            </div>
            <Button onClick={clearOrder} variant="outline" className="w-full">
              Limpiar seguimiento
            </Button>
          </div>
        ) : (
          <p className="text-center py-4">No hay pedidos activos. Realiza un nuevo pedido para ver su estado aquí.</p>
        )}
      </CardContent>
    </Card>
  )
}

