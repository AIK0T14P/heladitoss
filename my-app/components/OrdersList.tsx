"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { updateOrderStatus, deleteOrder } from "@/lib/actions"
import { motion, AnimatePresence } from "framer-motion"
import { ImageModal } from "@/components/ImageModal"
import { Badge } from "@/components/ui/badge"
import { Truck, CheckCircle, Clock, CookingPot, Package } from "lucide-react"

interface Order {
  id: string
  createdAt: string
  customerName: string
  size: string
  flavors: { [key: number]: string[] }
  status: "pending" | "preparing" | "ready" | "on-the-way" | "delivered"
  paymentMethod: string
  address: string
  phone: string
  additionalInfo?: string
  price: number
  quantity: number
  transferImage?: string
}

const hashKey = (key: string) => {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString()
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [enteredKey, setEnteredKey] = useState("")

  const checkAuthentication = useCallback(() => {
    const storedAuth = localStorage.getItem("authenticated")
    const storedKeyHash = localStorage.getItem("keyHash")
    const currentKeyHash = hashKey(process.env.NEXT_PUBLIC_PEDIDOS_KEY || "")

    if (storedAuth === "true" && storedKeyHash === currentKeyHash) {
      setIsAuthenticated(true)
    } else if (storedAuth === "true") {
      localStorage.removeItem("authenticated")
      localStorage.removeItem("keyHash")
      setIsAuthenticated(false)
    }
  }, [])

  useEffect(() => {
    checkAuthentication()
  }, [checkAuthentication])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        checkAuthentication()
      }
    }, 10000)
    return () => clearInterval(intervalId)
  }, [checkAuthentication, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      const eventSource = new EventSource("/api/orders/stream")

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setOrders(data)
      }

      return () => {
        eventSource.close()
      }
    } else {
      setOrders([])
    }
  }, [isAuthenticated])

  const handleAuthentication = () => {
    const currentKey = process.env.NEXT_PUBLIC_PEDIDOS_KEY
    if (enteredKey === currentKey) {
      setIsAuthenticated(true)
      localStorage.setItem("authenticated", "true")
      localStorage.setItem("keyHash", hashKey(currentKey || ""))
    } else {
      setIsAuthenticated(false)
      localStorage.removeItem("authenticated")
      localStorage.removeItem("keyHash")
      alert("Clave incorrecta")
    }
  }

  const handleStatusUpdate = async (orderId: string, status: Order["status"]) => {
    if (!isAuthenticated) {
      checkAuthentication()
      return
    }
    await updateOrderStatus(orderId, status)
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const handleDelete = async (orderId: string) => {
    if (!isAuthenticated) {
      checkAuthentication()
      return
    }
    await deleteOrder(orderId)
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
  }

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { color: "bg-yellow-100 border-yellow-500", icon: Clock, text: "Pendiente" }
      case "preparing":
        return { color: "bg-blue-100 border-blue-500", icon: CookingPot, text: "Preparando" }
      case "ready":
        return { color: "bg-green-100 border-green-500", icon: Package, text: "Listo" }
      case "on-the-way":
        return { color: "bg-purple-100 border-purple-500", icon: Truck, text: "En camino" }
      case "delivered":
        return { color: "bg-gray-100 border-gray-300", icon: CheckCircle, text: "Entregado" }
      default:
        return { color: "bg-gray-100 border-gray-300", icon: Clock, text: "Desconocido" }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="p-6 border rounded-md shadow-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Ingrese la clave de administrador</h2>
          <Input
            type="password"
            placeholder="Ingrese la clave"
            value={enteredKey}
            onChange={(e) => setEnteredKey(e.target.value)}
            className="w-full mb-4"
          />
          <Button onClick={handleAuthentication} className="w-full">
            Ingresar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {orders.map((order) => {
          const { color, icon: StatusIcon, text } = getStatusInfo(order.status)
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`w-full transition-colors duration-300 ${color} relative`}>
                <CardContent className="pt-6 max-w-full overflow-hidden">
                  <div className="grid gap-2 break-words max-w-full overflow-hidden">
                    <div className="flex justify-between items-center break-words">
                      <h3 className="font-semibold text-lg text-gray-900 break-words">{order.customerName}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <StatusIcon className="w-4 h-4" />
                        <span>{text}</span>
                      </Badge>
                    </div>
                    <div className="grid gap-1.5 text-sm break-words">
                      <p className="text-purple-700 font-medium break-words">
                        Tamaño: {order.size} (x{order.quantity})
                      </p>
                      <p className="text-green-700 font-medium break-words">Precio: {order.price?.toLocaleString()}</p>
                      <p className="text-blue-700 font-medium break-words">
                      </p>
                      <p className="text-red-700 font-medium break-words">
                      </p>
                      <div className="text-blue-700 break-words">
                        <p className="font-medium">Sabores:</p>
                        {Object.entries(order.flavors).map(([containerIndex, flavors]) => (
                          <p key={containerIndex} className="ml-2">
                            Pote {containerIndex}: {flavors.join(", ")}
                          </p>
                        ))}
                      </div>
                      <p className="text-gray-700 break-words">Dirección: {order.address}</p>
                      {order.additionalInfo && (
                        <p className="text-gray-700 bg-gray-50 p-2 rounded-md break-all overflow-hidden overflow-wrap-break-word max-w-full">
                          <span className="font-medium">Info adicional:</span> {order.additionalInfo}
                        </p>
                      )}
                      <p className="text-gray-700 break-words">Teléfono: {order.phone}</p>
                      <p className="text-gray-700 break-words">Método de pago: {order.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 absolute bottom-2 right-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                  {order.transferImage && <ImageModal imageUrl={order.transferImage} />}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  {order.status === "pending" ? (
                    <>
                      <Button
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
                        onClick={() => handleStatusUpdate(order.id, "preparing")}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
                        onClick={() => handleDelete(order.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className={`transform hover:scale-105 transition-all duration-200 ${
                          order.status === "preparing" ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-gray-200"
                        }`}
                        onClick={() => handleStatusUpdate(order.id, "ready")}
                        disabled={order.status !== "preparing"}
                      >
                        Preparando
                      </Button>
                      <Button
                        variant="outline"
                        className={`transform hover:scale-105 transition-all duration-200 ${
                          order.status === "ready" ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-200"
                        }`}
                        onClick={() => handleStatusUpdate(order.id, "on-the-way")}
                        disabled={order.status !== "ready"}
                      >
                        Listo
                      </Button>
                      <Button
                        variant="outline"
                        className={`transform hover:scale-105 transition-all duration-200 ${
                          order.status === "on-the-way" ? "bg-purple-500 text-white hover:bg-purple-600" : "bg-gray-200"
                        }`}
                        onClick={() => handleStatusUpdate(order.id, "delivered")}
                        disabled={order.status !== "on-the-way"}
                      >
                        En camino
                      </Button>
                      <Button
                        variant="outline"
                        className={`transform hover:scale-105 transition-all duration-200 ${
                          order.status === "delivered" ? "bg-gray-500 text-white hover:bg-gray-600" : "bg-gray-200"
                        }`}
                        disabled={order.status === "delivered"}
                      >
                        Entregado
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-red-500 text-white hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
                        onClick={() => handleDelete(order.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

