"use client"

import { useState, useEffect, useCallback, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import { useRouter } from "next/navigation"
import { createOrder } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { TransferPayment } from "@/components/TransferPayment"
import { ImageUpload } from "@/components/ImageUpload"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CustomerProfile {
  id: string
  profileName: string
  name: string
  phone: string
  address: string
  additionalInfo: string
}

interface FlavorSelection {
  [key: number]: string[]
}

export default function RealizarP() {
  const [profiles, setProfiles] = useState<CustomerProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    profileName: "",
    name: "",
    phone: "",
    address: "",
    additionalInfo: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedFlavors, setSelectedFlavors] = useState<FlavorSelection>({})
  const [quantity, setQuantity] = useState(1)
  const [orderTotal, setOrderTotal] = useState(0)
  const [transferImage, setTransferImage] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    const savedProfiles = localStorage.getItem("customerProfiles")
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles))
    }

    const storedSize = localStorage.getItem("selectedSize")
    if (storedSize) {
      setSelectedSize(storedSize)
    }

    const storedQuantity = localStorage.getItem("selectedQuantity")
    if (storedQuantity) {
      setQuantity(Number.parseInt(storedQuantity))
    }

    const storedFlavors = localStorage.getItem("containerFlavors")
    if (storedFlavors) {
      setSelectedFlavors(JSON.parse(storedFlavors))
    }
  }, [])

  const calculateTotal = useCallback(async () => {
    try {
      const response = await fetch("/api/sizes")
      const sizes = await response.json()
      const selectedSizeData = sizes.find((size: any) => size.nombre === selectedSize)
      const currentSizePrice = selectedSizeData ? selectedSizeData.precio : 0
      setOrderTotal(currentSizePrice * quantity)
    } catch (error) {
      console.error("Error calculating total:", error)
    }
  }, [selectedSize, quantity])

  useEffect(() => {
    calculateTotal()
  }, [calculateTotal])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value)
    setTransferImage(null)
  }

  const handleDeleteProfile = () => {
    if (!selectedProfile) {
      setError("Por favor, selecciona un perfil para eliminar.")
      return
    }

    const updatedProfiles = profiles.filter((profile) => profile.id !== selectedProfile)
    setProfiles(updatedProfiles)
    localStorage.setItem("customerProfiles", JSON.stringify(updatedProfiles))
    setSelectedProfile(null)
    setError("")
  }

  const handleEditProfile = () => {
    if (!selectedProfile) {
      setError("Por favor, selecciona un perfil para modificar.")
      return
    }

    const profileToEdit = profiles.find((profile) => profile.id === selectedProfile)
    if (profileToEdit) {
      setFormData(profileToEdit)
      setIsEditing(true)
      setShowForm(true)
    }
  }

  const handleSaveProfile = () => {
    if (!formData.profileName || !formData.name || !formData.phone || !formData.address) {
      setError("Por favor, completa todos los campos obligatorios.")
      return
    }

    let updatedProfiles
    if (isEditing && selectedProfile) {
      updatedProfiles = profiles.map((profile) =>
        profile.id === selectedProfile ? { ...profile, ...formData } : profile,
      )
    } else {
      const newProfile: CustomerProfile = {
        id: Date.now().toString(),
        ...formData,
      }
      updatedProfiles = [...profiles, newProfile]
    }

    setProfiles(updatedProfiles)
    localStorage.setItem("customerProfiles", JSON.stringify(updatedProfiles))
    setShowForm(false)
    setFormData({
      profileName: "",
      name: "",
      phone: "",
      address: "",
      additionalInfo: "",
    })
    setIsEditing(false)
    setSelectedProfile(null)
    setError("")
  }

  const handleSelectProfile = (id: string) => {
    setSelectedProfile(id)
    setError("")
  }

  const handleSubmit = async () => {
    if (!selectedProfile && profiles.length > 0) {
      setError("Por favor, selecciona un perfil para continuar.")
      return
    }

    if (profiles.length === 0) {
      setError("Por favor, agrega al menos un perfil de información.")
      return
    }

    if (!paymentMethod) {
      setError("Por favor, selecciona un método de pago.")
      return
    }

    if (!selectedSize) {
      setError("Por favor, selecciona un tamaño de helado.")
      return
    }

    const selectedProfileData = profiles.find((profile) => profile.id === selectedProfile)
    if (!selectedProfileData) {
      setError("Perfil seleccionado no encontrado.")
      return
    }

    for (let i = 1; i <= quantity; i++) {
      if (!selectedFlavors[i] || selectedFlavors[i].length === 0) {
        setError(`Por favor, selecciona al menos un sabor para el Pote ${i}.`)
        return
      }
    }

    if (paymentMethod === "transferencia" && !transferImage) {
      setError("Por favor, sube el comprobante de transferencia.")
      return
    }

    try {
      const result = await createOrder({
        customerName: selectedProfileData.name,
        phone: selectedProfileData.phone,
        address: selectedProfileData.address,
        additionalInfo: selectedProfileData.additionalInfo,
        paymentMethod,
        flavors: selectedFlavors,
        size: selectedSize,
        quantity,
        price: orderTotal,
        transferImage: transferImage ? await convertFileToBase64(transferImage) : null,
      })

      console.log("Order creation result:", result)

      if (result.success) {
        localStorage.removeItem("containerFlavors")
        localStorage.removeItem("selectedSize")
        localStorage.removeItem("selectedQuantity")

        if (result.orderId) {
          localStorage.setItem("lastOrderId", result.orderId)
        }

        router.push("/order-confirmation")
      } else {
        setError(result.error || "Error al enviar el pedido. Por favor, intenta nuevamente.")
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setError("Error inesperado al enviar el pedido. Por favor, intenta nuevamente.")
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Información del Cliente</h2>
      </div>

      {profiles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Perfiles guardados:</h3>
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`relative p-3 border rounded-lg mb-2 cursor-pointer overflow-hidden ${
                selectedProfile === profile.id ? "bg-purple-100 border-purple-500" : "bg-white"
              }`}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest(".dropdown-trigger")) {
                  handleSelectProfile(profile.id)
                }
              }}
            >
              <div className="absolute top-2 right-2 dropdown-trigger">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectProfile(profile.id)
                        handleEditProfile()
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Modificar perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectProfile(profile.id)
                        handleDeleteProfile()
                      }}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Eliminar perfil</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="break-words">
                <strong>Nombre del perfil:</strong> {profile.profileName}
              </p>
              <p className="break-words">
                <strong>Nombre:</strong> {profile.name}
              </p>
              <p className="break-words">
                <strong>Teléfono:</strong> {profile.phone}
              </p>
              <p className="break-words">
                <strong>Dirección:</strong> {profile.address}
              </p>
              {profile.additionalInfo && (
                <p className="break-words">
                  <strong>Información adicional:</strong> {profile.additionalInfo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition duration-300"
        >
          + Agregar nueva información
        </button>
      )}

      {showForm && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{isEditing ? "Modificar perfil" : "Agregar nuevo perfil"}:</h3>
          <input
            type="text"
            name="profileName"
            value={formData.profileName}
            onChange={handleInputChange}
            placeholder="Nombre del perfil (ej: Casa, Oficina)"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="name"
            maxLength={20}
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nombre de la persona"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md"
          />
          <input
            type="tel"
            name="phone"
            maxLength={50}
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Teléfono"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md"
          />
          <textarea
            name="address"
            maxLength={250}
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Dirección"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md"
          ></textarea>
          <textarea
            name="additionalInfo"
            maxLength={250}
            value={formData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Información adicional (ej: Portón negro, Auto rojo)"
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md"
          ></textarea>
          <button
            onClick={handleSaveProfile}
            className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition duration-300"
          >
            {isEditing ? "Guardar cambios" : "Guardar perfil"}
          </button>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Método de pago:</h3>
        <select
          value={paymentMethod}
          onChange={handlePaymentChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Selecciona un método de pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
        </select>
      </div>

      {paymentMethod === "transferencia" && (
        <TransferPayment
          alias="helado.delicia"
          orderTotal={orderTotal}
          onImageUpload={setTransferImage}
        />
      )}


      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Resumen del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Tamaño seleccionado:</h3>
            <p className="text-gray-600">{selectedSize || "Ninguno seleccionado"}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Cantidad:</h3>
            <p className="text-gray-600">{quantity}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Sabores seleccionados:</h3>
            {Object.keys(selectedFlavors).length > 0 ? (
              Object.entries(selectedFlavors).map(([container, flavors]) => (
                <div key={container} className="mb-4">
                  <h4 className="font-medium mb-2">Pote {Number.parseInt(container)}</h4>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map((flavor: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined, index: Key | null | undefined) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Ningún sabor seleccionado</p>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Precio del producto:</h3>
            <p className="text-gray-600">ARS ${orderTotal.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Total:</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition duration-300"
      >
        Enviar pedido
      </button>
    </div>
  )
}

