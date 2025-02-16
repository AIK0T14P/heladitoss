"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { updateSizes, updateFlavors, getInitialData } from "./actions"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "../sortable-item"

interface Size {
  nombre: string
  precio: number
  maxSabores: number
}

interface NewSize {
  nombre: string
  precio: number
  maxSabores: number
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

export default function AdminPage() {
  const [sizes, setSizes] = useState<Size[]>([])
  const [flavors, setFlavors] = useState<string[]>([])
  const [newFlavor, setNewFlavor] = useState<string>("")
  const [newSize, setNewSize] = useState<NewSize>({
    nombre: "",
    precio: 0,
    maxSabores: 0,
  })
  const [editingSize, setEditingSize] = useState<{ size: Size; originalName: string } | null>(null)
  const [isChanged, setIsChanged] = useState<boolean>(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [enteredKey, setEnteredKey] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const checkAuthentication = useCallback(() => {
    const storedAuth = localStorage.getItem("authenticated")
    const storedKeyHash = localStorage.getItem("keyHash")
    const currentKeyHash = hashKey(process.env.NEXT_PUBLIC_ADMIN_KEY_V2 || "")

    if (storedAuth === "true" && storedKeyHash === currentKeyHash) {
      return true
    }
    return false
  }, [])

  useEffect(() => {
    const isAuth = checkAuthentication()
    setIsAuthenticated(isAuth)

    if (isAuth) {
      getInitialData().then((data: { sizes: Size[]; flavors: string[] }) => {
        setSizes(data.sizes)
        setFlavors(data.flavors)
      })
    }
  }, [checkAuthentication])

  const handleAuthentication = () => {
    const currentKey = process.env.NEXT_PUBLIC_ADMIN_KEY_V2
    if (enteredKey === currentKey) {
      setIsAuthenticated(true)
      localStorage.setItem("authenticated", "true")
      localStorage.setItem("keyHash", hashKey(currentKey || ""))
      getInitialData().then((data: { sizes: Size[]; flavors: string[] }) => {
        setSizes(data.sizes)
        setFlavors(data.flavors)
      })
    } else {
      alert("Clave incorrecta")
    }
    setEnteredKey("")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("authenticated")
    localStorage.removeItem("keyHash")
    setSizes([])
    setFlavors([])
    setIsChanged(false)
  }

  const handleAddFlavor = (): void => {
    if (newFlavor.trim()) {
      setFlavors([...flavors, newFlavor.trim()])
      setNewFlavor("")
      setIsChanged(true)
    }
  }

  const handleRemoveFlavor = (flavorToRemove: string): void => {
    setFlavors((prevFlavors) => prevFlavors.filter((flavor) => flavor !== flavorToRemove))
    setIsChanged(true)
  }

  const handleAddSize = (): void => {
    if (newSize.nombre && newSize.precio > 0 && newSize.maxSabores > 0) {
      setSizes([...sizes, newSize])
      setNewSize({ nombre: "", precio: 0, maxSabores: 0 })
      setIsChanged(true)
    }
  }

  const handleRemoveSize = (nombre: string): void => {
    setSizes(sizes.filter((s) => s.nombre !== nombre))
    setIsChanged(true)
  }

  const handleEditSize = (size: Size): void => {
    setEditingSize({ size: { ...size }, originalName: size.nombre })
  }

  const handleUpdateSize = (): void => {
    if (!editingSize) return
    setSizes((prevSizes) => prevSizes.map((s) => (s.nombre === editingSize.originalName ? editingSize.size : s)))
    setEditingSize(null)
    setIsChanged(true)
  }

  const handleSave = async (): Promise<void> => {
    await updateSizes(sizes)
    await updateFlavors(flavors)
    setIsChanged(false)
    alert("Cambios guardados exitosamente")
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setFlavors((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
      setIsChanged(true)
    }
    setActiveId(null)
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button onClick={handleLogout} variant="outline">
          Cerrar sesión
        </Button>
      </div>

      <Tabs defaultValue="sizes" className="w-full">
        <TabsList>
          <TabsTrigger value="sizes">Tamaños y Precios</TabsTrigger>
          <TabsTrigger value="flavors">Sabores</TabsTrigger>
        </TabsList>

        <TabsContent value="sizes" className="space-y-6">
          <div className="grid gap-4 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold">Tamaños Actuales</h2>
            <div className="grid gap-4">
              {sizes.map((size) => (
                <div key={size.nombre} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{size.nombre}</p>
                    <p className="text-sm text-gray-600">
                      Precio: ${size.precio} - Máx Sabores: {size.maxSabores}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => handleEditSize(size)}>
                          Modificar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modificar Tamaño</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-nombre" className="text-right">
                              Nombre
                            </Label>
                            <Input
                              id="edit-nombre"
                              value={editingSize?.size.nombre || ""}
                              onChange={(e) =>
                                setEditingSize((prev) =>
                                  prev ? { ...prev, size: { ...prev.size, nombre: e.target.value } } : null,
                                )
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-precio" className="text-right">
                              Precio
                            </Label>
                            <Input
                              id="edit-precio"
                              type="number"
                              value={editingSize?.size.precio || 0}
                              onChange={(e) =>
                                setEditingSize((prev) =>
                                  prev ? { ...prev, size: { ...prev.size, precio: Number(e.target.value) } } : null,
                                )
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-maxSabores" className="text-right">
                              Máx Sabores
                            </Label>
                            <Input
                              id="edit-maxSabores"
                              type="number"
                              value={editingSize?.size.maxSabores || 0}
                              onChange={(e) =>
                                setEditingSize((prev) =>
                                  prev ? { ...prev, size: { ...prev.size, maxSabores: Number(e.target.value) } } : null,
                                )
                              }
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <Button onClick={handleUpdateSize}>Guardar Cambios</Button>
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" onClick={() => handleRemoveSize(size.nombre)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 p-4 border rounded-lg">
              <h3 className="font-medium">Agregar Nuevo Tamaño</h3>
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={newSize.nombre}
                  onChange={(e) => setNewSize({ ...newSize, nombre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  value={newSize.precio}
                  onChange={(e) => setNewSize({ ...newSize, precio: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxSabores">Máximo de Sabores</Label>
                <Input
                  id="maxSabores"
                  type="number"
                  value={newSize.maxSabores}
                  onChange={(e) => setNewSize({ ...newSize, maxSabores: Number(e.target.value) })}
                />
              </div>
              <Button onClick={handleAddSize}>Agregar Tamaño</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="flavors" className="space-y-6">
          <div className="grid gap-4 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold">Sabores Actuales</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={flavors} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {flavors.map((flavor) => (
                    <SortableItem key={flavor} id={flavor} onRemove={handleRemoveFlavor}>
                      {flavor}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-lg">
                    <span>{activeId}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            <div className="grid gap-4 p-4 border rounded-lg mt-4">
              <h3 className="font-medium">Agregar Nuevo Sabor</h3>
              <div className="flex gap-2">
                <Input
                  value={newFlavor}
                  onChange={(e) => setNewFlavor(e.target.value)}
                  placeholder="Nombre del sabor"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddFlavor()
                    }
                  }}
                />
                <Button onClick={handleAddFlavor}>Agregar</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={!isChanged}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}

