import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageUpload: (file: File | null) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageUpload(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      onImageUpload(null)
      setPreviewUrl(null)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
      <Button onClick={handleButtonClick} variant="outline" className="w-full">
        {previewUrl ? "Cambiar imagen" : "Seleccionar imagen"}
      </Button>
      {previewUrl && (
        <div className="mt-4">
          <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="max-w-full h-auto rounded-lg" />
        </div>
      )}
    </div>
  )
}

