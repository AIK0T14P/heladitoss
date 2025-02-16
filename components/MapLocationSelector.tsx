"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Location {
  lat: number
  lng: number
  address: string
}

interface MapLocationSelectorProps {
  onLocationSelected: (location: Location) => void
}

export function MapLocationSelector({ onLocationSelected }: MapLocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleSelectLocation = async () => {
    try {
      const autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("location-input") as HTMLInputElement,
        {
          componentRestrictions: { country: "AR" },
          fields: ["geometry", "formatted_address"],
        },
      )

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place.geometry && place.geometry.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || "",
          }
          setSelectedLocation(location)
          onLocationSelected(location)
        }
      })
    } catch (error) {
      console.error("Error initializing Google Maps:", error)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="location-input" className="text-sm font-medium">
            Ingresa tu ubicación
          </label>
          <input
            id="location-input"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Buscar dirección..."
          />
        </div>
        <Button onClick={handleSelectLocation} className="w-full">
          Seleccionar ubicación
        </Button>
        {selectedLocation && (
          <div className="text-sm">
            <p className="font-medium">Ubicación seleccionada:</p>
            <p className="text-gray-600">{selectedLocation.address}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

