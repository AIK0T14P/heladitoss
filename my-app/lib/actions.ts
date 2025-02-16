"use server"

import { promises as fs } from "fs"
import path from "path"
import { revalidatePath } from "next/cache"

const ordersPath = path.join(process.cwd(), "data/orders.json")

export async function getOrders() {
  try {
    const ordersData = await fs.readFile(ordersPath, "utf8")
    return JSON.parse(ordersData)
  } catch (error) {
    console.error("Error reading orders:", error)
    return []
  }
}

export async function createOrder(orderData: any) {
  try {
    const orderId = Date.now().toString()
    // Get the price from sizes.json based on the size
    const sizesData = await fs.readFile(path.join(process.cwd(), "data/sizes.json"), "utf8")
    const sizes = JSON.parse(sizesData)
    const selectedSize = sizes.find((size: any) => size.nombre === orderData.size)
    const price = selectedSize ? selectedSize.precio : 0

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: "pending",
      price,
      ...orderData,
    }

    const orders = await getOrders()
    const updatedOrders = [...orders, newOrder]
    await fs.writeFile(ordersPath, JSON.stringify(updatedOrders, null, 2))
    revalidatePath("/pedidos")
    return { success: true, orderId }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: "Error al crear el pedido" }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const orders = await getOrders()
    const updatedOrders = orders.map((order: any) => (order.id === orderId ? { ...order, status } : order))
    await fs.writeFile(ordersPath, JSON.stringify(updatedOrders, null, 2))
    revalidatePath("/pedidos")
    return { success: true }
  } catch (error) {
    console.error("Error updating order:", error)
    return { success: false, error: "Error al actualizar el pedido" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const orders = await getOrders()
    const updatedOrders = orders.filter((order: any) => order.id !== orderId)
    await fs.writeFile(ordersPath, JSON.stringify(updatedOrders, null, 2))
    revalidatePath("/pedidos")
    return { success: true }
  } catch (error) {
    console.error("Error deleting order:", error)
    return { success: false, error: "Error al eliminar el pedido" }
  }
}

